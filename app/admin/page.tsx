"use client";

import { useEffect, useState } from "react";

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
  patientId: number;
  patient?: Patient;
};

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: string;
  patientId: number;
  patient?: Patient;
};

export default function AdminPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // PATIENT FORM
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // =====================================================
  // EDIT PATIENT
  // =====================================================

  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [updating, setUpdating] = useState(false);

  // =====================================================
  // APPOINTMENT FORM
  // =====================================================

  const [showAppointmentForm, setShowAppointmentForm] =
    useState(false);

  const [appointmentPatientId, setAppointmentPatientId] =
    useState("");

  const [provider, setProvider] = useState("");
  const [appointmentDatetime, setAppointmentDatetime] =
    useState("");

  const [repeat, setRepeat] = useState("none");

  const [savingAppointment, setSavingAppointment] =
    useState(false);

  // =====================================================
  // EDIT APPOINTMENT
  // =====================================================

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [editAppointmentPatientId, setEditAppointmentPatientId] =
    useState("");

  const [editProvider, setEditProvider] = useState("");
  const [editAppointmentDatetime, setEditAppointmentDatetime] =
    useState("");

  const [editRepeat, setEditRepeat] = useState("none");

  const [updatingAppointment, setUpdatingAppointment] =
    useState(false);

  // =====================================================
  // PRESCRIPTION FORM
  // =====================================================

  const [showPrescriptionForm, setShowPrescriptionForm] =
    useState(false);

  const [prescriptionPatientId, setPrescriptionPatientId] =
    useState("");

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [refillOn, setRefillOn] = useState("");
  const [refillSchedule, setRefillSchedule] =
    useState("monthly");

  const [savingPrescription, setSavingPrescription] =
    useState(false);

  // =====================================================
  // EDIT PRESCRIPTION
  // =====================================================

  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);

  const [editPrescriptionPatientId, setEditPrescriptionPatientId] =
    useState("");

  const [editMedication, setEditMedication] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editRefillOn, setEditRefillOn] = useState("");
  const [editRefillSchedule, setEditRefillSchedule] =
    useState("monthly");

  const [updatingPrescription, setUpdatingPrescription] =
    useState(false);

  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  const loadPatients = async () => {
    try {
      const response = await fetch("/api/patients");

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load patients.");
        return;
      }

      setPatients(data.patients);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  };

  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  const loadAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to load appointments."
        );
        return;
      }

      setAppointments(data.appointments);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  };

  // =====================================================
  // LOAD PRESCRIPTIONS
  // =====================================================

  const loadPrescriptions = async () => {
    try {
      const response = await fetch("/api/prescriptions");

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to load prescriptions."
        );
        return;
      }

      setPrescriptions(data.prescriptions);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  };

  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  const loadData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      loadPatients(),
      loadAppointments(),
      loadPrescriptions(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // CREATE PATIENT
  // =====================================================

  const handleCreatePatient = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create patient."
        );
        return;
      }

      setSuccess("Patient created successfully.");

      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);

      await loadPatients();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE PATIENT
  // =====================================================

  const handleUpdatePatient = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingPatient) {
      setError("Please select a patient to edit.");
      return;
    }

    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      const response = await fetch("/api/patients", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(editingPatient.id),
          name: editName,
          email: editEmail,
          password: editPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to update patient."
        );
        return;
      }

      setSuccess("Patient updated successfully.");

      setEditingPatient(null);
      setEditName("");
      setEditEmail("");
      setEditPassword("");

      await loadPatients();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // CREATE APPOINTMENT
  // =====================================================

  const handleCreateAppointment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSavingAppointment(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: Number(appointmentPatientId),
          provider,
          datetime: appointmentDatetime,
          repeat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create appointment."
        );
        return;
      }

      setSuccess("Appointment created successfully.");

      setAppointmentPatientId("");
      setProvider("");
      setAppointmentDatetime("");
      setRepeat("none");
      setShowAppointmentForm(false);

      await loadAppointments();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setSavingAppointment(false);
    }
  };

  // =====================================================
  // UPDATE APPOINTMENT
  // =====================================================

  const handleUpdateAppointment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingAppointment) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingAppointment(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(editingAppointment.id),
          patientId: Number(editAppointmentPatientId),
          provider: editProvider,
          datetime: editAppointmentDatetime,
          repeat: editRepeat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to update appointment."
        );
        return;
      }

      setSuccess("Appointment updated successfully.");

      setEditingAppointment(null);
      setEditAppointmentPatientId("");
      setEditProvider("");
      setEditAppointmentDatetime("");
      setEditRepeat("none");

      await loadAppointments();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setUpdatingAppointment(false);
    }
  };

  // =====================================================
  // DELETE APPOINTMENT
  // =====================================================

  const handleDeleteAppointment = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/appointments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to delete appointment."
        );
        return;
      }

      setSuccess("Appointment deleted successfully.");

      await loadAppointments();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  };

  // =====================================================
  // CREATE PRESCRIPTION
  // =====================================================

  const handleCreatePrescription = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSavingPrescription(true);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: Number(prescriptionPatientId),
          medication,
          dosage,
          quantity: Number(quantity),
          refillOn,
          refillSchedule,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create prescription."
        );
        return;
      }

      setSuccess("Prescription created successfully.");

      setPrescriptionPatientId("");
      setMedication("");
      setDosage("");
      setQuantity("");
      setRefillOn("");
      setRefillSchedule("monthly");
      setShowPrescriptionForm(false);

      await loadPrescriptions();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setSavingPrescription(false);
    }
  };

  // =====================================================
  // UPDATE PRESCRIPTION
  // =====================================================

  const handleUpdatePrescription = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingPrescription) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingPrescription(true);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(editingPrescription.id),
          patientId: Number(editPrescriptionPatientId),
          medication: editMedication,
          dosage: editDosage,
          quantity: Number(editQuantity),
          refillOn: editRefillOn,
          refillSchedule: editRefillSchedule,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to update prescription."
        );
        return;
      }

      setSuccess("Prescription updated successfully.");

      setEditingPrescription(null);
      setEditPrescriptionPatientId("");
      setEditMedication("");
      setEditDosage("");
      setEditQuantity("");
      setEditRefillOn("");
      setEditRefillSchedule("monthly");

      await loadPrescriptions();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setUpdatingPrescription(false);
    }
  };

  // =====================================================
  // DELETE PRESCRIPTION
  // =====================================================

  const handleDeletePrescription = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/prescriptions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to delete prescription."
        );
        return;
      }

      setSuccess("Prescription deleted successfully.");

      await loadPrescriptions();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Loading admin portal...
        </p>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Zealthy Mini-EMR
          </h1>

          <p className="mt-2 text-gray-600">
            Patient, Appointment & Prescription Management
          </p>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* =====================================================
            PATIENTS
        ===================================================== */}

        <section className="mb-8 rounded-2xl bg-white shadow overflow-hidden">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Patients
            </h2>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingPatient(null);
                setError("");
                setSuccess("");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              {showForm ? "Cancel" : "+ New Patient"}
            </button>

          </div>

          {/* CREATE PATIENT */}

          {showForm && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Create New Patient
              </h3>

              <form
                onSubmit={handleCreatePatient}
                className="mt-5 space-y-4"
              >

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Patient Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Patient"}
                </button>

              </form>
            </div>
          )}

          {/* EDIT PATIENT */}

          {editingPatient && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Edit Patient
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Patient ID: {editingPatient.id}
              </p>

              <form
                onSubmit={handleUpdatePatient}
                className="mt-5 space-y-4"
              >

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  placeholder="Patient Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) =>
                    setEditEmail(e.target.value)
                  }
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) =>
                    setEditPassword(e.target.value)
                  }
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />

                <div className="flex gap-3">

                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {updating
                      ? "Updating..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPatient(null);
                      setEditName("");
                      setEditEmail("");
                      setEditPassword("");
                    }}
                    className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </div>
          )}

          {/* PATIENT TABLE */}

          {patients.length === 0 ? (
            <div className="p-6 text-gray-600">
              No patients found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Name
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Patient ID
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {patients.map((patient) => (

                    <tr key={patient.id}>

                      <td className="px-6 py-4">
                        {patient.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {patient.email}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {patient.id}
                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() => {
                            setEditingPatient(patient);

                            setEditName(
                              patient.name
                            );

                            setEditEmail(
                              patient.email
                            );

                            setEditPassword("");

                            setShowForm(false);

                            setError("");
                            setSuccess("");
                          }}
                          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =====================================================
            APPOINTMENTS
        ===================================================== */}

        <section className="mb-8 rounded-2xl bg-white shadow overflow-hidden">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Appointments
            </h2>

            <button
              onClick={() => {
                setShowAppointmentForm(
                  !showAppointmentForm
                );

                setEditingAppointment(null);

                setError("");
                setSuccess("");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              {showAppointmentForm
                ? "Cancel"
                : "+ New Appointment"}
            </button>

          </div>

          {/* CREATE APPOINTMENT */}

          {showAppointmentForm && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Create New Appointment
              </h3>

              <form
                onSubmit={handleCreateAppointment}
                className="mt-5 space-y-4"
              >

                <select
                  value={appointmentPatientId}
                  onChange={(e) =>
                    setAppointmentPatientId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                >

                  <option value="">
                    Select Patient
                  </option>

                  {patients.map((patient) => (

                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value)
                  }
                  placeholder="Provider name, e.g. Dr Kim West"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="datetime-local"
                  value={appointmentDatetime}
                  onChange={(e) =>
                    setAppointmentDatetime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <select
                  value={repeat}
                  onChange={(e) =>
                    setRepeat(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >

                  <option value="none">
                    Does not repeat
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                </select>

                <button
                  type="submit"
                  disabled={savingAppointment}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {savingAppointment
                    ? "Creating..."
                    : "Create Appointment"}
                </button>

              </form>
            </div>
          )}

          {/* EDIT APPOINTMENT */}

          {editingAppointment && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Edit Appointment
              </h3>

              <form
                onSubmit={handleUpdateAppointment}
                className="mt-5 space-y-4"
              >

                <select
                  value={editAppointmentPatientId}
                  onChange={(e) =>
                    setEditAppointmentPatientId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                >

                  <option value="">
                    Select Patient
                  </option>

                  {patients.map((patient) => (

                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  value={editProvider}
                  onChange={(e) =>
                    setEditProvider(
                      e.target.value
                    )
                  }
                  placeholder="Provider name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="datetime-local"
                  value={editAppointmentDatetime}
                  onChange={(e) =>
                    setEditAppointmentDatetime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <select
                  value={editRepeat}
                  onChange={(e) =>
                    setEditRepeat(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >

                  <option value="none">
                    Does not repeat
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                </select>

                <div className="flex gap-3">

                  <button
                    type="submit"
                    disabled={updatingAppointment}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {updatingAppointment
                      ? "Updating..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingAppointment(null)
                    }
                    className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </div>
          )}

          {/* APPOINTMENT TABLE */}

          {appointments.length === 0 ? (
            <div className="p-6 text-gray-600">
              No upcoming appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Patient
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Provider
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Date & Time
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Repeat
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {appointments.map((appointment) => (

                    <tr key={appointment.id}>

                      <td className="px-6 py-4">
                        {appointment.patient?.name ||
                          patients.find(
                            (p) =>
                              p.id ===
                              appointment.patientId
                          )?.name ||
                          `Patient ${appointment.patientId}`}
                      </td>

                      <td className="px-6 py-4">
                        {appointment.provider}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          appointment.datetime
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {appointment.repeat}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() => {

                              setEditingAppointment(
                                appointment
                              );

                              setEditAppointmentPatientId(
                                String(
                                  appointment.patientId
                                )
                              );

                              setEditProvider(
                                appointment.provider
                              );

                              const date =
                                new Date(
                                  appointment.datetime
                                );

                              const localDate =
                                new Date(
                                  date.getTime() -
                                    date.getTimezoneOffset() *
                                      60000
                                )
                                  .toISOString()
                                  .slice(0, 16);

                              setEditAppointmentDatetime(
                                localDate
                              );

                              setEditRepeat(
                                appointment.repeat
                              );

                              setShowAppointmentForm(
                                false
                              );

                              setError("");
                              setSuccess("");
                            }}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteAppointment(
                                appointment.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =====================================================
            PRESCRIPTIONS
        ===================================================== */}

        <section className="rounded-2xl bg-white shadow overflow-hidden">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Prescriptions
            </h2>

            <button
              onClick={() => {
                setShowPrescriptionForm(
                  !showPrescriptionForm
                );

                setEditingPrescription(null);

                setError("");
                setSuccess("");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              {showPrescriptionForm
                ? "Cancel"
                : "+ New Prescription"}
            </button>

          </div>

          {/* CREATE PRESCRIPTION */}

          {showPrescriptionForm && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Create New Prescription
              </h3>

              <form
                onSubmit={handleCreatePrescription}
                className="mt-5 space-y-4"
              >

                <select
                  value={prescriptionPatientId}
                  onChange={(e) =>
                    setPrescriptionPatientId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                >

                  <option value="">
                    Select Patient
                  </option>

                  {patients.map((patient) => (

                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  value={medication}
                  onChange={(e) =>
                    setMedication(e.target.value)
                  }
                  placeholder="Medication, e.g. Lexapro"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="text"
                  value={dosage}
                  onChange={(e) =>
                    setDosage(e.target.value)
                  }
                  placeholder="Dosage, e.g. 5mg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  placeholder="Quantity"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="date"
                  value={refillOn}
                  onChange={(e) =>
                    setRefillOn(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <select
                  value={refillSchedule}
                  onChange={(e) =>
                    setRefillSchedule(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="none">
                    Does not repeat
                  </option>

                </select>

                <button
                  type="submit"
                  disabled={savingPrescription}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {savingPrescription
                    ? "Creating..."
                    : "Create Prescription"}
                </button>

              </form>

            </div>
          )}

          {/* EDIT PRESCRIPTION */}

          {editingPrescription && (
            <div className="border-b border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Edit Prescription
              </h3>

              <form
                onSubmit={handleUpdatePrescription}
                className="mt-5 space-y-4"
              >

                <select
                  value={editPrescriptionPatientId}
                  onChange={(e) =>
                    setEditPrescriptionPatientId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                >

                  <option value="">
                    Select Patient
                  </option>

                  {patients.map((patient) => (

                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  value={editMedication}
                  onChange={(e) =>
                    setEditMedication(e.target.value)
                  }
                  placeholder="Medication"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="text"
                  value={editDosage}
                  onChange={(e) =>
                    setEditDosage(e.target.value)
                  }
                  placeholder="Dosage"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="number"
                  min="1"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(e.target.value)
                  }
                  placeholder="Quantity"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <input
                  type="date"
                  value={editRefillOn}
                  onChange={(e) =>
                    setEditRefillOn(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />

                <select
                  value={editRefillSchedule}
                  onChange={(e) =>
                    setEditRefillSchedule(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="none">
                    Does not repeat
                  </option>

                </select>

                <div className="flex gap-3">

                  <button
                    type="submit"
                    disabled={updatingPrescription}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {updatingPrescription
                      ? "Updating..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingPrescription(null)
                    }
                    className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* PRESCRIPTION TABLE */}

          {prescriptions.length === 0 ? (
            <div className="p-6 text-gray-600">
              No prescriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Patient
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Medication
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Dosage
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Quantity
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Next Refill
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Schedule
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {prescriptions.map((prescription) => (

                    <tr key={prescription.id}>

                      <td className="px-6 py-4">
                        {prescription.patient?.name ||
                          patients.find(
                            (p) =>
                              p.id ===
                              prescription.patientId
                          )?.name ||
                          `Patient ${prescription.patientId}`}
                      </td>

                      <td className="px-6 py-4">
                        {prescription.medication}
                      </td>

                      <td className="px-6 py-4">
                        {prescription.dosage}
                      </td>

                      <td className="px-6 py-4">
                        {prescription.quantity}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          prescription.refillOn
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {prescription.refillSchedule}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() => {

                              setEditingPrescription(
                                prescription
                              );

                              setEditPrescriptionPatientId(
                                String(
                                  prescription.patientId
                                )
                              );

                              setEditMedication(
                                prescription.medication
                              );

                              setEditDosage(
                                prescription.dosage
                              );

                              setEditQuantity(
                                String(
                                  prescription.quantity
                                )
                              );

                              const refillDate =
                                new Date(
                                  prescription.refillOn
                                );

                              const localDate =
                                new Date(
                                  refillDate.getTime() -
                                    refillDate.getTimezoneOffset() *
                                      60000
                                )
                                  .toISOString()
                                  .slice(0, 10);

                              setEditRefillOn(
                                localDate
                              );

                              setEditRefillSchedule(
                                prescription.refillSchedule
                              );

                              setShowPrescriptionForm(
                                false
                              );

                              setError("");
                              setSuccess("");
                            }}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeletePrescription(
                                prescription.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
