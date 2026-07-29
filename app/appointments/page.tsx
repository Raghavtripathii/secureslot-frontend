"use client";

import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@/types";

async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch("/api/appointments");
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json();
}

export default function AppointmentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load appointments.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">My appointments</h1>
      {data && data.length === 0 && <p>No appointments yet.</p>}
      <div className="flex flex-col gap-3">
        {data?.map((appt) => (
          <div key={appt.id} className="border rounded p-4">
            <p className="font-medium">{new Date(appt.start_time).toLocaleString()}</p>
            <p className="text-sm text-gray-500 capitalize">{appt.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}