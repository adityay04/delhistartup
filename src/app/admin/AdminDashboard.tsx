"use client";

import { useState } from "react";
import Link from "next/link";
import {
  approveEntity,
  deleteEntity,
  ignoreFundingLead,
  signOutAdmin,
} from "@/app/actions";
import type { Entity, FundingLead } from "@/lib/types";

function getTrustedFundingLeadUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const trusted = ["inc42.com", "yourstory.com"].some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      trusted
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function AdminDashboard({
  entities: initialEntities,
  fundingLeads: initialFundingLeads,
}: {
  entities: Entity[];
  fundingLeads: FundingLead[];
}) {
  const [entities, setEntities] = useState(initialEntities);
  const [fundingLeads, setFundingLeads] = useState(initialFundingLeads);
  const [actionId, setActionId] = useState<string | null>(null);
  const [sourceUrls, setSourceUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialEntities.map((entity) => [entity.id, entity.source_url || ""]),
    ),
  );

  async function handleApprove(id: string) {
    setActionId(id);
    const result = await approveEntity(id, sourceUrls[id] || "");

    if ("error" in result) {
      alert(result.error);
    } else {
      setEntities((current) => current.filter((entity) => entity.id !== id));
      if ("warning" in result && result.warning) alert(result.warning);
    }
    setActionId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setActionId(id);
    const result = await deleteEntity(id);

    if ("error" in result) {
      alert(result.error);
    } else {
      setEntities((current) => current.filter((entity) => entity.id !== id));
    }
    setActionId(null);
  }

  async function handleIgnoreFundingLead(leadKey: string) {
    setActionId(leadKey);
    const result = await ignoreFundingLead(leadKey);

    if ("error" in result) {
      alert(result.error);
    } else {
      setFundingLeads((current) =>
        current.filter((lead) => lead.lead_key !== leadKey),
      );
    }
    setActionId(null);
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] p-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-[#454545] dark:text-[#a1a1aa] mt-1">
              Verify new and stale listings against a source.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/map" className="text-sm text-[#2563eb] hover:underline">
              ← Back to Map
            </Link>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="text-sm text-[#454545] dark:text-[#a1a1aa] hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {fundingLeads.length > 0 && (
          <section className="mb-8">
            <div className="mb-3">
              <h2 className="text-xl font-semibold">
                Funding leads needing review
              </h2>
              <p className="text-sm text-[#454545] dark:text-[#a1a1aa] mt-1">
                These candidates are not public. The automated checks could not
                confirm their source or Delhi NCR location.
              </p>
            </div>
            <div className="bg-white dark:bg-[#141314] rounded-lg shadow-sm border border-[#dddddd] dark:border-[#27272a] overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f4f3f4] dark:bg-[#27272a] border-b border-[#dddddd] dark:border-[#3f3f46] text-[#454545] dark:text-[#a1a1aa] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Startup</th>
                    <th className="px-6 py-4">Funding story</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Review reason</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dddddd] dark:divide-[#27272a]">
                  {fundingLeads.map((lead) => {
                    const sourceUrl = getTrustedFundingLeadUrl(lead.source_url);
                    return (
                      <tr key={lead.lead_key}>
                        <td className="px-6 py-4 font-medium">
                          {lead.company_name}
                        </td>
                        <td className="px-6 py-4 text-[#454545] dark:text-[#a1a1aa]">
                          {lead.headline}
                        </td>
                        <td className="px-6 py-4">
                          {sourceUrl ? (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {lead.source_name || "Open article"}
                            </a>
                          ) : (
                            <span>Untrusted or unavailable</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#454545] dark:text-[#a1a1aa]">
                          {lead.review_reason || "Needs manual review."}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              handleIgnoreFundingLead(lead.lead_key)
                            }
                            disabled={actionId === lead.lead_key}
                            className="text-red-600 dark:text-red-400 font-medium hover:underline disabled:opacity-50"
                          >
                            {actionId === lead.lead_key ? "..." : "Dismiss"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {entities.length === 0 ? (
          <div className="bg-white dark:bg-[#141314] p-8 rounded-lg border border-[#dddddd] dark:border-[#27272a] text-center">
            <p className="text-[#454545] dark:text-[#a1a1aa]">
              All listings have a current source and map location.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141314] rounded-lg shadow-sm border border-[#dddddd] dark:border-[#27272a] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f3f4] dark:bg-[#27272a] border-b border-[#dddddd] dark:border-[#3f3f46] text-[#454545] dark:text-[#a1a1aa] font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Tagline</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Verification source URL</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd] dark:divide-[#27272a]">
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td className="px-6 py-4 font-medium">{entity.name}</td>
                    <td className="px-6 py-4 text-[#454545] dark:text-[#a1a1aa]">
                      {entity.tagline}
                    </td>
                    <td className="px-6 py-4">
                      {entity.area ? `${entity.area}, ` : ""}
                      {entity.city}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="url"
                        aria-label={`Verification source URL for ${entity.name}`}
                        value={sourceUrls[entity.id] || ""}
                        onChange={(event) =>
                          setSourceUrls((current) => ({
                            ...current,
                            [entity.id]: event.target.value,
                          }))
                        }
                        placeholder="https://"
                        className="w-64 max-w-full rounded border border-[#dddddd] dark:border-[#3f3f46] bg-transparent px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleApprove(entity.id)}
                        disabled={actionId === entity.id || !sourceUrls[entity.id]}
                        className="text-green-600 dark:text-green-400 font-medium hover:underline disabled:opacity-50"
                      >
                        {actionId === entity.id
                          ? "..."
                          : entity.is_verified && entity.source_url
                            ? entity.lat == null || entity.lng == null
                              ? "Place map pin"
                              : "Refresh source"
                            : "Verify"}
                      </button>
                      <button
                        onClick={() => handleDelete(entity.id)}
                        disabled={actionId === entity.id}
                        className="text-red-600 dark:text-red-400 font-medium hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
