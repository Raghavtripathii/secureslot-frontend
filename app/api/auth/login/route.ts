import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const params = new URLSearchParams({ email, password });
  const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/login?${params}`, {
    method: "POST",
  });

  if (!backendResponse.ok) {
    const errorData = await backendResponse.json();
    return NextResponse.json(errorData, { status: backendResponse.status });
  }

  const data = await backendResponse.json();
  await setToken(data.access_token);
  return NextResponse.json({ success: true });
}