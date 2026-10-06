import { createError } from 'h3'

interface DatoCmsConfig {
  datocmsToken?: unknown
  datocmsEnvironment?: unknown
}

interface GraphQLRequest<T> {
  config: DatoCmsConfig
  query: string
  variables?: Record<string, unknown>
  readData: (value: unknown) => T
}

/** Server-only transport: never accept a destination, token, or query from a client. */
export async function queryDatoCms<T>(
  { config, query, variables = {}, readData }: GraphQLRequest<T>,
  fetcher: typeof fetch = globalThis.fetch
): Promise<T> {
  const token = typeof config.datocmsToken === 'string' ? config.datocmsToken.trim() : ''
  if (!token) {
    throw createError({ statusCode: 503, statusMessage: 'Content service is not configured. Set DATOCMS_API_TOKEN or enable demo mode.' })
  }
  const environment = typeof config.datocmsEnvironment === 'string' && config.datocmsEnvironment.trim()
    ? config.datocmsEnvironment.trim()
    : 'main'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetcher('https://graphql.datocms.com/', {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Environment': environment
        // Deliberately no X-Include-Drafts: only published content is requested.
      },
      body: JSON.stringify({ query, variables })
    })
    if (!response.ok) throw new Error('CMS request failed')
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid CMS response')
    const result = payload as Record<string, unknown>
    if (result.errors !== undefined && (!Array.isArray(result.errors) || result.errors.length > 0)) {
      throw new Error('CMS query failed')
    }
    return readData(result.data)
  } catch {
    // Upstream bodies/errors can contain credentials, queries, and schema internals.
    // Do not attach a cause, raw response, or original error to the public H3 error.
    throw createError(controller.signal.aborted
      ? { statusCode: 504, statusMessage: 'Content service timed out. Please try again.' }
      : { statusCode: 502, statusMessage: 'Content service is temporarily unavailable. Please try again.' })
  } finally {
    clearTimeout(timeout)
  }
}
