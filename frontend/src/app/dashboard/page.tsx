"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";

type Tx = {
  id: number;
  amount: number;
  category: string;
  merchant: string;
  date: string;
};

const colors = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#64748b"];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ amount: "", merchant: "", date: "", category: "" });

  const load = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.getTransactions();
        if (active) {
          setTransactions(data);
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const totalSpending = useMemo(
    () => transactions.reduce((sum, item) => sum + Number(item.amount), 0),
    [transactions],
  );

  const categoryData = useMemo(() => {
    const grouped = transactions.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const grouped = transactions.reduce<Record<string, number>>((acc, tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + Number(tx.amount);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
  }, [transactions]);

  const onAddTransaction = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.addTransaction({
        amount: Number(form.amount),
        merchant: form.merchant,
        date: form.date,
        category: form.category || undefined,
      });
      setForm({ amount: "", merchant: "", date: "", category: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onUploadCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await api.uploadTransactions(file);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Spending</p>
          <p className="mt-2 text-2xl font-semibold">₹{totalSpending.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
          <p className="text-sm text-gray-500">Upload CSV</p>
          <input type="file" accept=".csv" onChange={onUploadCsv} className="mt-2 block" />
          <p className="mt-2 text-xs text-gray-500">CSV columns: amount, merchant, date</p>
        </div>
      </div>

      <form onSubmit={onAddTransaction} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Merchant"
          value={form.merchant}
          onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
          required
        />
        <input
          className="rounded-md border border-gray-300 p-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
        />
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Category (optional)"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        <button className="rounded-md bg-blue-600 p-2 text-white md:col-span-4" type="submit">
          Add Transaction
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-72 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm text-gray-500">Category Breakdown</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90}>
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm text-gray-500">Monthly Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
