"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";

type Budget = {
  id: number;
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  overspendingAlert: boolean;
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.getBudgets();
      setBudgets(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.getBudgets();
        if (active) {
          setBudgets(data);
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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.upsertBudget(category, Number(monthlyLimit));
      setCategory("");
      setMonthlyLimit("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Budget</h1>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <input
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="rounded-md border border-gray-300 p-2"
        />
        <input
          required
          type="number"
          step="0.01"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          placeholder="Monthly Limit"
          className="rounded-md border border-gray-300 p-2"
        />
        <button className="rounded-md bg-blue-600 p-2 text-white" type="submit">
          Save Budget
        </button>
      </form>

      <div className="h-80 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm text-gray-500">Budget vs Actual</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={budgets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="monthlyLimit" fill="#16a34a" name="Limit" />
            <Bar dataKey="spent" fill="#2563eb" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {budgets.map((item) => (
          <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-medium">{item.category}</p>
            <p className="text-sm text-gray-600">Remaining: ₹{item.remaining.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Used: {item.percentageUsed.toFixed(1)}%</p>
            {item.overspendingAlert && (
              <p className="mt-2 text-sm font-medium text-red-600">Alert: spending crossed 80%</p>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
