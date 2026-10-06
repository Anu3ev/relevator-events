import type { Event } from '../types/event'
import type { EventData, EventsData, HomePageData } from '../types/cms'
import type { EventsQuery } from './cms'

// Original fictional preview content. This module contains no CMS data or credentials.
const topics = [
  ['Designing thoughtful AI interfaces', 'Explore clear feedback, useful defaults, and human control in an imagined AI workspace.', 'Design, AI'],
  ['A practical guide to accessible products', 'Practice keyboard journeys and inclusive interaction patterns with a fictional product team.', 'Accessibility, Workshop'],
  ['Small teams, useful experiments', 'Turn a broad idea into a small, measurable experiment in a hands-on sample session.', 'Product, Workshop'],
  ['Making room for better research', 'Build a lightweight research plan using invented scenarios and example interview notes.', 'Research, Community'],
  ['Systems that welcome change', 'Sketch a flexible component system for a make-believe community project.', 'Design systems, Design'],
  ['From sketches to shared understanding', 'Use simple drawings to explain trade-offs and make decisions together.', 'Collaboration, Design'],
  ['Writing for real people', 'Rewrite fictional interface copy with clear language and helpful next steps.', 'Content, Workshop'],
  ['A calmer approach to notifications', 'Explore when an imaginary service should interrupt, inform, or stay quiet.', 'Product, Design'],
  ['Prototypes with a purpose', 'Choose the smallest prototype that can answer an important product question.', 'Prototyping, Workshop'],
  ['Learning from the edges', 'Use invented edge cases to uncover more resilient interaction patterns.', 'Research, Accessibility'],
  ['The shape of a useful dashboard', 'Arrange sample metrics so a fictional team can understand what needs attention.', 'Data, Design'],
  ['Better handoffs through conversation', 'Practice a collaborative handoff between example design and engineering teams.', 'Collaboration, Engineering'],
  ['Building trust in automated tools', 'Explore visible controls and understandable outcomes in an imaginary assistant.', 'AI, Product'],
  ['Tiny details, clearer experiences', 'Study a collection of original sample forms and improve their interaction details.', 'Interaction, Workshop'],
  ['The first five minutes', 'Design an approachable first-use experience for a fictional learning service.', 'Onboarding, Design'],
  ['Making content easier to find', 'Organize an invented library with labels and navigation that explain themselves.', 'Content, Research'],
  ['A field guide to useful feedback', 'Practice giving specific, actionable critique in a relaxed demo studio session.', 'Community, Collaboration'],
  ['Working with uncertainty', 'Map assumptions and decide what to test next in a fictional product challenge.', 'Strategy, Product'],
  ['Motion with meaning', 'Explore small, purposeful transitions using original interface examples.', 'Motion, Design'],
  ['Designing for different rhythms', 'Consider slower connections, interrupted journeys, and varied working styles.', 'Accessibility, Product'],
  ['A fresh look at familiar forms', 'Simplify a fictional signup journey and make recovery paths more helpful.', 'Interaction, Workshop'],
  ['Turning insights into decisions', 'Connect invented research observations to clear next steps and testable ideas.', 'Research, Strategy'],
  ['Tools for a shared design language', 'Build a small vocabulary for discussing a make-believe product consistently.', 'Design systems, Community'],
  ['A thoughtful path to launch', 'Walk through a sample release checklist focused on clarity and reliability.', 'Engineering, Product'],
  ['What we learned together', 'Close the fictional series with a collaborative reflection and a new set of ideas.', 'Community, Reflection']
] as const

function artwork(index: number, avatar = false): string {
  const hue = (205 + index * 19) % 360
  const svg = avatar
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="hsl(${hue} 45% 30%)"/><circle cx="48" cy="35" r="15" fill="hsl(${hue} 70% 80%)"/><path d="M20 82c0-28 56-28 56 0" fill="hsl(${hue} 70% 80%)"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="hsl(${hue} 42% 16%)"/><circle cx="910" cy="170" r="270" fill="hsl(${hue} 65% 54%)" opacity=".65"/><rect x="500" y="210" width="430" height="430" rx="85" transform="rotate(-20 700 420)" fill="hsl(${(hue + 45) % 360} 70% 76%)" opacity=".8"/><circle cx="350" cy="520" r="185" fill="hsl(${hue} 65% 41%)"/><text x="64" y="94" fill="white" font-family="sans-serif" font-size="25" letter-spacing="5">RELEVATOR / FICTIONAL DEMO</text><text x="64" y="600" fill="white" font-family="sans-serif" font-size="100" font-weight="700">${String(index + 1).padStart(2, '0')}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const demoEvents: Event[] = topics.map(([title, summary, tags], index) => ({
  id: `demo-event-${index + 1}`,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  dateAndTime: new Date(Date.UTC(2026, 10, 1 + index * 3, 17)).toISOString(),
  image: { url: artwork(index) },
  description: `${summary} This is a fictional demo event, with fictional speakers; no real event or booking is represented.`,
  tags,
  participantsTitle: 'Demo speakers',
  participants: [
    { name: 'Ari Example', role: 'Fictional design facilitator', avatar: { url: artwork(index, true) } },
    { name: 'Morgan Demo', role: 'Fictional product collaborator', avatar: { url: artwork(index + 7, true) } }
  ],
  seo: { title: `${title} | Relevator Demo`, description: `Fictional demo event: ${summary}` }
}))

export function getDemoHome(): HomePageData {
  return {
    homePage: {
      content: [
        { _modelApiKey: 'hero_section', title: 'Ideas grow when we get together', subtitle: 'A fictional collection of conversations, workshops, and shared discoveries. Demo content only.' },
        { _modelApiKey: 'events_section', title: 'Upcoming demo events', limit: 12, order: 'dateAndTime_ASC' }
      ],
      seo: { title: 'Relevator Events | Fictional Demo', description: 'Explore 25 fictional events in this self-contained Relevator preview.' }
    }
  }
}

/** Return fresh objects on each request so caller mutations never alter another request. */
export function getDemoEvents({ first, skip, order }: EventsQuery): EventsData {
  const direction = order.endsWith('_DESC') ? -1 : 1
  const field = order.startsWith('title_') ? 'title' : 'dateAndTime'
  const ordered = [...demoEvents].sort((left, right) => {
    const a = left[field] ?? ''
    const b = right[field] ?? ''
    return direction * (a < b ? -1 : a > b ? 1 : 0)
  })
  return {
    allEvents: structuredClone(ordered.slice(skip, skip + first)),
    _allEventsMeta: { count: demoEvents.length }
  }
}

export function getDemoEvent(slug: string): EventData {
  return { event: structuredClone(demoEvents.find(event => event.slug === slug) ?? null) }
}

export function isDemoMode(value: unknown): boolean {
  return value === true || value === 'true'
}
