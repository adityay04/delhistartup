import { createStaticClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Entity } from "@/lib/types";

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

  if (!entity) {
    return { title: "Startup Not Found" };
  }

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

  if (error || !data) {
    notFound();
  }

  const entity = data as Entity;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/map"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to Map
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {entity.name}
              </h1>
              <p className="text-gray-500 mt-2 text-lg">{entity.tagline}</p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">
              {entity.entity_type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8 border-t border-gray-100 pt-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Location
              </h3>
              <p className="text-sm text-gray-900">
                {entity.area ? `${entity.area}, ` : ""}
                {entity.city}
              </p>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {entity.pin_precision === "precise"
                  ? "Exact Office Location"
                  : "Area-level Location"}
              </p>
            </div>

            {entity.website_url && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Website
                </h3>
                <a
                  href={entity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {entity.website_url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {entity.founders && entity.founders.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Founders
                </h3>
                <p className="text-sm text-gray-900">
                  {entity.founders.join(", ")}
                </p>
              </div>
            )}

            {entity.partners && entity.partners.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Partners
                </h3>
                <p className="text-sm text-gray-900">
                  {entity.partners.join(", ")}
                </p>
              </div>
            )}
          </div>

          {entity.tags && entity.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {entity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md"
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
