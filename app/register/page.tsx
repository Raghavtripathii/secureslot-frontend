"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "patient" | "doctor")}
          className="border rounded px-3 py-2"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="bg-black text-white rounded py-2">
          Register
        </button>
      </form>
    </div>
  );
}