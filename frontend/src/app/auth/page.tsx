"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const result =
        mode === "signup" ? await api.signup(email, password) : await api.login(email, password);
      localStorage.setItem("token", result.token);
      setMessage(`${mode === "signup" ? "Signed up" : "Logged in"} successfully`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">{mode === "signup" ? "Create account" : "Login"}</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-gray-300 p-2"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-gray-300 p-2"
        />
        <button className="w-full rounded-md bg-blue-600 p-2 text-white" type="submit">
          {mode === "signup" ? "Sign up" : "Login"}
        </button>
      </form>
      <button
        className="mt-3 text-sm text-blue-700"
        type="button"
        onClick={() => setMode((prev) => (prev === "signup" ? "login" : "signup"))}
      >
        Switch to {mode === "signup" ? "login" : "signup"}
      </button>
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
