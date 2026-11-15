"use client";

import { useState } from "react";
import Link from "next/link";
import { submitStartup } from "@/app/actions";

export default function SubmitPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    const result = await submitStartup(formData);

    if (result.error) {
      setErrorMessage(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Submission Received!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for submitting your startup. Our team will review it
            shortly, and it will appear on the map once approved.
          </p>
          <Link
            href="/map"
            className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors"
          >
            Back to Map
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/map"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to Map
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add Your Startup
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Submit your startup to be featured on the Delhi Startup Map.
            Submissions are reviewed manually before appearing on the map.
          </p>

          <form action={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startup Name *
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="entity_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="startup">Startup</option>
                  <option value="vc">VC / Investor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                One-line Tagline *
              </label>
              <input
                name="tagline"
                required
                placeholder="e.g. AI-powered logistics for Tier 2 cities"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  name="city"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Faridabad">Faridabad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area / Locality
                </label>
                <input
                  name="area"
                  placeholder="e.g. Nehru Place"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Founders (comma separated)
              </label>
              <input
                name="founders"
                placeholder="e.g. John Doe, Jane Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                name="website_url"
                type="url"
                placeholder="https://"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {status === "error" && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Submitting..." : "Submit Startup"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
