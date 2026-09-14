# outfit-studio

An outfit generator and personal database of clothing.

Upload a photo of a clothing item and Outfit Studio takes care of the rest: an AI model cleans up the photo into an idealized, high-quality image with a transparent background, and tags it with attributes — casualness, trendiness, boldness, and warmth — that drive the outfit generator. Browse your digital closet, generate outfits tuned to those attributes, and save the combinations you like.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ and [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for running Supabase locally) and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- API keys for [Anthropic](https://console.anthropic.com/) and [OpenAI](https://platform.openai.com/)

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the local Supabase stack (Postgres + Storage), which also applies the schema migrations in `supabase/migrations/`:

   ```bash
   pnpm supabase:start
   ```

   This prints local API credentials (`API URL`, `anon key`, `service_role key`) — you'll need them in the next step.

3. Copy `.env.example` to `.env.local` and fill in every value:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to get it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `API URL` from `pnpm supabase:start` output |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon key` from `pnpm supabase:start` output |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role key` from `pnpm supabase:start` output |
   | `ANTHROPIC_API_KEY` | An API key from your [Anthropic console](https://console.anthropic.com/) — used to analyze clothing photos (category, colors, pattern, and the four rated attributes) |
   | `OPENAI_API_KEY` | An API key from your [OpenAI platform account](https://platform.openai.com/) — used to generate the idealized, transparent-background product photo for each item |

4. Run the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

5. (Optional) Seed your closet with sample photos: drop images in `seed-images/` and run `pnpm seed:photos`, which runs each one through the same analyze → idealize → save pipeline as a real upload.

### Other useful scripts

| Script | What it does |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` / `pnpm build` | Lint, type-check, and production-build the app |
| `pnpm supabase:stop` | Stop the local Supabase stack |
| `pnpm supabase:reset` | Drop and re-apply all local migrations |
| `pnpm supabase:gen-types` | Regenerate `src/types/supabase.ts` from the local database schema |
| `pnpm seed:photos` | Import photos from `seed-images/` into the closet |

## Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript), deployed with [Turbopack](https://nextjs.org/docs/architecture/turbopack).
- **UI**: [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components built on [Base UI](https://base-ui.com/) primitives; [lucide-react](https://lucide.dev/) for icons.
- **Database & storage**: [Supabase](https://supabase.com/) (Postgres + Row Level Security + Storage for clothing photos), accessed via `@supabase/supabase-js`.
- **AI**:
  - [Anthropic's Claude](https://www.anthropic.com/) (vision) analyzes each uploaded photo and extracts category, colors, pattern, and the four rated attributes (casualness, trendiness, boldness, warmth).
  - [OpenAI's image editing API](https://platform.openai.com/) turns the raw photo into an idealized, transparent-background product shot used everywhere in the UI.
- **Analytics**: [Vercel Web Analytics](https://vercel.com/docs/analytics).

### Code layout

- `src/app/` — pages and routes (App Router): the outfit generator (`/`), closet browsing and upload (`/closet`), and saved outfits (`/outfits`), plus `src/app/api/closet/upload/route.ts`, a streaming (Server-Sent Events) endpoint that reports real-time upload progress to the client.
- `src/components/` — shared UI, including the shadcn/ui primitives in `src/components/ui/`.
- `src/lib/actions/` — Next.js Server Actions that read/write the database (`items.ts`, `outfits.ts`).
- `src/lib/outfit-generator/` — the pure, framework-free logic that scores and assembles outfits from the closet against slider constraints.
- `src/lib/image-generation/` and `src/lib/anthropic.ts` — the OpenAI and Claude integrations.
- `src/lib/upload-pipeline.ts` — the shared upload pipeline (HEIC conversion, storage upload, analysis, idealization, save) used by the streaming upload route.
- `src/lib/supabase/` — Supabase client factories (browser, server, and admin/service-role clients).
- `supabase/migrations/` — SQL schema migrations (tables, enums, the storage bucket, and RLS policies).
- `scripts/` — one-off tooling: `seed-clothing-items.ts` (bulk-import photos) and `migrate-to-production.ts` (copy local closet data into a hosted Supabase project).

## Deployment

Outfit Studio is deployed on [Vercel](https://vercel.com/) with a hosted [Supabase](https://supabase.com/) project as its database and storage backend.

- **Vercel** hosts the Next.js app and is connected to this GitHub repository, so every push to `main` triggers a new production deployment. Five environment variables must be set in the Vercel project (Production and Preview): the three Supabase variables plus `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` — the same names as `.env.example`, pointed at the hosted Supabase project's credentials instead of local ones.
- **Supabase** hosts the production Postgres database and the `clothing-photos` storage bucket. To point a deployment at a (new or existing) hosted Supabase project, link this repo to it and push the schema:

  ```bash
  supabase link --project-ref <your-project-ref>
  supabase db push
  ```

  This applies every migration in `supabase/migrations/`, which creates the tables, the storage bucket, and all RLS policies — no manual setup required beyond that.
- To migrate existing local closet data into a freshly created hosted project, run `scripts/migrate-to-production.ts` (see the script for the exact env vars it expects) — it copies clothing items, outfits, and their photos over while preserving IDs.
