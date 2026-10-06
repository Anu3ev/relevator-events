export interface EventDateParts {
  date: string
  time: string
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
  timeZoneName: 'short'
})

/** Format CMS ISO dates identically on the server and in every visitor's timezone. */
export function formatEventDate(value?: string | null): EventDateParts | null {
  if (typeof value !== 'string' || !value.trim()) return null

  const input = value.trim()
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i.exec(input)
  if (!parts) return null

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, timeZone] = parts
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]!) return null
  const hour = Number(hourText ?? 0)
  const minute = Number(minuteText ?? 0)
  const second = Number(secondText ?? 0)
  if (hour > 23 || minute > 59 || second > 59) return null

  // A CMS datetime without an offset is interpreted as UTC, never local browser time.
  const needsUtcOffset = Boolean(hourText) && !timeZone
  const date = new Date(needsUtcOffset ? `${input}Z` : input)
  if (Number.isNaN(date.getTime())) return null

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date)
  }
}
