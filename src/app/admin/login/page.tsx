"use client";

import { useState } from "react";
import Link from "next/link";
import { requestAdminSignIn } from "@/app/actions";

export default function AdminLoginPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await requestAdminSignIn(formData);
    if ("success" in result) {
      setMessage(result.success ?? null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-[#dddddd] dark:border-[#27272a] bg-white dark:bg-[#141314] p-8">
        <h1 className="text-2xl font-display font-bold">Admin sign in</h1>
        <p className="text-sm text-[#5c5c5c] dark:text-[#a1a1aa] mt-2">
          Request a one-time sign-in link for the configured administrator.
        </p>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="admin-email">
            Admin email
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-[#dddddd] dark:border-[#3f3f46] bg-transparent px-3 py-2"
          />
          {message && (
            <p role="status" className="text-sm text-green-700 dark:text-green-400">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-4 py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Email me a sign-in link"}
          </button>
        </form>
        <Link
          href="/map"
          className="mt-5 inline-block text-sm text-[#2563eb] hover:underline"
        >
          Back to map
        </Link>
      </section>
    </main>
  );
}
