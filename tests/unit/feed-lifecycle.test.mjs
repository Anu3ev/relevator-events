import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { computed, createSSRApp, effectScope, h, nextTick, onScopeDispose, ref, watch, withAsyncContext } from 'vue'
import { renderToString } from 'vue/server-renderer'

const jiti = createJiti(import.meta.url)
const { useEventsFeed } = await jiti.import('../../app/composables/useEventsFeed.ts')

function page(ids) {
  return {
    allEvents: ids.map(id => ({ id: String(id), slug: `event-${id}`, title: `Event ${id}` })),
    _allEventsMeta: { count: 5 }
  }
}

function mockRuntime({ t, fetcher }) {
  const states = new Map()
  const runtime = {
    ref, computed, watch, onScopeDispose,
    useState(key, initial) {
      if (!states.has(key)) states.set(key, ref(initial()))
      return states.get(key)
    },
    useAsyncData(_key, handler) {
      const data = ref()
      const error = ref(null)
      const status = ref('pending')
      const controller = new AbortController()
      const refresh = async () => {
        status.value = 'pending'
        try {
          data.value = await handler(undefined, { signal: controller.signal })
          status.value = 'success'
        } catch (reason) {
          error.value = reason
          status.value = 'error'
        }
      }
      const result = { data, error, status, refresh }
      // Deliberately allow late data here: the composable must dispose its own watcher.
      return Object.assign(refresh().then(() => result), result)
    },
    $fetch: fetcher
  }

  for (const [key, value] of Object.entries(runtime)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous)
      else delete globalThis[key]
    })
  }
}

function openFeed(t) {
  const scope = effectScope()
  t.after(() => scope.stop())
  const ready = scope.run(() => useEventsFeed({
    perPage: computed(() => 2),
    order: computed(() => 'dateAndTime_ASC')
  }))
  return { scope, ready }
}

test('SSR includes the initial events before hydration', async (t) => {
  mockRuntime({ t, fetcher: async () => page([1, 2]) })
  const app = createSSRApp({
    async setup() {
      const [ready, restore] = withAsyncContext(() => useEventsFeed({
        perPage: computed(() => 2),
        order: computed(() => 'dateAndTime_ASC')
      }))
      const feed = await ready
      restore()
      return () => h('p', feed.events.value.map(event => event.title).join(', '))
    }
  })

  assert.equal(await renderToString(app), '<p>Event 1, Event 2</p>')
})

test('a disposed page cannot populate the feed from a late initial response', async (t) => {
  const response = Promise.withResolvers()
  mockRuntime({ t, fetcher: () => response.promise })
  const { scope, ready } = openFeed(t)

  scope.stop()
  response.resolve(page([1, 2]))
  const feed = await ready
  await nextTick()

  assert.deepEqual(feed.events.value, [])
  assert.equal(feed.totalCount.value, 0)
  assert.equal(feed.hasMore.value, false)
})

test('leaving the page aborts pagination and ignores its late response on return', async (t) => {
  const oldResponse = Promise.withResolvers()
  const newResponse = Promise.withResolvers()
  const requests = []
  mockRuntime({
    t,
    fetcher: (_url, options) => {
      requests.push(options)
      if (options.query.skip === 0) return Promise.resolve(page([1, 2]))
      return requests.length === 2 ? oldResponse.promise : newResponse.promise
    }
  })
  const firstPage = openFeed(t)
  const firstFeed = await firstPage.ready
  const oldRequest = firstFeed.loadMore()
  assert.equal(firstFeed.loadingMore.value, true)

  firstPage.scope.stop()
  assert.equal(requests[1].signal?.aborted, true)
  const nextFeed = await openFeed(t).ready
  assert.deepEqual(nextFeed.events.value.map(event => event.id), ['1', '2'])
  assert.equal(nextFeed.loadingMore.value, false)
  assert.equal(nextFeed.loadMoreError.value, null)

  const newRequest = nextFeed.loadMore()
  assert.deepEqual(requests.map(request => request.query.skip), [0, 2, 2])
  oldResponse.resolve(page([8, 9]))
  await oldRequest
  assert.deepEqual(nextFeed.events.value.map(event => event.id), ['1', '2'])
  assert.equal(nextFeed.loadingMore.value, true)
  assert.equal(nextFeed.loadMoreError.value, null)

  newResponse.resolve(page([3, 4]))
  await newRequest
  assert.deepEqual(nextFeed.events.value.map(event => event.id), ['1', '2', '3', '4'])
  assert.equal(nextFeed.loadingMore.value, false)
})

test('loaded pages and the next offset survive returning to the feed', async (t) => {
  const offsets = []
  mockRuntime({
    t,
    fetcher: async (_url, options) => {
      offsets.push(options.query.skip)
      if (options.query.skip === 0) return page([1, 2])
      if (options.query.skip === 2) return page([3, 4])
      return page([5])
    }
  })
  const firstPage = openFeed(t)
  const firstFeed = await firstPage.ready
  await firstFeed.loadMore()
  firstPage.scope.stop()

  const nextFeed = await openFeed(t).ready
  assert.deepEqual(nextFeed.events.value.map(event => event.id), ['1', '2', '3', '4'])
  assert.equal(nextFeed.loadingMore.value, false)
  assert.deepEqual(offsets, [0, 2])

  await nextFeed.loadMore()
  assert.deepEqual(offsets, [0, 2, 4])
  assert.deepEqual(nextFeed.events.value.map(event => event.id), ['1', '2', '3', '4', '5'])
  assert.equal(nextFeed.hasMore.value, false)
})

test('failed pagination keeps loaded events and retries the same offset', async (t) => {
  const offsets = []
  let fail = true
  mockRuntime({
    t,
    fetcher: async (_url, options) => {
      offsets.push(options.query.skip)
      if (options.query.skip === 0) return page([1, 2])
      if (fail) throw new Error('Temporary failure')
      return page([3, 4])
    }
  })
  const feed = await openFeed(t).ready
  await feed.loadMore()
  assert.deepEqual(feed.events.value.map(event => event.id), ['1', '2'])
  assert.equal(feed.loadingMore.value, false)
  assert.match(feed.loadMoreError.value, /could not load more events/i)

  fail = false
  await feed.loadMore()
  assert.deepEqual(offsets, [0, 2, 2])
  assert.deepEqual(feed.events.value.map(event => event.id), ['1', '2', '3', '4'])
  assert.equal(feed.loadMoreError.value, null)
})
