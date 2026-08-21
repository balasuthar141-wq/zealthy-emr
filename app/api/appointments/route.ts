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

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: id,
      },
      orderBy: {
        datetime: "asc",
      },
    });

    const now = new Date();

    const upcomingAppointments = appointments.flatMap((appointment) => {
      let currentDate = new Date(appointment.datetime);

      if (appointment.repeat === "none") {
        if (currentDate >= now) {
          return [
            {
              ...appointment,
              datetime: currentDate,
            },
          ];
        }

        return [];
      }

      while (currentDate < now) {
        if (appointment.repeat === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (appointment.repeat === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          break;
        }
      }

      if (currentDate >= now) {
        return [
          {
            ...appointment,
            datetime: currentDate,
          },
        ];
      }

      return [];
    });

    return NextResponse.json({
      appointments: upcomingAppointments,
    });
  } catch (error) {
    console.error("Appointments GET error:", error);

    return NextResponse.json(
      { error: "Unable to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { patientId, provider, datetime, repeat } = body;

    if (!patientId || !provider || !datetime) {
      return NextResponse.json(
        {
          error: "Patient, provider, and date/time are required.",
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

    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number(patientId),
        provider,
        datetime: new Date(datetime),
        repeat: repeat || "none",
      },
    });

    return NextResponse.json(
      {
        message: "Appointment created successfully.",
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointments POST error:", error);

    return NextResponse.json(
      { error: "Unable to create appointment." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { id, patientId, provider, datetime, repeat } = body;

    if (!id || !patientId || !provider || !datetime) {
      return NextResponse.json(
        {
          error:
            "Appointment ID, patient, provider, and date/time are required.",
        },
        { status: 400 }
      );
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
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

    const appointment = await prisma.appointment.update({
      where: {
        id: Number(id),
      },
      data: {
        patientId: Number(patientId),
        provider,
        datetime: new Date(datetime),
        repeat: repeat || "none",
      },
    });

    return NextResponse.json({
      message: "Appointment updated successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Appointments PUT error:", error);

    return NextResponse.json(
      { error: "Unable to update appointment." },
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
        { error: "Appointment ID is required." },
        { status: 400 }
      );
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error("Appointments DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to delete appointment." },
      { status: 500 }
    );
  }
}
