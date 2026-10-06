// These fixed, read-only queries preserve the existing project's DatoCMS model schema.
const EVENT_FIELDS = `
  id
  title
  slug
  dateAndTime
  image { url }
  description
  tags
  participantsTitle
  participants {
    name
    role
    avatar { url }
  }
  seo { title description }
`

export const HOME_PAGE_QUERY = `
  query HomePage {
    homePage {
      content {
        ... on EventsSectionRecord {
          _modelApiKey
          title
          limit
          order
        }
        ... on HeroSectionRecord {
          _modelApiKey
          title
          subtitle
        }
      }
      seo { title description }
    }
  }
`

export const EVENTS_QUERY = `
  query AllEvents($first: IntType!, $skip: IntType!, $order: [EventModelOrderBy!]!) {
    allEvents(orderBy: $order, first: $first, skip: $skip) {
      ${EVENT_FIELDS}
    }
    _allEventsMeta { count }
  }
`

export const EVENT_QUERY = `
  query EventBySlug($slug: String!) {
    event(filter: { slug: { eq: $slug } }) {
      ${EVENT_FIELDS}
    }
  }
`
