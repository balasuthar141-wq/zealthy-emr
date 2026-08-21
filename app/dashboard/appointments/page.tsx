"use client";

import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const patientId = localStorage.getItem("patientId");

        if (!patientId) {
          setError("Patient session not found. Please log in again.");
          return;
        }

        const response = await fetch(
          `/api/appointments?patientId=${patientId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load appointments.");
          return;
        }

        setAppointments(data.appointments || []);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading appointments...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <a
            href="/dashboard"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Appointments
            </h1>

            <p className="mt-2 text-gray-600">
              Your upcoming appointments
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Back to Dashboard
          </a>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              You have no upcoming appointments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {appointment.provider}
                </h2>

                <div className="mt-3 space-y-2 text-gray-600">
                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {new Date(appointment.datetime).toLocaleString()}
                  </p>

                  <p>
                    <strong>Repeat:</strong> {appointment.repeat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
