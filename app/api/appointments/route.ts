import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const backendResponse = await fetch(`${process.env.BACKEND_URL}/appointments/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await backendResponse.json();
  return NextResponse.json(data, { status: backendResponse.status });
}

export async function POST(request: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const body = await request.json();

  const backendResponse = await fetch(`${process.env.BACKEND_URL}/appointments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json();
  return NextResponse.json(data, { status: backendResponse.status });
}