import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { parseEventsQuery, parseEventSlug, EVENT_ORDERS } = await jiti.import('../../shared/cms.ts')
const { getDemoHome, getDemoEvents, getDemoEvent, isDemoMode } = await jiti.import('../../shared/demo.ts')
const { readHomePageData, readEventsData, readEventData } = await jiti.import('../utils/cms-response.ts')
const { queryDatoCms } = await jiti.import('../utils/datocms.ts')
const { EVENTS_QUERY, EVENT_QUERY } = await jiti.import('../utils/cms-queries.ts')

const config = { datocmsToken: 'fictional-test-secret', datocmsEnvironment: 'main' }
const request = { config, query: EVENTS_QUERY, readData: readEventsData }
const emptyEvents = { allEvents: [], _allEventsMeta: { count: 0 } }
const json = value => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } })

function assertPublicError(statusCode) {
  return (error) => {
    assert.equal(error.statusCode, statusCode)
    assert.ok(error.statusMessage)
    // H3 retains the sanitized constructor options as its cause, never the upstream error.
    assert.equal(error.cause?.statusCode, statusCode)
    assert.equal(JSON.stringify(error.cause).includes('fictional-test-secret'), false)
    assert.equal(JSON.stringify(error.cause).includes('PRIVATE_SCHEMA_DETAIL'), false)
    assert.equal(JSON.stringify(error).includes('fictional-test-secret'), false)
    assert.equal(JSON.stringify(error).includes('PRIVATE_SCHEMA_DETAIL'), false)
    return true
  }
}

test('event query defaults, boundaries, and supported sorting are deterministic', () => {
  assert.deepEqual(parseEventsQuery({}), { first: 12, skip: 0, order: 'dateAndTime_ASC' })
  assert.deepEqual(parseEventsQuery({ first: '100', skip: '10000', order: 'title_DESC' }), { first: 100, skip: 10000, order: 'title_DESC' })
  for (const order of EVENT_ORDERS) assert.equal(parseEventsQuery({ order }).order, order)
  for (const first of ['0', '-1', '101', '1.5', '1e2', '', ' 12', ['12'], null, true]) {
    assert.throws(() => parseEventsQuery({ first }))
  }
  for (const skip of ['-1', '10001', '1.5', 'Infinity', ['0'], null]) assert.throws(() => parseEventsQuery({ skip }))
  for (const order of ['', 'dateAndTime', 'id_ASC', ['title_ASC'], null]) assert.throws(() => parseEventsQuery({ order }))
})

test('slug validation accepts ordinary and international slugs without allowing paths', () => {
  for (const slug of ['thoughtful-ai', 'event_2026', 'München-2026']) assert.equal(parseEventSlug(slug), slug)
  for (const slug of ['', '../secrets', 'events/one', 'contains spaces', 'x'.repeat(201), undefined, ['event']]) {
    assert.throws(() => parseEventSlug(slug))
  }
})

test('demo mode requires explicit opt-in', () => {
  assert.equal(isDemoMode(true), true)
  assert.equal(isDemoMode('true'), true)
  for (const value of [false, 'false', '', '1', 1, undefined, null]) assert.equal(isDemoMode(value), false)
})

test('the fictional demo loads exactly 12, 12, and 1 unique events', () => {
  const pages = [0, 12, 24].map(skip => getDemoEvents({ first: 12, skip, order: 'dateAndTime_ASC' }))
  assert.deepEqual(pages.map(page => page.allEvents.length), [12, 12, 1])
  assert.deepEqual(pages.map(page => page._allEventsMeta.count), [25, 25, 25])
  const events = pages.flatMap(page => page.allEvents)
  assert.equal(new Set(events.map(event => event.id)).size, 25)
  assert.equal(new Set(events.map(event => event.slug)).size, 25)
  assert.ok(events.every(event => event.description.includes('fictional')))
  assert.ok(events.every(event => event.image.url.startsWith('data:image/svg+xml,')))
  assert.deepEqual(events.map(event => event.dateAndTime), events.map(event => event.dateAndTime).sort())
  assert.equal(getDemoEvents({ first: 12, skip: 25, order: 'dateAndTime_ASC' }).allEvents.length, 0)
  assert.equal(getDemoHome().homePage.content.find(block => block._modelApiKey === 'events_section').limit, 12)
})

test('demo sorting, direct detail, missing slugs, and per-request isolation agree', () => {
  const ascending = getDemoEvents({ first: 100, skip: 0, order: 'dateAndTime_ASC' }).allEvents
  const descending = getDemoEvents({ first: 100, skip: 0, order: 'dateAndTime_DESC' }).allEvents
  assert.deepEqual(descending.map(event => event.id), ascending.map(event => event.id).reverse())
  const byTitle = getDemoEvents({ first: 100, skip: 0, order: 'title_ASC' }).allEvents
  assert.deepEqual(byTitle.map(event => event.title), byTitle.map(event => event.title).sort())
  assert.deepEqual(getDemoEvent(ascending[0].slug).event, ascending[0])
  assert.deepEqual(getDemoEvent('missing-demo-event'), { event: null })
  const slug = ascending[0].slug
  const originalName = ascending[0].participants[0].name
  ascending[0].participants[0].name = 'Changed by caller'
  assert.equal(getDemoEvent(slug).event.participants[0].name, originalName)
  const home = getDemoHome()
  home.homePage.content[0].title = 'Changed by caller'
  assert.notEqual(getDemoHome().homePage.content[0].title, 'Changed by caller')
})

test('CMS nullable fields normalize to existing Event types while malformed shapes fail', () => {
  const value = { id: 'event-1', title: 'Example', slug: 'example', image: null, participants: [{ name: 'Demo', role: null, avatar: null }], seo: { title: null, description: null } }
  const normalized = readEventData({ event: value }).event
  assert.equal(normalized.image, undefined)
  assert.equal(normalized.participants[0].role, undefined)
  assert.equal(normalized.seo.title, undefined)
  assert.deepEqual(readEventData({ event: null }), { event: null })
  assert.deepEqual(readHomePageData({ homePage: null }), { homePage: null })
  assert.deepEqual(readEventsData(emptyEvents), emptyEvents)
  assert.throws(() => readEventData({}))
  assert.throws(() => readEventsData({ allEvents: [], _allEventsMeta: { count: -1 } }))
  assert.throws(() => readEventsData({ allEvents: [{ id: '1' }], _allEventsMeta: { count: 1 } }))
  assert.throws(() => readHomePageData({ homePage: { content: 'invalid' } }))
})

test('GraphQL transport uses the fixed official endpoint and private published-only headers', async () => {
  const variables = { first: 12, skip: 0, order: ['dateAndTime_ASC'] }
  const result = await queryDatoCms({ ...request, variables }, async (url, init) => {
    assert.equal(url, 'https://graphql.datocms.com/')
    assert.equal(init.method, 'POST')
    assert.equal(init.redirect, 'error')
    assert.equal(init.headers.Authorization, 'Bearer fictional-test-secret')
    assert.equal(init.headers['X-Environment'], 'main')
    assert.equal(init.headers['X-Include-Drafts'], undefined)
    assert.deepEqual(JSON.parse(init.body), { query: EVENTS_QUERY, variables })
    assert.ok(init.signal instanceof AbortSignal)
    return json({ data: emptyEvents })
  })
  assert.deepEqual(result, emptyEvents)
})

test('missing token returns a sanitized 503 and never attempts network or demo fallback', async () => {
  for (const datocmsToken of ['', '   ', undefined]) {
    await assert.rejects(queryDatoCms({ ...request, config: { datocmsToken } }, () => {
      assert.fail('No network call is allowed without a token')
    }), assertPublicError(503))
  }
})

test('HTTP, network, GraphQL, invalid JSON and invalid data errors are sanitized', async () => {
  const responses = [
    async () => new Response('fictional-test-secret PRIVATE_SCHEMA_DETAIL', { status: 401 }),
    async () => { throw new Error('fictional-test-secret PRIVATE_SCHEMA_DETAIL') },
    async () => json({ data: emptyEvents, errors: [{ message: 'fictional-test-secret PRIVATE_SCHEMA_DETAIL' }] }),
    async () => new Response('PRIVATE_SCHEMA_DETAIL', { status: 200 }),
    async () => json({ data: null }),
    async () => json({ data: { allEvents: [], _allEventsMeta: { count: '25' } } }),
    async () => json({ errors: null }),
    async () => json([])
  ]
  for (const fetcher of responses) await assert.rejects(queryDatoCms(request, fetcher), assertPublicError(502))
})

test('transport distinguishes a bounded timeout without exposing the original error', async (t) => {
  t.mock.method(globalThis, 'setTimeout', callback => {
    queueMicrotask(callback)
    return 1
  })
  t.mock.method(globalThis, 'clearTimeout', () => {})
  await assert.rejects(queryDatoCms(request, async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('fictional-test-secret')), { once: true })
  })), assertPublicError(504))
})

test('the detail query uses variables and preserves a real CMS not-found result', async () => {
  assert.match(EVENT_QUERY, /\$slug: String!/) // Slugs are never interpolated into GraphQL source.
  assert.deepEqual(await queryDatoCms({ config, query: EVENT_QUERY, variables: { slug: 'missing' }, readData: readEventData }, async () => json({ data: { event: null } })), { event: null })
})
