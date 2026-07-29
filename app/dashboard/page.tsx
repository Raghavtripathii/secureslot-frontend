import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex flex-col gap-4">
        <Link href="/book" className="border rounded p-4 hover:bg-gray-50">
          Book an appointment →
        </Link>
        <Link href="/appointments" className="border rounded p-4 hover:bg-gray-50">
          My appointments →
        </Link>
      </div>
    </div>
  );
}