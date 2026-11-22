# 🗺️ Delhi Startup Map

An interactive directory of source-checked startups and investors across Delhi NCR. Public listings need a verification source checked within the last 90 days.

## ✨ Features

- **Interactive Map and Grid**: Browse verified, source-linked listings and filter by city, entity type, name, or tag.
- **Current Job Listings**: Show role links only when the listing is active, unexpired, and checked within the last seven days.
- **Source-Checked Profiles**: Company profiles link to their verification source and show when it was last checked.
- **Submission Review**: New listings remain unpublished until reviewed with a source URL.
- **Automated Funding Discovery**: A scheduled feed uses article-backed location checks and area-level geocoding; uncertain leads remain private for review.
- **Modern UI/UX**: Dark/Light mode with smooth transitions, a custom preloader, and a sleek, minimalist design.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.

The funding workflow uses AI to extract the company's canonical name and location from the linked article. The name must match the feed's candidate name, and the article must contain a matching location quote before a listing can be auto-published. Headline-like names are sent to review. A separate public news feed and AI-written news summaries are not implemented. Job syncing supports official ATS APIs but still needs verified company job boards registered. An empty verified-job feed is reported as unknown hiring status, not as “not hiring.”

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Map Engine**: [Mapbox GL JS](https://www.mapbox.com/)
- **Geocoding**: [OpenStreetMap Nominatim](https://nominatim.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20.9 or higher)
- A [Supabase](https://supabase.com/) account
- A [Mapbox](https://www.mapbox.com/) account (for the API token)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/delhi-startup-map.git
cd delhi-startup-map
npm install
```

### 3. Configure and migrate Supabase

Create `.env.local` with the public Supabase URL, public anon key, and Mapbox
token (used to render the interactive maps):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
APIFY_API_TOKEN=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by server-side admin moderation and
ingestion. Never expose it with a `NEXT_PUBLIC_` prefix or commit it.
Admin verification uses the public Nominatim service to create an area-level
map pin when coordinates are missing. Requests are limited to Delhi NCR,
identified as Delhi Startup Map, and serialized to no more than one request per
second within a server process. Successful coordinates are stored on the
listing so they are not geocoded again. Nominatim is a community service with
strict [usage rules](https://operations.osmfoundation.org/policies/nominatim/)
and no availability guarantee; do not use it for autocomplete or bulk geocoding.
If a lookup fails or is rate-limited, the source is saved and the admin UI shows
a warning, but the listing remains without a map pin until the lookup is retried.
Mapbox is still used to render the map and its access token remains required.

In the Supabase SQL Editor, apply
[`supabase/migrations/20261122000000_verified_sources_and_jobs.sql`](./supabase/migrations/20261122000000_verified_sources_and_jobs.sql).
It adds source-check fields to `entities` and creates the read-only public
`job_postings` table. Job writes are not exposed through the public app; an
ingestion process still needs to be configured.

Also apply
[`supabase/migrations/20261122220000_funding_lead_queue.sql`](./supabase/migrations/20261122220000_funding_lead_queue.sql).
It creates a private, service-role-only staging queue so a workflow retry
cannot lose a new discovery.

The scheduled job sync supports published postings from the official
Greenhouse, Lever, and Ashby job-board APIs. It does not crawl company pages.
Apply
[`supabase/migrations/20261122120000_job_source_registry.sql`](./supabase/migrations/20261122120000_job_source_registry.sql)
before running the sync. Add a `job_sources` row only after confirming the
company's official job board and its provider board identifier. The source
table is not readable or writable from the public app; ingestion uses the
Supabase service-role key. The stored board URL must match the selected
provider's canonical URL; the sync checks this before making requests.

Only add sources for entities whose verification source is current. In the
Supabase SQL Editor, register a board with:

```sql
INSERT INTO public.job_sources
  (entity_id, provider, board_identifier, source_url)
SELECT id, '<greenhouse|lever|ashby>', '<official-board-identifier>',
       '<canonical-HTTPS-board-URL>'
FROM public.entities
WHERE slug = '<entity-slug>'
  AND is_verified = true
  AND source_url IS NOT NULL
  AND source_checked_at >= now() - interval '90 days';
```

Use the provider's official board page for `source_url`: Greenhouse
`https://boards.greenhouse.io/<identifier>`, Lever
`https://jobs.lever.co/<identifier>`, or Ashby
`https://jobs.ashbyhq.com/<identifier>`. The sync checks those public board
APIs and stores links to the original job postings.

Configure the GitHub Actions secrets `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`, then enable the **Sync Current Startup Jobs**
workflow. It runs daily and can also be started manually. A failed board check
is logged and does not deactivate that board's previous roles; successful
checks refresh current roles and deactivate postings no longer present.

The **Daily Startup Funding Update** workflow uses the paid [Apify funding
tracker](https://apify.com/nexgendata/india-startup-funding-tracker) in watch
mode and Gemini 3.5 Flash-Lite for article extraction. The Apify actor's
current listing documents a $0.05 watch check plus $0.08 per new record; prices
may change. The first watch run seeds the actor's baseline and does not import
existing articles. Later discoveries are saved to the private queue before
verification. Only recent Inc42 or YourStory stories with an exact,
article-matched Delhi NCR location quote and a successful Nominatim area
lookup are published. When the source confirms only a city, the map pin is the
city-level centroid, not a precise office location. Leads that fail source,
location, or geocoding checks stay in the admin queue. Nominatim requests are
serialized to one per second within each process, and successful coordinates
are stored on the listing. Separate server instances do not share that limiter.

To seed up to 25 recent stories, manually dispatch this workflow with
`backfill` enabled. The batch may cost up to about $2.01 for 25 results, in
addition to the watch check; verify current Apify pricing before enabling it.
Backfill results use the same source, location, and geocoding checks.

Add the GitHub Actions secrets `APIFY_API_TOKEN` and `GEMINI_API_KEY` alongside
the Supabase secrets, then enable **Daily Startup Funding Update**. The Gemini
key is server-side only; do not use a `NEXT_PUBLIC_` prefix. Helpers can be
tested locally with
`node --test scripts/funding-processing.test.mjs scripts/nominatim.test.mjs`
without calling Apify or Gemini. Running `node daily-update.js` does call the
paid Apify actor.

For moderation, create the administrator user in Supabase Auth, enable email
sign-in, set `ADMIN_EMAIL` to that account, and add
`http://localhost:3000/auth/callback` (plus the deployed callback URL) to
Supabase Auth's allowed redirect URLs. Admin sign-in uses a one-time email
link; moderation actions also verify the signed-in email on the server.

Existing records without a source URL and recent source-check timestamp will
not appear publicly until they are reviewed and updated. Do not mark a listing
verified unless its source supports the company information and location.

`ingest.js` contains a small, fixed seed list and is not a production discovery
pipeline. Do not treat its records as source-checked. Funding discovery only
covers recent funding stories; it does not discover every Delhi NCR startup or
automatically identify job-board URLs.

### 4. Run locally

```bash
npm run dev
```

Both scheduled workflows require `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` in GitHub Actions secrets. The funding workflow
also requires `APIFY_API_TOKEN` and `GEMINI_API_KEY`. Never expose the
service-role key or Gemini key to the browser or commit them to the repository.
