"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Doctor } from "@/types";

async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch("/api/doctors");
  if (!res.ok) throw new Error("Failed to load doctors");
  return res.json();
}

export default function BookPage() {
  const queryClient = useQueryClient();
  const [doctorId, setDoctorId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [result, setResult] = useState<{ status: number; message: string } | null>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctorId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });
      const data = await res.json();
      return { status: res.status, data };
    },
    onSuccess: ({ status, data }) => {
      if (status === 201) {
        setResult({ status, message: "Booked successfully." });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      } else {
        setResult({ status, message: data.detail || "Booking failed." });
      }
    },
  });

  if (isLoading) return <p className="p-6">Loading doctors…</p>;

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Book an appointment</h1>
      <div className="flex flex-col gap-4">
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Select a doctor</option>
          {doctors?.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.full_name} — {d.specialty}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => bookMutation.mutate()}
          disabled={!doctorId || !startTime || bookMutation.isPending}
          className="bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {bookMutation.isPending ? "Booking…" : "Book slot"}
        </button>

        {result && (
          <p className={result.status === 201 ? "text-green-600" : "text-red-600"}>
            [{result.status}] {result.message}
          </p>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Tip: try booking the exact same doctor and time twice — the
          second attempt gets a 409 rejection, live, from the same
          row-locking logic proven in the backend's automated tests.
        </p>
      </div>
    </div>
  );
}