export const DEFAULT_EVENTS_LIMIT = 12
export const MAX_EVENTS_LIMIT = 100
const MAX_EVENTS_SKIP = 10_000
export const DEFAULT_EVENTS_ORDER = 'dateAndTime_ASC'
export const EVENT_ORDERS = [
  'dateAndTime_ASC',
  'dateAndTime_DESC',
  'title_ASC',
  'title_DESC'
] as const

export type EventOrder = typeof EVENT_ORDERS[number]

export interface EventsQuery {
  first: number
  skip: number
  order: EventOrder
}

export function isEventOrder(value: unknown): value is EventOrder {
  return typeof value === 'string' && EVENT_ORDERS.some(order => order === value)
}

function integerParameter({ value, fallback, min, max, name }: {
  value: unknown
  fallback: number
  min: number
  max: number
  name: string
}): number {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`)
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`)
  }
  return parsed
}

/** Query-string validation is shared and pure so it can be tested without Nuxt. */
export function parseEventsQuery(query: Record<string, unknown>): EventsQuery {
  const order = query.order === undefined ? DEFAULT_EVENTS_ORDER : query.order
  if (!isEventOrder(order)) throw new Error('Unsupported event order')
  return {
    first: integerParameter({ value: query.first, fallback: DEFAULT_EVENTS_LIMIT, min: 1, max: MAX_EVENTS_LIMIT, name: 'first' }),
    skip: integerParameter({ value: query.skip, fallback: 0, min: 0, max: MAX_EVENTS_SKIP, name: 'skip' }),
    order
  }
}

export function parseEventSlug(value: unknown): string {
  if (typeof value !== 'string' || value.length > 200 || !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(value)) {
    throw new Error('Invalid event slug')
  }
  return value
}
