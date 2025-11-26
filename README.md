## Relevator Events

This project is a Nuxt 4 app that showcases events curated in DatoCMS. It renders a hero section, a paginated feed, and dynamic event detail pages, all styled with Tailwind CSS utilities and the PP Mori font family.

Tech stack: Nuxt 4, TypeScript, Tailwind CSS, DatoCMS.

**Requirements**
- Node.js 20 or newer (Nuxt 4 officially supports Active LTS and Current releases).
- A readonly DatoCMS API token scoped to query the necessary models.

### How the app is structured
- `app/pages` holds route-driven views. `index.vue` renders the hero and feed, while `[slug].vue` handles an event detail view with graceful 404 handling.
- `app/components` follows the Atomic Design tiers (atoms -> molecules -> organisms) so UI pieces stay reusable. Examples: `BaseChip`, `EventGrid`, `ParticipantRow`.
- `app/composables` contains typed GraphQL hooks such as `useHomePageContent`, `useEventsFeed`, and `useEventDetail`. They hide the query strings, state management, and caching logic.
- `types` centralizes shared TypeScript contracts like `Event`, so pages and composables agree on the schema returned by DatoCMS.
- Styling comes from Tailwind (configured in `tailwind.config.ts`).

### Getting started
1. **Clone and install**
   ```bash
   git clone git@github.com:Anu3ev/relevator-test.git
   cd relevator-test
   npm install
   ```
2. **Configure environment**
   - Create a `.env` file (or export vars in your shell).
   - Set `DATOCMS_API_TOKEN=<your-readonly-token>`.
   - Optionally set `DATOCMS_ENVIRONMENT=<environment-name>` if you use non-default environments.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   The site boots at `http://localhost:3000`.
4. **Production build**
   ```bash
   npm run build && npm run preview
   ```

### Notable decisions
- **Data lives in composables**: All DatoCMS queries sit in dedicated composables so both pages and future components can reuse them without duplicating GraphQL strings.
- **Optimistic caching**: `useEventDetail` first checks `useState('events-feed')`. If a visitor clicks an event from the list we reuse the already downloaded payload and avoid another network call.
- **Guarded navigation**: The `[slug]` page watches the async state, throws a Nuxt `createError` when nothing is found, and keeps the UI consistent with the home page error handling.
- **SEO friendly head management**: Both pages call `useHead` to inject per-page titles and descriptions that come straight from the CMS.

### Future improvements
- Cache GraphQL responses inside Nuxt server routes or API handlers (for example `server/api/events.ts`) using `cachedEventHandler`, Nitro storage, or edge caches so repeat visits avoid re-fetching identical payloads from DatoCMS.
- Prefetch event detail data while a card is visible or hovered by enabling `<NuxtLink prefetch>` or calling `prefetchRoute` so client-side navigations feel instant by having the data ready before the user navigates.
- If the content is mostly read-heavy, add route rules to statically prerender the home page and each `/[slug]` route and optionally revalidate them through CMS webhooks so the CDN can serve most traffic without cold starts.
