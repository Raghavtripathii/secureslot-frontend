import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const backendResponse = await fetch(`${process.env.BACKEND_URL}/doctors/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await backendResponse.json();
  return NextResponse.json(data, { status: backendResponse.status });
}