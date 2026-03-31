"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Investment = {
  id: number;
  assetName: string;
  type: "stock" | "crypto";
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
};

type PortfolioResponse = {
  portfolio: Investment[];
  summary: {
    totalValue: number;
    totalProfitLoss: number;
  };
};

const fetchInvestments = () => api.getInvestments();

export default function InvestmentsPage() {
  const [data, setData] = useState<PortfolioResponse>({
    portfolio: [],
    summary: { totalValue: 0, totalProfitLoss: 0 },
  });
  const [error, setError] = useState("");
  const [form, setForm] = useState({ assetName: "", type: "stock", quantity: "", buyPrice: "" });

  const load = async () => {
    const response = await fetchInvestments();
    setData(response);
    setError("");
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchInvestments();
        if (active) {
          setData(data);
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
      await api.addInvestment({
        assetName: form.assetName,
        type: form.type as "stock" | "crypto",
        quantity: Number(form.quantity),
        buyPrice: Number(form.buyPrice),
      });
      setForm({ assetName: "", type: "stock", quantity: "", buyPrice: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Investments</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="mt-1 text-2xl font-semibold">₹{data.summary.totalValue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Profit / Loss</p>
          <p className={`mt-1 text-2xl font-semibold ${data.summary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
            ₹{data.summary.totalProfitLoss.toFixed(2)}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Asset name"
          value={form.assetName}
          onChange={(e) => setForm((f) => ({ ...f, assetName: e.target.value }))}
          required
        />
        <select
          className="rounded-md border border-gray-300 p-2"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="stock">stock</option>
          <option value="crypto">crypto</option>
        </select>
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Quantity"
          type="number"
          step="0.0001"
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          required
        />
        <input
          className="rounded-md border border-gray-300 p-2"
          placeholder="Buy price"
          type="number"
          step="0.01"
          value={form.buyPrice}
          onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))}
          required
        />
        <button className="rounded-md bg-blue-600 p-2 text-white md:col-span-4" type="submit">
          Add Investment
        </button>
      </form>

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Asset</th>
              <th className="p-3">Type</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Buy</th>
              <th className="p-3">Current</th>
              <th className="p-3">P/L</th>
            </tr>
          </thead>
          <tbody>
            {data.portfolio.map((item) => (
              <tr key={item.id} className="border-t border-gray-200">
                <td className="p-3">{item.assetName}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">₹{item.buyPrice.toFixed(2)}</td>
                <td className="p-3">₹{item.currentPrice.toFixed(2)}</td>
                <td className={`p-3 ${item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{item.profitLoss.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
