import { expect, test, type APIRequestContext, type Page, type Route } from '@playwright/test'
import type { Event } from '../../types/event'

interface FeedResponse {
  allEvents: Event[]
  _allEventsMeta: { count: number }
}

const feedURL = /\/api\/events(?:\?.*)?$/
const cards = (page: Page) => page.getByTestId('event-card')
const loadMore = (page: Page) => page.getByRole('button', { name: /^load more$/i })
const retry = (page: Page) => page.getByRole('button', { name: /^try again$/i })

async function fixturePage(request: APIRequestContext, skip = 0): Promise<FeedResponse> {
  const response = await request.get(`/api/events?first=12&skip=${skip}&order=dateAndTime_ASC`)
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function firstEvent(request: APIRequestContext): Promise<Event> {
  const feed = await fixturePage(request)
  expect(feed.allEvents.length).toBeGreaterThan(0)
  return feed.allEvents[0]!
}

async function openDetail(page: Page, request: APIRequestContext) {
  const event = await firstEvent(request)
  const response = await page.goto(`/${event.slug}`)
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: event.title, exact: true })).toBeVisible()
  return event
}

async function returnToFeed(page: Page) {
  await page.getByRole('link', { name: /^back to events$/i }).click()
  await expect(page).toHaveURL(/\/#events$/)
}

async function expectUniqueCards(page: Page, count: number) {
  await expect(cards(page)).toHaveCount(count)
  const hrefs = await cards(page).evaluateAll(elements => elements.map(element => element.getAttribute('href')))
  expect(hrefs.every(Boolean)).toBeTruthy()
  expect(new Set(hrefs).size).toBe(count)
}

async function fulfillJSON(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
}

test('fixture API gives three stable pages and explicit missing details', async ({ request }) => {
  const pages = await Promise.all([0, 12, 24].map(skip => fixturePage(request, skip)))
  expect(pages.map(page => page.allEvents.length)).toEqual([12, 12, 1])
  expect(pages.map(page => page._allEventsMeta.count)).toEqual([25, 25, 25])
  const events = pages.flatMap(page => page.allEvents)
  expect(new Set(events.map(event => event.id)).size).toBe(25)
  expect(new Set(events.map(event => event.slug)).size).toBe(25)
  const detail = await request.get(`/api/events/${events[0]!.slug}`)
  expect(detail.ok()).toBeTruthy()
  expect((await detail.json()).event.slug).toBe(events[0]!.slug)
  const missing = await request.get('/api/events/this-event-does-not-exist')
  expect([200, 404]).toContain(missing.status())
  expect((await missing.json()).event).toBeNull()
})

test('home renders real navigation and paginates 12 → 24 → 25 without duplicates', async ({ page }) => {
  await page.goto('/')
  await expectUniqueCards(page, 12)
  const browse = page.getByRole('banner').getByRole('link', { name: /^browse events$/i })
  await expect(browse).toHaveAttribute('href', '/#events')
  await browse.click()
  await expect(page).toHaveURL(/\/#events$/)
  await expect(page.locator('#events')).toBeInViewport()
  await loadMore(page).click()
  await expectUniqueCards(page, 24)
  await loadMore(page).click()
  await expectUniqueCards(page, 25)
  await expect(loadMore(page)).toHaveCount(0)
})

test('page-two cards and scroll survive browser back/forward and detail back links', async ({ page }) => {
  await page.goto('/#events')
  await expectUniqueCards(page, 12)
  await loadMore(page).click()
  await expectUniqueCards(page, 24)
  const card = cards(page).nth(16)
  await card.scrollIntoViewIfNeeded()
  const title = await card.getByRole('heading').innerText()
  const href = await card.getAttribute('href')
  const previousScroll = await page.evaluate(() => window.scrollY)
  expect(previousScroll).toBeGreaterThan(0)
  await card.click()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await page.goBack()
  await expectUniqueCards(page, 24)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(previousScroll - 120)
  await expect(card).toBeInViewport()
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await returnToFeed(page)
  await expectUniqueCards(page, 24)
  await expect(page.locator('#events')).toBeInViewport()
})

test('a directly loaded detail survives refresh', async ({ page, request }) => {
  const event = await openDetail(page, request)
  const response = await page.reload()
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1, name: event.title, exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /^back to events$/i })).toHaveAttribute('href', '/#events')
})

test('unknown details return HTTP 404 with branded, working recovery', async ({ page }) => {
  const response = await page.goto('/this-event-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: /event not found/i })).toBeVisible()
  await expect(page.getByRole('banner')).toBeVisible()
  const browse = page.getByRole('main').getByRole('link', { name: /^browse events$/i })
  await expect(browse).toHaveAttribute('href', '/#events')
  await browse.click()
  await expect(page).toHaveURL(/\/#events$/)
  await expectUniqueCards(page, 12)
})

test('initial loading, error, and retry remain visible even with no cards', async ({ page, request }) => {
  await openDetail(page, request)
  const pending = deferred()
  let failRequests = true
  await page.route(feedURL, async (route) => {
    if (failRequests) {
      await pending.promise
      await fulfillJSON(route, { statusMessage: 'Temporary event failure' }, 503)
    }
    else {
      await route.continue()
    }
  })
  await returnToFeed(page)
  await expect(page.locator('#events')).toBeVisible()
  await expect(page.getByText(/loading events/i)).toBeVisible()
  await expect(cards(page)).toHaveCount(0)
  pending.resolve()
  await expect(retry(page)).toBeVisible()
  await expect(cards(page)).toHaveCount(0)
  failRequests = false
  await retry(page).click()
  await expectUniqueCards(page, 12)
  await expect(retry(page)).toHaveCount(0)
})

test('empty results have a visible, non-error state', async ({ page, request }) => {
  await openDetail(page, request)
  await page.route(feedURL, route => fulfillJSON(route, { allEvents: [], _allEventsMeta: { count: 0 } }))
  await returnToFeed(page)
  await expect(page.locator('#events')).toBeVisible()
  await expect(page.getByText(/no events found/i)).toBeVisible()
  await expect(cards(page)).toHaveCount(0)
  await expect(loadMore(page)).toHaveCount(0)
  await expect(retry(page)).toHaveCount(0)
})

test('a pagination failure keeps loaded cards and retries the same offset', async ({ page }) => {
  await page.goto('/#events')
  await expectUniqueCards(page, 12)
  const offsets: string[] = []
  let failRequests = true
  await page.route(feedURL, async (route) => {
    offsets.push(new URL(route.request().url()).searchParams.get('skip') ?? '')
    if (failRequests) {
      await fulfillJSON(route, { statusMessage: 'Temporary pagination failure' }, 503)
    }
    else {
      await route.continue()
    }
  })
  await loadMore(page).click()
  await expect(retry(page)).toBeVisible()
  await expectUniqueCards(page, 12)
  const failedRequests = offsets.length
  failRequests = false
  await retry(page).click()
  await expectUniqueCards(page, 24)
  expect(offsets.length).toBe(failedRequests + 1)
  expect(offsets.every(offset => offset === '12')).toBe(true)
})

test('rapid load-more activation cannot issue duplicate pages', async ({ page }) => {
  await page.goto('/#events')
  await expectUniqueCards(page, 12)
  const pending = deferred()
  let requests = 0
  await page.route(feedURL, async (route) => {
    requests += 1
    await pending.promise
    await route.continue()
  })
  await loadMore(page).evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  const loading = page.getByRole('button', { name: /^loading\.{3}$/i })
  await expect(loading).toBeVisible()
  await expect(loading).toBeDisabled()
  pending.resolve()
  await expectUniqueCards(page, 24)
  expect(requests).toBe(1)
})

test('home-content failure does not hide an independently healthy event feed', async ({ page, request }) => {
  await openDetail(page, request)
  await page.route(/\/api\/home(?:\?.*)?$/, route => fulfillJSON(route, { statusMessage: 'Temporary CMS failure' }, 503))
  await returnToFeed(page)
  await expectUniqueCards(page, 12)
  await expect(page.locator('#events')).toBeVisible()
  await expect(loadMore(page)).toBeVisible()
})

test.describe('UTC rendering', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })

  test('SSR and hydration agree across server/browser timezones', async ({ page, request }) => {
    const event = await firstEvent(request)
    expect(event.dateAndTime).toBeTruthy()
    const date = new Date(event.dateAndTime!)
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    }).format(date)
    const expectedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: 'UTC',
    }).format(date)
    const hydrationProblems: string[] = []
    page.on('console', message => {
      if (/hydration|mismatch/i.test(message.text())) hydrationProblems.push(message.text())
    })
    page.on('pageerror', error => hydrationProblems.push(error.message))
    const response = await page.goto(`/${event.slug}`)
    const html = await response!.text()
    expect(html).toContain(expectedDate)
    expect(html).toContain(expectedTime)
    await expect(page.getByRole('main').getByText(expectedDate, { exact: true })).toBeVisible()
    await expect(page.getByRole('main').getByText(expectedTime, { exact: true })).toBeVisible()
    await returnToFeed(page)
    await expectUniqueCards(page, 12)
    await expect(cards(page).first()).toContainText(expectedDate)
    await expect(cards(page).first()).toContainText(expectedTime)
    expect(hydrationProblems).toEqual([])
  })
})

for (const width of [320, 375, 390, 1280]) {
  test(`list and detail fit a ${width}px viewport`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#events')
    await expectUniqueCards(page, 12)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`events-${width}.png`), fullPage: true })
    await cards(page).first().click()
    await expect(page.getByRole('link', { name: /^back to events$/i })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`event-detail-${width}.png`), fullPage: true })
  })
}


test('opening different cards replaces the detail title and metadata', async ({ page }) => {
  await page.goto('/#events')
  await expectUniqueCards(page, 12)
  const firstTitle = await cards(page).first().getByRole('heading').innerText()
  const nextTitle = await cards(page).nth(1).getByRole('heading').innerText()
  await cards(page).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstTitle)
  await returnToFeed(page)
  await cards(page).nth(1).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nextTitle)
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(firstTitle)
})

test('long titles, unbroken tags, participant names, and missing media fit mobile', async ({ page, request }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await openDetail(page, request)
  const longEvent: Event = {
    id: 'long-content-test',
    slug: 'long-content-test',
    title: 'AnExtremelyLongUnbrokenEventTitleToExerciseSmallScreenWrappingWithoutHorizontalOverflow',
    tags: 'AnExtremelyLongUnbrokenTagThatMustWrapWithinItsChip,Music,Conversation',
    dateAndTime: 'not-a-date',
    description: 'A readable description with no event image or participant avatar available.',
    participantsTitle: 'People joining this conversation',
    participants: [{
      name: 'AnExtremelyLongUnbrokenParticipantNameThatMustNotOverflow',
      role: 'AnExtremelyLongUnbrokenParticipantRoleThatMustNotOverflow',
    }],
  }
  await page.route(feedURL, route => fulfillJSON(route, { allEvents: [longEvent], _allEventsMeta: { count: 1 } }))
  await returnToFeed(page)
  await expectUniqueCards(page, 1)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await cards(page).first().click()
  await expect(page.getByRole('heading', { level: 1, name: longEvent.title })).toBeVisible()
  await expect(page.getByText(longEvent.participants![0]!.name, { exact: true })).toBeVisible()
  await expect(page.getByText(/invalid date/i)).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('long-detail-320.png'), fullPage: true })
})

test('return-to-events waits for delayed home content before scrolling to the feed', async ({ page, request }) => {
  await openDetail(page, request)
  const pending = deferred()
  let requested = false
  await page.route(/\/api\/home(?:\?.*)?$/, async (route) => {
    requested = true
    await pending.promise
    await route.continue()
  })
  await page.getByRole('link', { name: /^back to events$/i }).click()
  await expect.poll(() => requested).toBe(true)
  pending.resolve()
  await expect(page).toHaveURL(/\/#events$/)
  await expectUniqueCards(page, 12)
  await expect(page.locator('#events')).toBeInViewport()
})

test('API rejects invalid pagination and order before reading content', async ({ request }) => {
  for (const query of ['first=0', 'first=101', 'skip=-1', 'skip=10001', 'order=arbitrary', 'first=12&first=24']) {
    const response = await request.get(`/api/events?${query}`)
    expect(response.status()).toBe(400)
    expect(await response.text()).not.toContain('Authorization')
  }
  const slug = await request.get('/api/events/bad%20slug')
  expect(slug.status()).toBe(400)
})

test('unsupported CMS feed settings fall back to a valid event query', async ({ page, request }) => {
  await openDetail(page, request)
  await page.route(/\/api\/home(?:\?.*)?$/, route => fulfillJSON(route, {
    homePage: {
      content: [{ _modelApiKey: 'events_section', title: 'Events', limit: 1000, order: 'unsupported' }],
    },
  }))
  const feedRequest = page.waitForRequest(request => feedURL.test(request.url()))
  await returnToFeed(page)
  const query = new URL((await feedRequest).url()).searchParams
  expect(query.get('first')).toBe('100')
  expect(query.get('order')).toBe('dateAndTime_ASC')
  await expectUniqueCards(page, 25)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Discover music events')
})
