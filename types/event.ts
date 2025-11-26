export interface EventMedia {
  url: string
}

export interface EventParticipant {
  name: string
  role?: string
  avatar?: EventMedia
}

export interface Event {
  id: string
  title: string
  slug: string
  dateAndTime?: string
  image?: EventMedia
  description?: string
  tags?: string
  participantsTitle?: string
  participants?: EventParticipant[]
  seo?: {
    title?: string
    description?: string
  }
}
