"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MapLoader } from "@/components/map/MapLoader";
import { GridView } from "@/components/GridView";
import { useMapStore } from "@/store/mapStore";
import type { Entity } from "@/lib/types";
import { Map, Sun, Moon, LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";

export default function MapPage() {
  const {
    entities,
    setEntities,
    selectedId,
    select,
    filters,
    setFilters,
    viewMode,
    setViewMode,
  } = useMapStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
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
      <main className="p-8 font-mono text-sm text-red-600 bg-[#fcfcfd] dark:bg-[#09090b]">
        DB error: {error}
      </main>
    );
  }

  if (!mounted) return null;

  return (
    <main className="h-screen w-screen flex bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] font-sans transition-colors duration-500 overflow-hidden">
      <aside className="w-[400px] border-r border-[#dddddd] dark:border-[#27272a] bg-[#fcfcfd] dark:bg-[#09090b] flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-500 shrink-0">
        <div className="bg-[#fcfcfd] dark:bg-[#09090b] border-b border-[#dddddd] dark:border-[#27272a] p-5 space-y-4 z-10 transition-colors duration-500">
          <div className="flex justify-between items-center w-full gap-2">
            <Link
              href="/"
              className="font-display font-medium text-lg hover:opacity-80 transition-opacity flex items-center gap-2 shrink-0"
            >
              <Map className="w-5 h-5" />{" "}
              <span className="whitespace-nowrap hidden lg:block">
                Delhi Startup Map
              </span>
            </Link>

            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="p-2 rounded-full hover:bg-[#f4f3f4] dark:hover:bg-[#27272a] transition-colors shrink-0"
              >
                {resolvedTheme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
              <Link
                href="/admin"
                className="text-xs font-medium text-[#454545] dark:text-[#a1a1aa] border border-[#dddddd] dark:border-[#27272a] px-3 py-1.5 rounded-full hover:bg-[#f4f3f4] dark:hover:bg-[#27272a] transition-colors whitespace-nowrap"
              >
                Admin
              </Link>
              <Link
                href="/submit"
                className="text-xs font-medium bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-3 py-1.5 rounded-full hover:bg-black dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
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
              className="w-full px-4 py-2.5 bg-[#f4f3f4] dark:bg-[#141314] border border-transparent dark:border-[#27272a] rounded-full text-sm focus:outline-none focus:border-[#111113] dark:focus:border-[#fafafa] transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.city || ""}
              onChange={(e) =>
                setFilters({ city: e.target.value || undefined })
              }
              className="flex-1 px-3 py-2 bg-[#f4f3f4] dark:bg-[#141314] border border-transparent dark:border-[#27272a] rounded-xl text-sm font-medium focus:outline-none focus:border-[#111113] dark:focus:border-[#fafafa] transition-all appearance-none cursor-pointer"
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
              className="flex-1 px-3 py-2 bg-[#f4f3f4] dark:bg-[#141314] border border-transparent dark:border-[#27272a] rounded-xl text-sm font-medium focus:outline-none focus:border-[#111113] dark:focus:border-[#fafafa] transition-all appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="startup">Startups</option>
              <option value="vc">VCs</option>
              <option value="angel_network">Angels</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-[#5c5c5c] dark:text-[#71717a] font-medium">
              {loading ? "Loading…" : `${filteredEntities.length} listings`}
            </div>

            <div className="flex bg-[#f4f3f4] dark:bg-[#141314] p-1 rounded-full border border-transparent dark:border-[#27272a]">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-white dark:bg-[#27272a] text-[#111113] dark:text-[#fafafa] shadow-sm"
                    : "text-[#5c5c5c] dark:text-[#71717a] hover:text-[#111113] dark:hover:text-[#fafafa]"
                }`}
              >
                <Map className="w-3.5 h-3.5" /> Map
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#27272a] text-[#111113] dark:text-[#fafafa] shadow-sm"
                    : "text-[#5c5c5c] dark:text-[#71717a] hover:text-[#111113] dark:hover:text-[#fafafa]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
            </div>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredEntities.map((e) => (
            <li key={e.id}>
              <div
                onClick={() => select(e.id)}
                className={`cursor-pointer w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selectedId === e.id
                    ? "bg-[#f4f3f4] dark:bg-[#141314] border-[#111113] dark:border-[#fafafa] shadow-sm"
                    : "bg-transparent border-transparent hover:bg-[#f4f3f4] dark:hover:bg-[#141314]"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-display font-medium text-base text-[#141314] dark:text-[#fafafa]">
                    {e.name}
                  </div>
                  <Link
                    href={`/startup/${e.slug}`}
                    className="text-xs font-medium text-[#2563eb] hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    View
                  </Link>
                </div>

                <div className="text-[#454545] dark:text-[#a1a1aa] text-sm mb-3">
                  {e.area ? `${e.area}, ` : ""}
                  {e.city} · {e.entity_type === "vc" ? "VC" : "Startup"}
                </div>

                {e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {e.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#e5e5e5] dark:bg-[#27272a] text-[#454545] dark:text-[#a1a1aa] text-[10px] font-medium px-2 py-0.5 rounded-full"
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
            <li className="p-8 text-sm text-[#5c5c5c] dark:text-[#71717a] text-center">
              No results found.
            </li>
          )}
        </ul>
      </aside>

      <section className="flex-1 relative bg-[#f4f3f4] dark:bg-[#141314] transition-colors duration-500 overflow-y-auto">
        {viewMode === "map" ? (
          <MapLoader entities={filteredEntities} />
        ) : (
          <GridView entities={filteredEntities} />
        )}
      </section>
    </main>
  );
}
