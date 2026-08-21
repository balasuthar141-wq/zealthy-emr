import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      patients,
    });
  } catch (error) {
    console.error("Patients GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load patients.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    const existingPatient = await prisma.patient.findUnique({
      where: {
        email,
      },
    });

    if (existingPatient) {
      return NextResponse.json(
        {
          error: "A patient with this email already exists.",
        },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(
      {
        message: "Patient created successfully.",
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Patients POST error:", error);

    return NextResponse.json(
      {
        error: "Unable to create patient.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { id, name, email, password } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        {
          error: "Patient ID, name, and email are required.",
        },
        { status: 400 }
      );
    }

    const existingPatient = await prisma.patient.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPatient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        { status: 404 }
      );
    }

    const emailOwner = await prisma.patient.findUnique({
      where: {
        email,
      },
    });

    if (emailOwner && emailOwner.id !== Number(id)) {
      return NextResponse.json(
        {
          error: "Another patient already uses this email.",
        },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
        ...(password ? { password } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      message: "Patient updated successfully.",
      patient,
    });
  } catch (error) {
    console.error("Patients PUT error:", error);

    return NextResponse.json(
      {
        error: "Unable to update patient.",
      },
      { status: 500 }
    );
  }
}