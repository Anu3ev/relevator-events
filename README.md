# Relevator Events

A Nuxt 4 / Vue 3 / TypeScript event directory built as a Relevator frontend test assignment. Browse a paginated feed, open event details, and return without losing loaded events. DatoCMS provides published content; Tailwind CSS handles the responsive UI.

[Live demo](https://relevator-test-l8qu.vercel.app/) · The hosted version may lag behind this branch.

## Run

Use Node 24 (`nvm use`), then:

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3000. The example enables a labelled, fictional 25-event dataset, so no CMS account is needed. All displayed times use UTC on both server and browser.

For real content, set `NUXT_DEMO_MODE=false` and `DATOCMS_API_TOKEN` to a read-only DatoCMS Content Delivery token; optionally set `DATOCMS_ENVIRONMENT` (default `main`). The token stays on the server. Never use a management token. The required models and fields are defined by the queries in `server/utils/cms-queries.ts`.

## Check and build

```sh
npm run check                 # lint, TypeScript, unit tests
npx playwright install chromium
npm run test:e2e               # builds and tests the fixture app
npm run build
npm run preview
```

Browser tests cover pagination and Back/Forward, direct URLs, UTC hydration, loading/empty/error/retry states, 404 recovery, and narrow screens. CI runs the same checks without CMS credentials.

`app/` contains pages, components, and browser state; `server/api/` contains validated, read-only CMS endpoints; `shared/` contains demo fixtures and query validation.

The original exercise branding and bundled PP Mori fonts are retained. No license is declared; check the relevant permissions before reuse or redistribution.
