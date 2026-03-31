import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Personal Finance Tracker",
  description: "AI-powered personal finance manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900">
        <Nav />
        <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
