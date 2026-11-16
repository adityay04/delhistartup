import { createStaticClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Entity } from "@/lib/types";
import { Map, ArrowLeft, Globe, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: entity } = await supabase
    .from("entities")
    .select("name, tagline, city")
    .eq("slug", slug)
    .single();

  if (!entity) return { title: "Startup Not Found" };

  return {
    title: `${entity.name} - Delhi Startup Map`,
    description:
      entity.tagline || `${entity.name} is a startup based in ${entity.city}.`,
  };
}

export default async function StartupProfile({ params }: Props) {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from("entities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  const entity = data as Entity;

  return (
    <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] transition-colors duration-500">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-sm text-[#5c5c5c] dark:text-[#71717a] hover:text-[#111113] dark:hover:text-[#fafafa] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </Link>

        <div className="bg-white dark:bg-[#141314] rounded-[24px] shadow-sm border border-[#dddddd] dark:border-[#27272a] p-8 md:p-12 transition-colors duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-medium text-[#111113] dark:text-[#fafafa]">
                {entity.name}
              </h1>
              <p className="text-[#454545] dark:text-[#a1a1aa] mt-3 text-lg leading-relaxed max-w-xl">
                {entity.tagline}
              </p>
            </div>
            <span className="bg-[#f4f3f4] dark:bg-[#27272a] text-[#454545] dark:text-[#a1a1aa] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap">
              {entity.entity_type.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Map className="w-4 h-4" /> Location
                </h3>
                <p className="text-base font-medium">
                  {entity.area ? `${entity.area}, ` : ""}
                  {entity.city}
                </p>
                <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] mt-1 capitalize">
                  {entity.pin_precision === "precise"
                    ? "Precise Office Location"
                    : "Area-level Location"}
                </p>
              </div>

              {entity.website_url && (
                <div>
                  <h3 className="text-xs font-bold text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Website
                  </h3>
                  <a
                    href={entity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-[#2563eb] hover:underline"
                  >
                    {entity.website_url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {entity.founders && entity.founders.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Founders
                  </h3>
                  <p className="text-base font-medium">
                    {entity.founders.join(", ")}
                  </p>
                </div>
              )}

              {entity.partners && entity.partners.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Partners
                  </h3>
                  <p className="text-base font-medium">
                    {entity.partners.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {entity.tags && entity.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
              <h3 className="text-xs font-bold text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {entity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#f4f3f4] dark:bg-[#27272a] text-[#454545] dark:text-[#a1a1aa] text-sm font-medium px-3 py-1 rounded-full transition-colors duration-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
