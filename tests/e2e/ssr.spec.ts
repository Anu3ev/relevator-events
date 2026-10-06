import { expect, test, type APIRequestContext } from '@playwright/test'
import type { Event } from '../../types/event'

const privateTokenSentinel = 'e2e-private-cms-token-never-expose'

function cardsIn(html: string) {
  return [...html.matchAll(/data-testid="event-card"/g)].length
}

function eventLinksIn(html: string) {
  return [...html.matchAll(/<a\b(?=[^>]*data-testid="event-card")(?=[^>]*href="([^"]+)")[^>]*>/g)].map(match => match[1])
}

async function fixtures(request: APIRequestContext): Promise<Event[]> {
  const response = await request.get('/api/events?first=100&skip=0&order=dateAndTime_ASC')
  expect(response.status()).toBe(200)
  return (await response.json()).allEvents
}

test('SSR homepage returns 12 cards, UTC dates, working browse targets, and no private config', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(cardsIn(html)).toBe(12)
  expect(html).toContain('id="events"')
  expect(html).toContain('All event times are shown in UTC.')
  expect(html).toContain('5:00 PM UTC')
  expect(html).toMatch(/<a\b[^>]*href="\/#events"[^>]*>[\s\S]*?Browse events[\s\S]*?<\/a>/)
  expect(html).toContain('Sample event directory.')
  expect(html).not.toContain(privateTokenSentinel)
  expect(html).not.toContain('datocmsToken')
  expect(html).not.toContain('DATOCMS_API_TOKEN')
  const links = eventLinksIn(html)
  expect(links).toHaveLength(12)
  expect(new Set(links).size).toBe(12)
  for (const href of [links[0]!, links[11]!]) {
    expect((await request.get(href)).status()).toBe(200)
  }
})

test('SSR direct detail has full event content, UTC dates, and the return anchor', async ({ request }) => {
  const event = (await fixtures(request))[16]!
  const response = await request.get(`/${event.slug}`)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain(event.title)
  expect(html).toContain(event.description!)
  expect(html).toMatch(/<h1\b[^>]*>/)
  expect(html).toContain('5:00 PM UTC')
  expect(html).toMatch(/<a\b(?=[^>]*href="\/#events")(?=[^>]*aria-label="Back to events")[^>]*>/)
  expect(html).not.toContain(privateTokenSentinel)
  expect(cardsIn(html)).toBe(0)
})

test('SSR missing details return a branded HTTP 404 with recovery navigation', async ({ request }) => {
  const response = await request.get('/ssr-missing-event-that-does-not-exist')
  expect(response.status()).toBe(404)
  const html = await response.text()
  expect(html).toMatch(/<h1\b[^>]*>Event not found<\/h1>/)
  expect(html).toContain('Relevator events')
  expect(html).toMatch(/<header\b/)
  expect(html).toMatch(/<a\b[^>]*href="\/#events"[^>]*>[\s\S]*?Browse events[\s\S]*?<\/a>/)
  expect(html).not.toContain(privateTokenSentinel)
  expect(html).not.toContain('node_modules')
})

test('SSR state remains isolated across independent concurrent request contexts', async ({ playwright, baseURL, request }) => {
  const events = await fixtures(request)
  const left = await playwright.request.newContext({ baseURL })
  const right = await playwright.request.newContext({ baseURL })
  try {
    const [leftDetail, rightDetail] = await Promise.all([
      left.get(`/${events[0]!.slug}`),
      right.get(`/${events[24]!.slug}`),
    ])
    expect(leftDetail.status()).toBe(200)
    expect(rightDetail.status()).toBe(200)
    const leftHTML = await leftDetail.text()
    const rightHTML = await rightDetail.text()
    expect(leftHTML).toContain(events[0]!.title)
    expect(leftHTML).not.toContain(events[24]!.title)
    expect(rightHTML).toContain(events[24]!.title)
    expect(rightHTML).not.toContain(events[0]!.title)
    await left.get('/api/events?first=12&skip=12&order=dateAndTime_ASC')
    const [leftHome, rightHome] = await Promise.all([left.get('/'), right.get('/')])
    const [leftHomeHTML, rightHomeHTML] = await Promise.all([leftHome.text(), rightHome.text()])
    expect(cardsIn(leftHomeHTML)).toBe(12)
    expect(cardsIn(rightHomeHTML)).toBe(12)
    expect(eventLinksIn(leftHomeHTML)).toEqual(events.slice(0, 12).map(event => `/${event.slug}`))
    expect(eventLinksIn(rightHomeHTML)).toEqual(eventLinksIn(leftHomeHTML))
    expect(rightHomeHTML).not.toContain(events[24]!.title)
  }
  finally {
    await Promise.all([left.dispose(), right.dispose()])
  }
})

test('public JavaScript assets contain no private CMS credential or client CMS transport', async ({ request }) => {
  const html = await (await request.get('/')).text()
  const assets = new Set([...html.matchAll(/(?:src|href)="(\/_nuxt\/[^"?#]+\.js)"/g)].map(match => match[1]!))
  expect(assets.size).toBeGreaterThan(0)
  for (const asset of assets) {
    const response = await request.get(asset)
    expect(response.status()).toBe(200)
    const source = await response.text()
    expect(source).not.toContain(privateTokenSentinel)
    expect(source).not.toContain('datocmsToken')
    expect(source).not.toContain('DATOCMS_API_TOKEN')
    expect(source).not.toContain('graphql.datocms.com')
  }
})
