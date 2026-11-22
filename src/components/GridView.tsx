"use client";

import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import type { Entity } from "@/lib/types";

export function GridView({ entities }: { entities: Entity[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="group bg-white dark:bg-[#141314] rounded-[16px] border border-[#dddddd] dark:border-[#27272a] p-6 hover:shadow-lg hover:border-[#111113] dark:hover:border-[#fafafa] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#f4f3f4] dark:bg-[#27272a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {entity.logo_url ? (
                  <img
                    src={entity.logo_url}
                    alt={entity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-[#5c5c5c] dark:text-[#71717a]">
                    {entity.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/startup/${entity.slug}`}
                    className="font-display font-medium text-lg text-[#141314] dark:text-[#fafafa] group-hover:text-[#2563eb] transition-colors truncate"
                  >
                    {entity.name}
                  </Link>
                  {entity.stage && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f4f3f4] dark:bg-[#27272a] text-[#5c5c5c] dark:text-[#71717a] whitespace-nowrap">
                      {entity.stage}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#454545] dark:text-[#a1a1aa] line-clamp-2 mt-1">
                  {entity.tagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5c5c5c] dark:text-[#71717a] mb-4">
              {entity.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-[#f4f3f4] dark:bg-[#27272a]"
                >
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {entity.area || entity.city}
              </span>
              {entity.founded_year && <span>· {entity.founded_year}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#dddddd] dark:border-[#27272a]">
            {entity.open_roles_count ? (
              <span className="text-sm font-medium text-[#2563eb]">
                {entity.open_roles_count} current role
                {entity.open_roles_count > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-sm text-[#5c5c5c] dark:text-[#71717a]">
                Hiring status unverified
              </span>
            )}
            <Link
              href={`/startup/${entity.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:underline"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
