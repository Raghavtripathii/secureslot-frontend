import { cookies } from "next/headers";

const COOKIE_NAME = "secureslot_token";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30, // 30 minutes, matches backend token expiry
  });
}

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}