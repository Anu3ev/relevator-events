import { createError, defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'
import { parseEventsQuery } from '../../shared/cms'
import { getDemoEvents, isDemoMode } from '../../shared/demo'
import { EVENTS_QUERY } from '../utils/cms-queries'
import { readEventsData } from '../utils/cms-response'
import { queryDatoCms } from '../utils/datocms'

export default defineEventHandler(async (event) => {
  let input
  try {
    input = parseEventsQuery(getQuery(event))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid events query. Check first, skip, and order.' })
  }
  const config = useRuntimeConfig(event)
  if (isDemoMode(config.demoMode)) return getDemoEvents(input)
  return queryDatoCms({
    config,
    query: EVENTS_QUERY,
    variables: { first: input.first, skip: input.skip, order: [input.order] },
    readData: readEventsData
  })
})
