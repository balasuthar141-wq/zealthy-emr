import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required." },
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
  } catch (error) {
    console.error("Prescriptions GET error:", error);

    return NextResponse.json(
      { error: "Unable to fetch prescriptions." },
      { status: 500 }
    );
  }
}

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

    if (
      !patientId ||
      !medication ||
      !dosage ||
      quantity === undefined ||
      !refillOn ||
      !refillSchedule
    ) {
      return NextResponse.json(
        {
          error:
            "Patient, medication, dosage, quantity, refill date, and refill schedule are required.",
        },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id: Number(patientId),
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: Number(patientId),
        medication,
        dosage,
        quantity: Number(quantity),
        refillOn: new Date(refillOn),
        refillSchedule,
      },
    });

    return NextResponse.json(
      {
        message: "Prescription created successfully.",
        prescription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Prescriptions POST error:", error);

    return NextResponse.json(
      { error: "Unable to create prescription." },
      { status: 500 }
    );
  }
}

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

    if (
      !id ||
      !patientId ||
      !medication ||
      !dosage ||
      quantity === undefined ||
      !refillOn ||
      !refillSchedule
    ) {
      return NextResponse.json(
        {
          error:
            "Prescription ID, patient, medication, dosage, quantity, refill date, and refill schedule are required.",
        },
        { status: 400 }
      );
    }

    const existingPrescription = await prisma.prescription.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPrescription) {
      return NextResponse.json(
        { error: "Prescription not found." },
        { status: 404 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id: Number(patientId),
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    const prescription = await prisma.prescription.update({
      where: {
        id: Number(id),
      },
      data: {
        patientId: Number(patientId),
        medication,
        dosage,
        quantity: Number(quantity),
        refillOn: new Date(refillOn),
        refillSchedule,
      },
    });

    return NextResponse.json({
      message: "Prescription updated successfully.",
      prescription,
    });
  } catch (error) {
    console.error("Prescriptions PUT error:", error);

    return NextResponse.json(
      { error: "Unable to update prescription." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Prescription ID is required." },
        { status: 400 }
      );
    }

    const existingPrescription = await prisma.prescription.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPrescription) {
      return NextResponse.json(
        { error: "Prescription not found." },
        { status: 404 }
      );
    }

    await prisma.prescription.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    console.error("Prescriptions DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to delete prescription." },
      { status: 500 }
    );
  }
}
