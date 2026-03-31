import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
        <h1 className="text-2xl font-semibold">AI Personal Finance Tracker</h1>
        <p className="mt-2 text-gray-600">
          Track expenses, budgets, investments, and insights in one dashboard.
        </p>
      </div>
      {["dashboard", "budget", "insights", "investments", "auth"].map((page) => (
        <Link
          key={page}
          href={`/${page}`}
          className="rounded-xl border border-gray-200 bg-white p-5 capitalize shadow-sm hover:border-blue-300"
        >
          Open {page}
        </Link>
      ))}
    </div>
  );
}
