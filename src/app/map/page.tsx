"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MapLoader } from "@/components/map/MapLoader";
import { useMapStore } from "@/store/mapStore";
import type { Entity } from "@/lib/types";

export default function MapPage() {
  const { entities, setEntities, selectedId, select, filters, setFilters } =
    useMapStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("entities")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setEntities(data as Entity[]);
        }
        setLoading(false);
      });
  }, [setEntities]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (filters.city && e.city !== filters.city) return false;
      if (filters.type && e.entity_type !== filters.type) return false;
      if (filters.q) {
        const query = filters.q.toLowerCase();
        const matchName = e.name.toLowerCase().includes(query);
        const matchTags = e.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchTags) return false;
      }
      return true;
    });
  }, [entities, filters]);

  if (error) {
    return (
      <main className="p-8 font-mono text-sm text-red-600 bg-[#fcfcfd]">
        DB error: {error}
      </main>
    );
  }

  return (
    <main className="h-screen w-screen flex bg-[#fcfcfd] text-[#141314] font-sans">
      <aside className="w-[400px] border-r border-[#dddddd] overflow-y-auto bg-[#fcfcfd] flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="sticky top-0 bg-[#fcfcfd] border-b border-[#dddddd] p-5 space-y-4 z-10">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="font-display font-medium text-xl hover:opacity-80 transition-opacity"
            >
              Delhi Startup Map
            </Link>
            <div className="flex gap-2">
              <Link
                href="/admin"
                className="text-sm text-[#454545] border border-[#dddddd] px-4 py-2 rounded-full hover:bg-[#f4f3f4] transition-colors font-medium"
              >
                Admin
              </Link>
              <Link
                href="/submit"
                className="text-sm bg-[#111113] text-white px-5 py-2 rounded-full hover:bg-black transition-colors font-medium"
              >
                + Add
              </Link>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search startups, tags..."
              value={filters.q || ""}
              onChange={(e) => setFilters({ q: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#f4f3f4] border border-transparent rounded-full text-sm focus:outline-none focus:border-[#111113] focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.city || ""}
              onChange={(e) =>
                setFilters({ city: e.target.value || undefined })
              }
              className="flex-1 px-3 py-2 bg-[#f4f3f4] border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:border-[#111113] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              <option value="Delhi">Delhi</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Noida">Noida</option>
              <option value="Ghaziabad">Ghaziabad</option>
            </select>

            <select
              value={filters.type || ""}
              onChange={(e) =>
                setFilters({ type: e.target.value || undefined })
              }
              className="flex-1 px-3 py-2 bg-[#f4f3f4] border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:border-[#111113] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="startup">Startups</option>
              <option value="vc">VCs</option>
              <option value="angel_network">Angels</option>
            </select>
          </div>

          <div className="text-xs text-[#5c5c5c] text-center pt-1 font-medium">
            {loading
              ? "Loading…"
              : `${filteredEntities.length} of ${entities.length} listings`}
          </div>
        </div>

        <ul className="flex-1">
          {filteredEntities.map((e) => (
            <li
              key={e.id}
              className={`border-b border-[#dddddd] ${selectedId === e.id ? "bg-[#f4f3f4]" : ""}`}
            >
              <div
                onClick={() => select(e.id)}
                className={`cursor-pointer w-full text-left p-5 transition-colors ${
                  selectedId === e.id
                    ? "border-l-4 border-l-[#111113]"
                    : "hover:bg-[#f4f3f4] border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-base text-[#141314]">
                    {e.name}
                  </div>
                  <Link
                    href={`/startup/${e.slug}`}
                    className="text-xs font-medium text-[#2563eb] hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    View Profile
                  </Link>
                </div>

                <div className="text-[#454545] text-sm mb-3">
                  {e.area ? `${e.area}, ` : ""}
                  {e.city} · {e.entity_type === "vc" ? "VC" : "Startup"}
                </div>

                {e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {e.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#e5e5e5] text-[#454545] text-[10px] font-medium px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
          {filteredEntities.length === 0 && (
            <li className="p-8 text-sm text-[#5c5c5c] text-center">
              No results found.
            </li>
          )}
        </ul>
      </aside>
      <section className="flex-1 relative bg-[#f4f3f4]">
        <MapLoader entities={filteredEntities} />
      </section>
    </main>
  );
}
