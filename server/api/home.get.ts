import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getDemoHome, isDemoMode } from '../../shared/demo'
import { HOME_PAGE_QUERY } from '../utils/cms-queries'
import { readHomePageData } from '../utils/cms-response'
import { queryDatoCms } from '../utils/datocms'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (isDemoMode(config.demoMode)) return getDemoHome()
  return queryDatoCms({ config, query: HOME_PAGE_QUERY, readData: readHomePageData })
})
