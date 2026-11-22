import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Map,
  Shield,
  Zap,
  Search,
  Building2,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { StaticMapLoader } from "@/components/map/StaticMapLoader";
import { Navbar } from "@/components/Navbar";
import type { Entity } from "@/lib/types";
import {
  ENTITY_SOURCE_MAX_AGE_DAYS,
  getFreshnessCutoff,
} from "@/lib/dataFreshness";

export const instant = false;

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] p-8 text-sm">
          Loading source-checked listings…
        </main>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}

async function LandingPageContent() {
  await connection();
  const supabase = createStaticClient();
  const { data, count, error } = await supabase
    .from("entities")
    .select("*", { count: "exact" })
    .eq("is_verified", true)
    .not("source_url", "is", null)
    .gte(
      "source_checked_at",
      getFreshnessCutoff(ENTITY_SOURCE_MAX_AGE_DAYS),
    )
    .order("name")
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] p-8 text-[#141314] dark:text-[#fafafa]">
        <h1 className="text-xl font-medium">Directory setup required</h1>
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          Unable to load source-checked listings: {error.message}
        </p>
        <p className="mt-2 text-sm text-[#5c5c5c] dark:text-[#a1a1aa]">
          Apply the Supabase migration documented in the README, then reload.
        </p>
      </main>
    );
  }

  const entities = (data || []) as Entity[];
  const verifiedListingCount = count ?? 0;

  const investors = entities
    .filter((e) => e.entity_type === "vc" || e.entity_type === "angel_network")
    .slice(0, 6);

  return (
    <main className="min-h-screen flex flex-col items-center w-full relative bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] transition-colors duration-500">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2074&auto=format&fit=crop"
          alt="Rotating Globe Background"
          className="w-[120vw] max-w-none min-w-[1200px] aspect-square object-cover rounded-full grayscale opacity-[0.15] dark:opacity-[0.1] blur-[2px] animate-spin-slow transition-opacity duration-500"
        />
      </div>

      <Navbar />

      <div className="w-full flex justify-center pt-28 pb-2 z-40 relative">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#141314]/80 backdrop-blur-sm border border-[#dddddd] dark:border-[#27272a] text-sm text-[#454545] dark:text-[#a1a1aa] hover:bg-white dark:hover:bg-[#27272a] transition-colors shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#2563eb]"></span>
          Browse {verifiedListingCount} source-checked listings
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <section className="relative w-full max-w-[1200px] mx-auto px-6 pt-16 pb-32 flex flex-col items-center text-center">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-display text-[60px] md:text-[80px] leading-[1.05] font-medium tracking-[-0.03em] max-w-[900px]">
            The definitive map of Delhi&apos;s startup ecosystem.
          </h1>
          <p className="text-[#454545] dark:text-[#a1a1aa] text-lg md:text-xl max-w-[600px] mt-8 leading-relaxed transition-colors duration-500">
            Explore source-checked startups, investors, and angel networks
            across Delhi NCR. Current openings link back to their original
            listings.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link
              href="/map"
              className="bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-8 py-4 rounded-full text-base font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors w-full sm:w-auto"
            >
              Explore the Map
            </Link>
            <Link
              href="/submit"
              className="bg-white dark:bg-transparent border border-[#dddddd] dark:border-[#27272a] text-[#111113] dark:text-[#fafafa] px-8 py-4 rounded-full text-base font-medium hover:bg-[#f4f3f4] dark:hover:bg-[#141314] transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Submit Your Startup <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] mt-8 font-medium transition-colors duration-500">
            Listing sources are reviewed and dated so you can judge how current
            the information is.
          </p>
        </div>
      </section>

      <section
        id="about"
        className="w-full max-w-[1200px] mx-auto px-6 py-24 border-t border-[#dddddd] dark:border-[#27272a] relative z-10 transition-colors duration-500 scroll-mt-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-[#5c5c5c] dark:text-[#71717a] mb-6 transition-colors duration-500">
              Our Mission
            </h2>
            <p className="text-3xl md:text-5xl font-display font-medium leading-tight">
              We believe the best way to understand an ecosystem is to see it.
            </p>
          </div>
          <div className="space-y-6 text-[#454545] dark:text-[#a1a1aa] text-lg bg-white/60 dark:bg-[#141314]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
            <p>
              Delhi NCR is one of the most vibrant startup hubs in the world,
              but its geography is fragmented across Delhi, Gurugram, and Noida.
              We built this map to give founders a bird&apos;s-eye view of who is
              building what, and where.
            </p>
            <p>
              Whether you are looking for a specific VC office in Connaught
              Place or trying to find the next deep-tech unicorn in Sector 62,
              our interactive map makes the ecosystem navigable.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
              <div>
                <p className="text-3xl font-display font-medium text-[#111113] dark:text-[#fafafa] transition-colors duration-500">
                  {verifiedListingCount}
                </p>
                <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] transition-colors duration-500">
                  Current source-checked listings
                </p>
              </div>
              <div className="flex items-center text-sm text-[#5c5c5c] dark:text-[#71717a]">
                Company and job pages link to their source.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="investors"
        className="w-full max-w-[1200px] mx-auto px-6 py-24 border-t border-[#dddddd] dark:border-[#27272a] relative z-10 transition-colors duration-500 scroll-mt-32"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-[#5c5c5c] dark:text-[#71717a] mb-4 transition-colors duration-500">
              The Capital
            </h2>
            <h3 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
              Backed by the best.
            </h3>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:underline pb-2"
          >
            View all investors on the map <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 border border-[#dddddd]/50 dark:border-[#27272a]/50 hover:border-[#111113] dark:hover:border-[#fafafa] transition-all duration-300 group cursor-default"
            >
              <div className="w-12 h-12 bg-white dark:bg-[#09090b] rounded-full flex items-center justify-center border border-[#dddddd] dark:border-[#27272a] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-[#111113] dark:text-[#fafafa]" />
              </div>
              <h4 className="text-xl font-display font-medium mb-2">
                {investor.name}
              </h4>
              <p className="text-sm text-[#454545] dark:text-[#a1a1aa] line-clamp-2 mb-4">
                {investor.tagline}
              </p>
              <p className="text-xs font-medium text-[#5c5c5c] dark:text-[#71717a] uppercase tracking-wider">
                {investor.area || investor.city}
              </p>
            </div>
          ))}

          {investors.length === 0 && (
            <div className="col-span-3 text-center p-12 bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] border border-[#dddddd] dark:border-[#27272a]">
              <p className="text-[#5c5c5c] dark:text-[#71717a]">
                Add VCs to your database to see them here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-6 py-24 border-t border-[#dddddd] dark:border-[#27272a] relative z-10 transition-colors duration-500">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4">
            Everything you need to navigate the ecosystem.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-12 flex flex-col md:flex-row items-center gap-12 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <div className="flex-1 space-y-4">
              <div className="h-12 w-12 bg-white dark:bg-[#09090b] rounded-full flex items-center justify-center border border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
                <Map className="w-6 h-6 text-[#111113] dark:text-[#fafafa]" />
              </div>
              <h3 className="text-2xl font-display font-medium">
                Interactive Geospatial Map
              </h3>
              <p className="text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
                Explore verified listings by city or entity type. Pins use
                known coordinates only; listings without a verified location
                are not assigned a guessed pin.
              </p>
            </div>
            <div className="flex-1 w-full bg-white dark:bg-[#09090b] rounded-xl border border-[#dddddd] dark:border-[#27272a] h-[300px] relative overflow-hidden shadow-sm transition-colors duration-500">
              <StaticMapLoader entities={entities} />
            </div>
          </div>

          <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 space-y-3 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <Search className="w-6 h-6 mb-4" />
            <h3 className="text-xl font-display font-medium">
              Advanced Filtering
            </h3>
            <p className="text-sm text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              Search by company name or tags, and filter by city or entity
              type.
            </p>
          </div>
          <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 space-y-3 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <Shield className="w-6 h-6 mb-4" />
            <h3 className="text-xl font-display font-medium">Verified Data</h3>
            <p className="text-sm text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              Public listings include a source reviewed within the last 90
              days. Older or unsourced records stay off the public map.
            </p>
          </div>
          <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 space-y-3 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <Zap className="w-6 h-6 mb-4" />
            <h3 className="text-xl font-display font-medium">
              Instant Updates
            </h3>
            <p className="text-sm text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              Submissions include a source link and are published only after
              review.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-6 py-24 border-t border-[#dddddd] dark:border-[#27272a] relative z-10 transition-colors duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 bg-white/60 dark:bg-[#141314]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
            <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
              Why use the map?
            </h2>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <div className="mt-1">
                  <Building2 className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">For Founders</h4>
                  <p className="text-[#454545] dark:text-[#a1a1aa] mt-1 transition-colors duration-500">
                    Find nearby investors, co-working spaces, and potential
                    partners.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1">
                  <TrendingUp className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">For Investors</h4>
                  <p className="text-[#454545] dark:text-[#a1a1aa] mt-1 transition-colors duration-500">
                    Spot emerging clusters of innovation and discover deal flow
                    in your backyard.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1">
                  <Users className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">For Talent</h4>
                  <p className="text-[#454545] dark:text-[#a1a1aa] mt-1 transition-colors duration-500">
                    Find startups near you and skip the long commutes.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1">
                  <Globe className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">For the Ecosystem</h4>
                  <p className="text-[#454545] dark:text-[#a1a1aa] mt-1 transition-colors duration-500">
                    Get a macro-level view of how the capital region&apos;s startup
                    landscape is evolving.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="w-full h-[500px] bg-white dark:bg-[#09090b] rounded-[16px] border border-[#dddddd] dark:border-[#27272a] relative overflow-hidden shadow-sm transition-colors duration-500">
            <StaticMapLoader entities={entities} />
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-6 py-24 border-t border-[#dddddd] dark:border-[#27272a] relative z-10 transition-colors duration-500">
        <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-16">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 bg-white/60 dark:bg-[#141314]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#dddddd] dark:border-[#27272a] transition-colors duration-500">
          {[
            {
              q: "Is the map free to use?",
              a: "Yes, the directory and map are completely free for everyone.",
            },
            {
              q: "How do I get my startup listed?",
              a: "Click 'Submit Startup' in the header, fill out the form, and our team will review it.",
            },
            {
              q: "What areas are covered?",
              a: "We cover Delhi NCR, including Delhi, Gurugram, Noida, Ghaziabad, and Faridabad.",
            },
            {
              q: "How often is the data updated?",
              a: "Listings are visible after review and a source check. We do not yet run an automated jobs provider.",
            },
            {
              q: "Can investors use this map?",
              a: "Absolutely. Investors use it to discover new deal flow and understand market geography.",
            },
            {
              q: "Is my location precise?",
              a: "We only plot listings with known coordinates. Submissions without a verified location are not given a guessed pin.",
            },
          ].map((faq, i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-lg font-medium font-display">{faq.q}</h4>
              <p className="text-[#454545] dark:text-[#a1a1aa] leading-relaxed transition-colors duration-500">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-6 py-24 relative z-10">
        <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-12 md:p-24 text-center shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
          <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4">
            See the source behind each listing.
          </h2>
          <p className="text-[#454545] dark:text-[#a1a1aa] text-lg mb-8 max-w-xl mx-auto transition-colors duration-500">
            Company profiles show where their information came from and when
            it was last checked. Job links point to the original opening.
          </p>
          <Link
            href="/map"
            className="inline-flex bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-8 py-3 rounded-full font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
          >
            Browse current listings
          </Link>
        </div>
      </section>

      <footer className="w-full border-t border-[#dddddd] dark:border-[#27272a] pt-24 pb-12 mt-12 relative z-10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors duration-500">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="md:col-span-2">
              <p className="text-xl font-medium font-display mb-4">
                Delhi Startup Map
              </p>
              <p className="text-[#454545] dark:text-[#a1a1aa] max-w-sm mb-8 transition-colors duration-500">
                The definitive geographic directory of the Delhi NCR startup
                ecosystem.
              </p>
              <div className="flex gap-4 text-sm font-medium text-[#5c5c5c] dark:text-[#71717a] transition-colors duration-500">
                <a
                  href="#"
                  className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                >
                  Instagram
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium mb-4">Product</p>
              <ul className="space-y-3 text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
                <li>
                  <Link
                    href="/map"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    Interactive Map
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    Submit a Startup
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-4">Company</p>
              <ul className="space-y-3 text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#111113] dark:hover:text-[#fafafa]"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end border-t border-[#dddddd] dark:border-[#27272a] pt-8 transition-colors duration-500">
            <p className="text-sm text-[#5c5c5c] dark:text-[#71717a]">
              © 2026 Delhi Startup Map. All rights reserved.
            </p>
            <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] mt-4 md:mt-0">
              Built for the Delhi ecosystem.
            </p>
          </div>

          <div className="mt-12">
            <h1 className="text-[15vw] font-display font-medium leading-none tracking-tighter text-[#f4f3f4] dark:text-[#141314] select-none text-center transition-colors duration-500">
              DELHI.
            </h1>
          </div>
        </div>
      </footer>
    </main>
  );
}
