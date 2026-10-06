# Relevator Events

<img width="1899" height="890" alt="image" src="https://github.com/user-attachments/assets/e9de5000-ba47-479e-bed7-b95392a3c2b1" />

An event directory built with Nuxt 4, Vue 3, and TypeScript. Content comes from DatoCMS through GraphQL, with a paginated feed and individual event pages.

Built as a frontend test assignment for Relevator, covering the event UI, CMS integration, and route-driven browsing.

**[Open the live demo](https://relevator-test-l8qu.vercel.app/)**

## What you can try

- Browse events and use **Load more** to append another page
- Open an event to read its description, date, tags, and participant information
- Open an event URL directly or refresh its detail page
- Return to the directory without losing loaded events

Event times are displayed in UTC. The bundled local demo contains 25 fictional events and requires no CMS account.

## Stack and structure

- **Nuxt 4 / Vue 3:** server-rendered pages and slug-based routing
- **TypeScript:** shared event contracts and typed composables
- **Tailwind CSS 3:** styling and responsive layouts
- **DatoCMS:** published GraphQL content through server-side API routes
- **Vercel:** demo hosting

`app/pages` contains the home and event-detail routes. Reusable UI lives in `app/components`, grouped into atoms, molecules, and organisms. `app/composables` owns homepage content, feed pagination, and event lookup; `types/event.ts` defines the shared event shape.

`server/api` handles validated, read-only CMS requests. Event details reuse complete records already in the feed cache before requesting a slug directly. Both routes set page titles and descriptions from CMS data.

## Run locally

### Requirements

- Node.js 24 and npm; `.nvmrc` specifies the Node version
- For CMS mode only: a matching DatoCMS project, published records, and a read-only Content Delivery API token

### Installation

```bash
git clone https://github.com/Anu3ev/relevator-events.git
cd relevator-events
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3000. The example environment enables `NUXT_DEMO_MODE=true`, using the fictional dataset in `shared/demo.ts`.

### CMS content

To use DatoCMS, update `.env`:

```dotenv
NUXT_DEMO_MODE=false
DATOCMS_API_TOKEN=your_read_only_content_delivery_token
DATOCMS_ENVIRONMENT=main
```

`DATOCMS_ENVIRONMENT` is optional and defaults to `main`. The token stays on the server. Never use a management token or commit credentials.

The schema must match [the GraphQL queries](server/utils/cms-queries.ts):

- `homePage` with SEO data and `hero_section` / `events_section` content blocks
- `allEvents` and `_allEventsMeta` for pagination and ordering
- An `event` lookup by unique `slug`

Events include a title, slug, date/time, image, description, tags, participants, and SEO fields. Participants include a name, role, and avatar. Use the queries as the exact field reference; a token alone is insufficient if the schema differs.

### Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview the production build locally
```

## Verification

```bash
npm run check     # Lint, TypeScript, and unit tests
npx playwright install chromium
npm run test:e2e   # Builds and tests the local demo
```

CI runs these checks without CMS credentials. Tests cover pagination, Back/Forward navigation, direct URLs, UTC rendering, loading and recovery states, and narrow screens.

## Attribution and license

The repository includes Relevator branding and PP Mori font files. No license is declared; check the applicable rights before reusing or redistributing the code and assets.
