import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useRuntimeConfig } from '#imports'
import { parseEventSlug } from '../../../shared/cms'
import { getDemoEvent, isDemoMode } from '../../../shared/demo'
import { EVENT_QUERY } from '../../utils/cms-queries'
import { readEventData } from '../../utils/cms-response'
import { queryDatoCms } from '../../utils/datocms'

export default defineEventHandler(async (event) => {
  let slug
  try {
    slug = parseEventSlug(getRouterParam(event, 'slug', { decode: true }))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event slug.' })
  }
  const config = useRuntimeConfig(event)
  if (isDemoMode(config.demoMode)) return getDemoEvent(slug)
  return queryDatoCms({ config, query: EVENT_QUERY, variables: { slug }, readData: readEventData })
})
