import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/prescriptions
 *
 * Without patientId:
 *   Returns ALL prescriptions.
 *
 * With patientId:
 *   Returns prescriptions for that specific patient.
 *
 * Examples:
 *   /api/prescriptions
 *   /api/prescriptions?patientId=4
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    // --------------------------------------------------
    // GET PRESCRIPTIONS FOR A SPECIFIC PATIENT
    // --------------------------------------------------
    if (patientId) {
      const id = Number(patientId);

      if (Number.isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid patient ID." },
          { status: 400 }
        );
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id,
        },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found." },
          { status: 404 }
        );
      }

      const prescriptions = await prisma.prescription.findMany({
        where: {
          patientId: id,
        },
        orderBy: {
          refillOn: "asc",
        },
      });

      return NextResponse.json({
        prescriptions,
      });
    }

    // --------------------------------------------------
    // GET ALL PRESCRIPTIONS
    // Used by the Admin page
    // --------------------------------------------------
    const prescriptions = await prisma.prescription.findMany({
      orderBy: {
        refillOn: "asc",
      },
    });

    return NextResponse.json({
      prescriptions,
    });
  } catch (error) {
    console.error("Prescriptions GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch prescriptions.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prescriptions
 *
 * Creates a new prescription.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      patientId,
      medication,
      dosage,
      instructions,
      refillOn,
    } = body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------
    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required." },
        { status: 400 }
      );
    }

    if (!medication) {
      return NextResponse.json(
        { error: "Medication is required." },
        { status: 400 }
      );
    }

    const id = Number(patientId);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid patient ID." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CHECK PATIENT EXISTS
    // --------------------------------------------------
    const patient = await prisma.patient.findUnique({
      where: {
        id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // CREATE PRESCRIPTION
    // --------------------------------------------------
    const prescription = await prisma.prescription.create({
      data: {
        patientId: id,
        medication,
        dosage: dosage || null,
        instructions: instructions || null,
        refillOn: refillOn ? new Date(refillOn) : null,
      },
    });

    return NextResponse.json(
      {
        prescription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Prescriptions POST error:", error);

    return NextResponse.json(
      {
        error: "Unable to create prescription.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prescriptions
 *
 * Updates an existing prescription.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      patientId,
      medication,
      dosage,
      instructions,
      refillOn,
    } = body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------
    if (!id) {
      return NextResponse.json(
        { error: "Prescription ID is required." },
        { status: 400 }
      );
    }

    const prescriptionId = Number(id);

    if (Number.isNaN(prescriptionId)) {
      return NextResponse.json(
        { error: "Invalid prescription ID." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CHECK PRESCRIPTION EXISTS
    // --------------------------------------------------
    const existingPrescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!existingPrescription) {
      return NextResponse.json(
        { error: "Prescription not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // BUILD UPDATE DATA
    // --------------------------------------------------
    const updateData: any = {};

    if (patientId !== undefined) {
      const parsedPatientId = Number(patientId);

      if (Number.isNaN(parsedPatientId)) {
        return NextResponse.json(
          { error: "Invalid patient ID." },
          { status: 400 }
        );
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: parsedPatientId,
        },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found." },
          { status: 404 }
        );
      }

      updateData.patientId = parsedPatientId;
    }

    if (medication !== undefined) {
      updateData.medication = medication;
    }

    if (dosage !== undefined) {
      updateData.dosage = dosage || null;
    }

    if (instructions !== undefined) {
      updateData.instructions = instructions || null;
    }

    if (refillOn !== undefined) {
      updateData.refillOn = refillOn
        ? new Date(refillOn)
        : null;
    }

    // --------------------------------------------------
    // UPDATE PRESCRIPTION
    // --------------------------------------------------
    const prescription = await prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: updateData,
    });

    return NextResponse.json({
      prescription,
    });
  } catch (error) {
    console.error("Prescriptions PUT error:", error);

    return NextResponse.json(
      {
        error: "Unable to update prescription.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prescriptions?id=1
 *
 * Deletes an existing prescription.
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------
    if (!id) {
      return NextResponse.json(
        { error: "Prescription ID is required." },
        { status: 400 }
      );
    }

    const prescriptionId = Number(id);

    if (Number.isNaN(prescriptionId)) {
      return NextResponse.json(
        { error: "Invalid prescription ID." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CHECK PRESCRIPTION EXISTS
    // --------------------------------------------------
    const existingPrescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!existingPrescription) {
      return NextResponse.json(
        { error: "Prescription not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // DELETE PRESCRIPTION
    // --------------------------------------------------
    await prisma.prescription.delete({
      where: {
        id: prescriptionId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    console.error("Prescriptions DELETE error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete prescription.",
      },
      { status: 500 }
    );
  }
}
