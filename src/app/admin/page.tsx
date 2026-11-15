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
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Moderate new startup submissions.
            </p>
          </div>
          <Link href="/map" className="text-sm text-blue-600 hover:underline">
            ← Back to Map
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading pending submissions...</p>
        ) : entities.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">
              No pending submissions. You are all caught up!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Tagline</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entities.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{e.name}</td>
                    <td className="px-6 py-4 text-gray-600">{e.tagline}</td>
                    <td className="px-6 py-4">
                      {e.area ? `${e.area}, ` : ""}
                      {e.city}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleApprove(e.id)}
                        disabled={actionId === e.id}
                        className="text-green-600 font-medium hover:underline disabled:opacity-50"
                      >
                        {actionId === e.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        disabled={actionId === e.id}
                        className="text-red-600 font-medium hover:underline disabled:opacity-50"
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
