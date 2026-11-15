import Link from "next/link";
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

export const instant = false;

export default async function LandingPage() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("entities")
    .select("*")
    .eq("is_verified", true)
    .limit(50);

  const entities = (data || []) as Entity[];

  const investors = entities
    .filter((e) => e.entity_type === "vc" || e.entity_type === "angel_network")
    .slice(0, 6);

  return (
    <main className="min-h-screen flex flex-col items-center w-full relative bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] transition-colors duration-500">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-20 transition-opacity duration-500">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
          alt="World Map Background"
          className="absolute top-1/2 left-1/2 w-[150vw] min-w-[1500px] max-w-none -translate-x-1/2 -translate-y-1/2 blur-[2px] opacity-[0.04] dark:opacity-[0.03] dark:invert transition-all duration-500"
        />
      </div>

      <Navbar />

      <div className="w-full flex justify-center pt-28 pb-2 z-40 relative">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#141314]/80 backdrop-blur-sm border border-[#dddddd] dark:border-[#27272a] text-sm text-[#454545] dark:text-[#a1a1aa] hover:bg-white dark:hover:bg-[#27272a] transition-colors shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#2563eb]"></span>
          We just crossed 500+ verified startups
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <section className="relative w-full max-w-[1200px] mx-auto px-6 pt-16 pb-32 flex flex-col items-center text-center">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-display text-[60px] md:text-[80px] leading-[1.05] font-medium tracking-[-0.03em] max-w-[900px]">
            The definitive map of Delhi's startup ecosystem.
          </h1>
          <p className="text-[#454545] dark:text-[#a1a1aa] text-lg md:text-xl max-w-[600px] mt-8 leading-relaxed transition-colors duration-500">
            Discover 500+ startups, VCs, and angel networks shaping the future
            of Delhi NCR. Find your next investor, partner, or job.
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
            Trusted by 10,000+ founders, investors, and operators.
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
              We built this map to give founders a bird's-eye view of who is
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
                  500+
                </p>
                <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] transition-colors duration-500">
                  Startups Listed
                </p>
              </div>
              <div>
                <p className="text-3xl font-display font-medium text-[#111113] dark:text-[#fafafa] transition-colors duration-500">
                  50+
                </p>
                <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] transition-colors duration-500">
                  Active VCs & Angels
                </p>
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
                Zoom in on specific neighborhoods. Filter by sector, funding
                stage, or company size. Click any pin to see founders and
                contact info.
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
              Search by name, tags, founders, or specific tags like "Shark Tank"
              or "YC-backed".
            </p>
          </div>
          <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 space-y-3 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <Shield className="w-6 h-6 mb-4" />
            <h3 className="text-xl font-display font-medium">Verified Data</h3>
            <p className="text-sm text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              Every listing is reviewed by our team. Say goodbye to outdated
              directories.
            </p>
          </div>
          <div className="bg-[#f4f3f4] dark:bg-[#141314] rounded-[16px] p-8 space-y-3 shadow-sm border border-[#dddddd]/50 dark:border-[#27272a]/50 transition-colors duration-500">
            <Zap className="w-6 h-6 mb-4" />
            <h3 className="text-xl font-display font-medium">
              Instant Updates
            </h3>
            <p className="text-sm text-[#454545] dark:text-[#a1a1aa] transition-colors duration-500">
              Founders can submit their own startups. Profiles go live after a
              quick approval.
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
                    Get a macro-level view of how the capital region's startup
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
          Loved by the ecosystem.
        </h2>
        <div className="space-y-12">
          {[
            {
              quote:
                "This is exactly what Delhi needed. We used it to find our first angel investor in Gurugram.",
              name: "Rahul Sharma",
              role: "Founder, TechNova",
            },
            {
              quote:
                "As a VC, seeing the geographic density of startups helps us understand where the next cluster is forming.",
              name: "Priya Singh",
              role: "Partner, Capital Ventures",
            },
            {
              quote:
                "I found my current job at a startup just 2km from my house. The map is a game-changer for talent.",
              name: "Amit Kumar",
              role: "Software Engineer",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start bg-white/60 dark:bg-[#141314]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#dddddd] dark:border-[#27272a] transition-colors duration-500"
            >
              <div className="md:col-span-3">
                <p className="text-2xl md:text-3xl font-display leading-snug">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f4f3f4] dark:bg-[#27272a] border border-[#dddddd] dark:border-[#3f3f46] flex items-center justify-center font-medium transition-colors duration-500">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] transition-colors duration-500">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
              a: "We cover the entire Delhi NCR region, including Delhi, Gurugram, Noida, and Ghaziabad.",
            },
            {
              q: "How often is the data updated?",
              a: "We review submissions daily. New approved startups appear on the map immediately.",
            },
            {
              q: "Can investors use this map?",
              a: "Absolutely. Investors use it to discover new deal flow and understand market geography.",
            },
            {
              q: "Is my location precise?",
              a: "We use area-level pins for most startups unless the founder provides an exact office address.",
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
            Never miss a new startup.
          </h2>
          <p className="text-[#454545] dark:text-[#a1a1aa] text-lg mb-8 max-w-xl mx-auto transition-colors duration-500">
            Get a weekly digest of the newest startups, funding rounds, and
            ecosystem news in Delhi NCR.
          </p>

          <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full border border-[#dddddd] dark:border-[#3f3f46] focus:outline-none focus:border-[#111113] dark:focus:border-[#fafafa] bg-white dark:bg-[#09090b] transition-colors duration-500"
              required
            />
            <button
              type="button"
              className="bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-8 py-3 rounded-full font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-[#5c5c5c] dark:text-[#71717a] mt-4 transition-colors duration-500">
            No spam. Unsubscribe anytime.
          </p>
          <p className="text-xs text-[#5c5c5c] dark:text-[#71717a] mt-1 transition-colors duration-500">
            Join 5,000+ subscribers.
          </p>
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
