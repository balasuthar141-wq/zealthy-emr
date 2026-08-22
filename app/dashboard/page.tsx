"use client";

import { useEffect, useMemo, useState } from "react";

type Patient = {
  id: number;
  name: string;
  email: string;
};

type Appointment = {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
};

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: string;
};

export default function Dashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const patientId = localStorage.getItem("patientId");

        if (!patientId) {
          setError("Patient session not found. Please log in again.");
          setLoading(false);
          return;
        }

        const [
          patientResponse,
          appointmentResponse,
          prescriptionResponse,
        ] = await Promise.all([
          fetch(`/api/patient?patientId=${patientId}`),
          fetch(`/api/appointments?patientId=${patientId}`),
          fetch(`/api/prescriptions?patientId=${patientId}`),
        ]);

        const patientData = await patientResponse.json();
        const appointmentData = await appointmentResponse.json();
        const prescriptionData = await prescriptionResponse.json();

        if (!patientResponse.ok) {
          setError(
            patientData.error ||
              "Unable to load patient information."
          );
          return;
        }

        if (!appointmentResponse.ok) {
          setError(
            appointmentData.error ||
              "Unable to load appointments."
          );
          return;
        }

        if (!prescriptionResponse.ok) {
          setError(
            prescriptionData.error ||
              "Unable to load prescriptions."
          );
          return;
        }

        setPatient(patientData.patient);
        setAppointments(
          appointmentData.appointments || []
        );
        setPrescriptions(
          prescriptionData.prescriptions || []
        );
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /*
   * =====================================================
   * NEXT 7 DAYS
   * =====================================================
   *
   * The assignment requires the dashboard to show:
   *
   * - Appointments within the next 7 days
   * - Prescription refills within the next 7 days
   *
   * The full appointment/prescription pages can still
   * display the longer schedule.
   */

  const next7DaysAppointments = useMemo(() => {
    const now = new Date();

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(
      sevenDaysFromNow.getDate() + 7
    );

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(
          appointment.datetime
        );

        return (
          appointmentDate >= now &&
          appointmentDate <= sevenDaysFromNow
        );
      })
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() -
          new Date(b.datetime).getTime()
      );
  }, [appointments]);

  const next7DaysPrescriptions = useMemo(() => {
    const now = new Date();

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(
      sevenDaysFromNow.getDate() + 7
    );

    return prescriptions
      .filter((prescription) => {
        const refillDate = new Date(
          prescription.refillOn
        );

        return (
          refillDate >= now &&
          refillDate <= sevenDaysFromNow
        );
      })
      .sort(
        (a, b) =>
          new Date(a.refillOn).getTime() -
          new Date(b.refillOn).getTime()
      );
  }, [prescriptions]);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Loading your portal...
        </p>
      </main>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-600">
            {error}
          </p>

          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </a>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {patient?.name}!
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome to your Zealthy Patient Portal.
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>

        {/* =====================================================
            PATIENT INFORMATION
        ===================================================== */}

        <section className="mb-6 rounded-2xl bg-white p-6 shadow">

          <h2 className="text-xl font-semibold text-gray-900">
            Patient Information
          </h2>

          <div className="mt-4 space-y-2 text-gray-600">

            <p>
              <strong>Name:</strong>{" "}
              {patient?.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {patient?.email}
            </p>

            <p>
              <strong>Patient ID:</strong>{" "}
              {patient?.id}
            </p>

          </div>

        </section>

        {/* =====================================================
            UPCOMING APPOINTMENTS
        ===================================================== */}

        <section className="mb-6 rounded-2xl bg-white p-6 shadow">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Appointments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Appointments within the next 7 days
              </p>
            </div>

            <a
              href="/dashboard/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all →
            </a>

          </div>

          {next7DaysAppointments.length === 0 ? (
            <p className="mt-4 text-gray-600">
              You have no appointments within the next 7 days.
            </p>
          ) : (
            <div className="mt-4 space-y-4">

              {next7DaysAppointments.map(
                (appointment) => (

                  <div
                    key={appointment.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >

                    <p className="font-semibold text-gray-900">
                      {appointment.provider}
                    </p>

                    <p className="mt-1 text-gray-600">
                      {new Date(
                        appointment.datetime
                      ).toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Repeats:{" "}
                      {appointment.repeat}
                    </p>

                  </div>

                )
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            PRESCRIPTIONS
        ===================================================== */}

        <section className="rounded-2xl bg-white p-6 shadow">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Prescription Refills
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Refills scheduled within the next 7 days
              </p>
            </div>

            <a
              href="/dashboard/prescriptions"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all →
            </a>

          </div>

          {next7DaysPrescriptions.length === 0 ? (
            <p className="mt-4 text-gray-600">
              You have no prescription refills within the next 7 days.
            </p>
          ) : (
            <div className="mt-4 space-y-4">

              {next7DaysPrescriptions.map(
                (prescription) => (

                  <div
                    key={prescription.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >

                    <p className="font-semibold text-gray-900">
                      {prescription.medication}
                    </p>

                    <p className="mt-1 text-gray-600">
                      Dosage:{" "}
                      {prescription.dosage}
                    </p>

                    <p className="mt-1 text-gray-600">
                      Quantity:{" "}
                      {prescription.quantity}
                    </p>

                    <p className="mt-1 text-gray-600">
                      Next refill:{" "}
                      {new Date(
                        prescription.refillOn
                      ).toLocaleDateString()}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Schedule:{" "}
                      {prescription.refillSchedule}
                    </p>

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
