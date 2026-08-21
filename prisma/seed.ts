import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import data from "../data/data.json";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");

  // Clear existing data so the seed can safely be run again
  await prisma.appointment.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.patient.deleteMany();

  for (const user of data.users) {
    const patient = await prisma.patient.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,

        appointments: {
          create: user.appointments.map((appointment) => ({
            id: appointment.id,
            provider: appointment.provider,
            datetime: new Date(appointment.datetime),
            repeat: appointment.repeat,
          })),
        },

        prescriptions: {
          create: user.prescriptions.map((prescription) => ({
            id: prescription.id,
            medication: prescription.medication,
            dosage: prescription.dosage,
            quantity: prescription.quantity,
            refillOn: new Date(prescription.refill_on),
            refillSchedule: prescription.refill_schedule,
          })),
        },
      },
    });

    console.log(`Created patient: ${patient.name}`);
  }

  console.log("Database seed completed!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });