import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET PRESCRIPTIONS
// =====================================================

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    // -------------------------------------------------
    // ADMIN: GET ALL PRESCRIPTIONS
    // GET /api/prescriptions
    // -------------------------------------------------

    if (!patientId) {
      const prescriptions = await prisma.prescription.findMany({
        orderBy: {
          refillOn: "asc",
        },
        include: {
          patient: true,
        },
      });

      return NextResponse.json({
        prescriptions,
      });
    }

    // -------------------------------------------------
    // PATIENT: GET PRESCRIPTIONS FOR ONE PATIENT
    // GET /api/prescriptions?patientId=1
    // -------------------------------------------------

    const id = Number(patientId);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: "Invalid patient ID.",
        },
        {
          status: 400,
        }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: id,
      },
      orderBy: {
        refillOn: "asc",
      },
      include: {
        patient: true,
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
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// CREATE PRESCRIPTION
// =====================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      patientId,
      medication,
      dosage,
      quantity,
      refillOn,
      refillSchedule,
    } = body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !patientId ||
      !medication ||
      !dosage ||
      quantity === undefined ||
      quantity === null ||
      !refillOn ||
      !refillSchedule
    ) {
      return NextResponse.json(
        {
          error:
            "Patient, medication, dosage, quantity, refill date, and refill schedule are required.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedPatientId = Number(patientId);
    const parsedQuantity = Number(quantity);
    const parsedRefillOn = new Date(refillOn);

    if (Number.isNaN(parsedPatientId)) {
      return NextResponse.json(
        {
          error: "Invalid patient ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return NextResponse.json(
        {
          error: "Quantity must be a positive number.",
        },
        {
          status: 400,
        }
      );
    }

    if (Number.isNaN(parsedRefillOn.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid refill date.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // CHECK PATIENT EXISTS
    // -------------------------------------------------

    const patient = await prisma.patient.findUnique({
      where: {
        id: parsedPatientId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -------------------------------------------------
    // CREATE PRESCRIPTION
    // -------------------------------------------------

    const prescription = await prisma.prescription.create({
      data: {
        patientId: parsedPatientId,
        medication: String(medication),
        dosage: String(dosage),
        quantity: parsedQuantity,
        refillOn: parsedRefillOn,
        refillSchedule: String(refillSchedule),
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json(
      {
        message: "Prescription created successfully.",
        prescription,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Prescriptions POST error:", error);

    return NextResponse.json(
      {
        error: "Unable to create prescription.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// UPDATE PRESCRIPTION
// =====================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      patientId,
      medication,
      dosage,
      quantity,
      refillOn,
      refillSchedule,
    } = body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !id ||
      !patientId ||
      !medication ||
      !dosage ||
      quantity === undefined ||
      quantity === null ||
      !refillOn ||
      !refillSchedule
    ) {
      return NextResponse.json(
        {
          error:
            "Prescription ID, patient, medication, dosage, quantity, refill date, and refill schedule are required.",
        },
        {
          status: 400,
        }
      );
    }

    const prescriptionId = Number(id);
    const parsedPatientId = Number(patientId);
    const parsedQuantity = Number(quantity);
    const parsedRefillOn = new Date(refillOn);

    if (Number.isNaN(prescriptionId)) {
      return NextResponse.json(
        {
          error: "Invalid prescription ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (Number.isNaN(parsedPatientId)) {
      return NextResponse.json(
        {
          error: "Invalid patient ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return NextResponse.json(
        {
          error: "Quantity must be a positive number.",
        },
        {
          status: 400,
        }
      );
    }

    if (Number.isNaN(parsedRefillOn.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid refill date.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // CHECK PRESCRIPTION EXISTS
    // -------------------------------------------------

    const existingPrescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!existingPrescription) {
      return NextResponse.json(
        {
          error: "Prescription not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -------------------------------------------------
    // CHECK PATIENT EXISTS
    // -------------------------------------------------

    const patient = await prisma.patient.findUnique({
      where: {
        id: parsedPatientId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -------------------------------------------------
    // UPDATE PRESCRIPTION
    // -------------------------------------------------

    const prescription = await prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        patientId: parsedPatientId,
        medication: String(medication),
        dosage: String(dosage),
        quantity: parsedQuantity,
        refillOn: parsedRefillOn,
        refillSchedule: String(refillSchedule),
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      message: "Prescription updated successfully.",
      prescription,
    });
  } catch (error) {
    console.error("Prescriptions PUT error:", error);

    return NextResponse.json(
      {
        error: "Unable to update prescription.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE PRESCRIPTION
// =====================================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!id) {
      return NextResponse.json(
        {
          error: "Prescription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const prescriptionId = Number(id);

    if (Number.isNaN(prescriptionId)) {
      return NextResponse.json(
        {
          error: "Invalid prescription ID.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // CHECK PRESCRIPTION EXISTS
    // -------------------------------------------------

    const existingPrescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!existingPrescription) {
      return NextResponse.json(
        {
          error: "Prescription not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -------------------------------------------------
    // DELETE PRESCRIPTION
    // -------------------------------------------------

    await prisma.prescription.delete({
      where: {
        id: prescriptionId,
      },
    });

    return NextResponse.json({
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    console.error("Prescriptions DELETE error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete prescription.",
      },
      {
        status: 500,
      }
    );
  }
}
