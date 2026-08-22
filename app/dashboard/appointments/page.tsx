"use client";

import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
};

type DisplayAppointment = Appointment & {
  occurrenceKey: string;
  isRecurringOccurrence: boolean;
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
          setError(
            "Patient session not found. Please log in again."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/appointments?patientId=${patientId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error || "Unable to load appointments."
          );
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

  /*
   * =====================================================
   * GENERATE UPCOMING APPOINTMENTS FOR 3 MONTHS
   * =====================================================
   */

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    const threeMonthsFromNow = new Date(now);
    threeMonthsFromNow.setMonth(
      threeMonthsFromNow.getMonth() + 3
    );

    const generated: DisplayAppointment[] = [];

    appointments.forEach((appointment) => {
      const originalDate = new Date(
        appointment.datetime
      );

      if (Number.isNaN(originalDate.getTime())) {
        return;
      }

      /*
       * =================================================
       * ONE-TIME APPOINTMENT
       * =================================================
       */

      if (
        !appointment.repeat ||
        appointment.repeat === "none"
      ) {
        if (
          originalDate >= now &&
          originalDate <= threeMonthsFromNow
        ) {
          generated.push({
            ...appointment,
            occurrenceKey: `${appointment.id}-${originalDate.getTime()}`,
            isRecurringOccurrence: false,
          });
        }

        return;
      }

      /*
       * =================================================
       * WEEKLY APPOINTMENT
       * =================================================
       */

      if (appointment.repeat === "weekly") {
        let occurrence = new Date(originalDate);

        /*
         * Move forward until we reach the current date.
         */
        while (occurrence < now) {
          occurrence.setDate(
            occurrence.getDate() + 7
          );
        }

        /*
         * Generate every weekly occurrence for
         * the next 3 months.
         */
        while (
          occurrence <= threeMonthsFromNow
        ) {
          generated.push({
            ...appointment,
            datetime: occurrence.toISOString(),
            occurrenceKey: `${appointment.id}-${occurrence.getTime()}`,
            isRecurringOccurrence:
              occurrence.getTime() !==
              originalDate.getTime(),
          });

          occurrence = new Date(occurrence);

          occurrence.setDate(
            occurrence.getDate() + 7
          );
        }

        return;
      }

      /*
       * =================================================
       * MONTHLY APPOINTMENT
       * =================================================
       */

      if (appointment.repeat === "monthly") {
        let occurrence = new Date(originalDate);

        /*
         * Move forward month by month until the
         * occurrence reaches the current date.
         */
        while (occurrence < now) {
          const nextMonth = new Date(occurrence);

          nextMonth.setMonth(
            nextMonth.getMonth() + 1
          );

          occurrence = nextMonth;
        }

        /*
         * Generate every monthly occurrence for
         * the next 3 months.
         */
        while (
          occurrence <= threeMonthsFromNow
        ) {
          generated.push({
            ...appointment,
            datetime: occurrence.toISOString(),
            occurrenceKey: `${appointment.id}-${occurrence.getTime()}`,
            isRecurringOccurrence:
              occurrence.getTime() !==
              originalDate.getTime(),
          });

          const nextMonth = new Date(occurrence);

          nextMonth.setMonth(
            nextMonth.getMonth() + 1
          );

          occurrence = nextMonth;
        }

        return;
      }

      /*
       * =================================================
       * UNKNOWN REPEAT VALUE
       * =================================================
       *
       * Treat unknown values as one-time appointments.
       */

      if (
        originalDate >= now &&
        originalDate <= threeMonthsFromNow
      ) {
        generated.push({
          ...appointment,
          occurrenceKey: `${appointment.id}-${originalDate.getTime()}`,
          isRecurringOccurrence: false,
        });
      }
    });

    /*
     * Sort chronologically.
     */

    generated.sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );

    return generated;
  }, [appointments]);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Loading appointments...
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
            href="/dashboard"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
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

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Appointments
            </h1>

            <p className="mt-2 text-gray-600">
              Your upcoming appointments for the next 3 months
            </p>

          </div>

          <a
            href="/dashboard"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Back to Dashboard
          </a>

        </div>

        {/* APPOINTMENTS */}

        {upcomingAppointments.length === 0 ? (

          <div className="rounded-2xl bg-white p-8 text-center shadow">

            <p className="text-gray-600">
              You have no upcoming appointments
              in the next 3 months.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {upcomingAppointments.map(
              (appointment) => (

                <div
                  key={appointment.occurrenceKey}
                  className="rounded-2xl bg-white p-6 shadow"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-semibold text-gray-900">
                        {appointment.provider}
                      </h2>

                      {appointment.isRecurringOccurrence && (
                        <p className="mt-1 text-xs font-medium text-blue-600">
                          Recurring appointment
                        </p>
                      )}

                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {appointment.repeat}
                    </span>

                  </div>

                  <div className="mt-4 space-y-2 text-gray-600">

                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {new Date(
                        appointment.datetime
                      ).toLocaleString()}
                    </p>

                    <p>
                      <strong>Repeat:</strong>{" "}
                      {appointment.repeat}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}
