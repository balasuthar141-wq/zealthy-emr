import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    console.log("Patient API patientId:", patientId);

    if (!patientId) {
      return NextResponse.json(
        {
          error: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    const id = Number(patientId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid patient ID.",
        },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      patient,
    });
  } catch (error) {
    console.error("Patient GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load patient information.",
      },
      { status: 500 }
    );
  }
}
