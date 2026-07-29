"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b px-6 py-4 flex justify-between items-center">
      <Link href="/dashboard" className="font-bold">
        SecureSlot
      </Link>
      <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-black">
        Log out
      </button>
    </nav>
  );
}