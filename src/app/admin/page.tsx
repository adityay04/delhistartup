"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { approveEntity, deleteEntity } from "@/app/actions";
import type { Entity } from "@/lib/types";

export default function AdminPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function fetchUnverified() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("entities")
      .select("*")
      .eq("is_verified", false)
      .order("created_at", { ascending: false });

    setEntities((data as Entity[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUnverified();
  }, []);

  async function handleApprove(id: string) {
    setActionId(id);
    const res = await approveEntity(id);

    if (res?.error) {
      alert(res.error);
    } else {
      setEntities((prev) => prev.filter((e) => e.id !== id));
    }
    setActionId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setActionId(id);
    const res = await deleteEntity(id);

    if (res?.error) {
      alert(res.error);
    } else {
      setEntities((prev) => prev.filter((e) => e.id !== id));
    }
    setActionId(null);
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-[#454545] dark:text-[#a1a1aa] mt-1 transition-colors duration-500">
              Moderate new startup submissions.
            </p>
          </div>
          <Link href="/map" className="text-sm text-[#2563eb] hover:underline">
            ← Back to Map
          </Link>
        </div>

        {loading ? (
          <p className="text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
            Loading pending submissions...
          </p>
        ) : entities.length === 0 ? (
          <div className="bg-white dark:bg-[#141314] p-8 rounded-lg border border-[#dddddd] dark:border-[#27272a] text-center transition-colors duration-500">
            <p className="text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              No pending submissions. You're all caught up!
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141314] rounded-lg shadow-sm border border-[#dddddd] dark:border-[#27272a] overflow-hidden transition-colors duration-500">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f3f4] dark:bg-[#27272a] border-b border-[#dddddd] dark:border-[#3f3f46] text-[#454545] dark:text-[#a1a1aa] font-semibold transition-colors duration-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Tagline</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd] dark:divide-[#27272a] transition-colors duration-500">
                {entities.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-[#f4f3f4] dark:hover:bg-[#27272a] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium">{e.name}</td>
                    <td className="px-6 py-4 text-[#454545] dark:text-[#a1a1aa]">
                      {e.tagline}
                    </td>
                    <td className="px-6 py-4">
                      {e.area ? `${e.area}, ` : ""}
                      {e.city}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleApprove(e.id)}
                        disabled={actionId === e.id}
                        className="text-green-600 dark:text-green-400 font-medium hover:underline disabled:opacity-50"
                      >
                        {actionId === e.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        disabled={actionId === e.id}
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
