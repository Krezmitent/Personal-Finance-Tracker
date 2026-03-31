function getApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL must be set in production.");
  }

  return "http://localhost:4000";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  signup: (email: string, password: string) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getTransactions: () => request("/transactions"),
  addTransaction: (payload: {
    amount: number;
    merchant: string;
    date: string;
    category?: string;
  }) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadTransactions: async (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`${getApiBase()}/transactions/upload`, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "CSV upload failed");
    }

    return response.json();
  },
  getBudgets: () => request("/budget"),
  upsertBudget: (category: string, monthlyLimit: number) =>
    request("/budget", {
      method: "POST",
      body: JSON.stringify({ category, monthlyLimit }),
    }),
  getInsights: () => request("/insights"),
  getInvestments: () => request("/investments"),
  addInvestment: (payload: {
    assetName: string;
    type: "stock" | "crypto";
    quantity: number;
    buyPrice: number;
  }) =>
    request("/investments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
