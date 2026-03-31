"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type InsightData = {
  suggestions: string[];
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightData>({ suggestions: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await api.getInsights();
        setData(response);
      } catch (e) {
        setError((e as Error).message);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {data.suggestions.map((suggestion) => (
          <div key={suggestion} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p>{suggestion}</p>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
