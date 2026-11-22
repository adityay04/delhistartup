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
      <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white dark:bg-[#141314] p-8 rounded-lg shadow-sm border border-[#dddddd] dark:border-[#27272a] max-w-md w-full text-center transition-colors duration-500">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-display font-bold text-[#141314] dark:text-[#fafafa] mb-2 transition-colors duration-500">
            Submission Received!
          </h1>
          <p className="text-[#454545] dark:text-[#a1a1aa] mb-6 transition-colors duration-500">
            Thank you for submitting your startup. Our team will review it
            shortly, and it will appear on the map once approved.
          </p>
          <Link
            href="/map"
            className="bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-6 py-2 rounded-md font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
          >
            Back to Map
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] py-12 px-4 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/map"
          className="text-sm text-[#2563eb] hover:underline mb-6 inline-block"
        >
          ← Back to Map
        </Link>

        <div className="bg-white dark:bg-[#141314] rounded-lg shadow-sm border border-[#dddddd] dark:border-[#27272a] p-8 transition-colors duration-500">
          <h1 className="text-2xl font-display font-bold text-[#141314] dark:text-[#fafafa] mb-2 transition-colors duration-500">
            Add Your Startup
          </h1>
          <p className="text-[#454545] dark:text-[#a1a1aa] mb-8 text-sm transition-colors duration-500">
            Submit your startup to be featured on the Delhi Startup Map.
            Submissions are reviewed manually before appearing on the map.
          </p>

          <form action={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                  Startup Name *
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                  Type *
                </label>
                <select
                  name="entity_type"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
                >
                  <option value="startup">Startup</option>
                  <option value="vc">VC / Investor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                One-line Tagline *
              </label>
              <input
                name="tagline"
                required
                placeholder="e.g. AI-powered logistics for Tier 2 cities"
                className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                  City *
                </label>
                <select
                  name="city"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Faridabad">Faridabad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                  Area / Locality
                </label>
                <input
                  name="area"
                  placeholder="e.g. Nehru Place"
                  className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                Founders (comma separated)
              </label>
              <input
                name="founders"
                placeholder="e.g. John Doe, Jane Smith"
                className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                Website URL
              </label>
              <input
                name="website_url"
                type="url"
                placeholder="https://"
                className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454545] dark:text-[#a1a1aa] mb-1 transition-colors duration-500">
                Source URL for verifying this listing *
              </label>
              <input
                name="source_url"
                type="url"
                placeholder="https://"
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-[#dddddd] dark:border-[#27272a] rounded-md text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-colors duration-500"
              />
              <p className="text-xs text-[#5c5c5c] dark:text-[#71717a] mt-1">
                Link to an official company page or another reliable source.
              </p>
            </div>

            {status === "error" && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-900/50 transition-colors duration-500">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] font-medium py-2.5 rounded-md hover:bg-black dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Submitting..." : "Submit Startup"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
