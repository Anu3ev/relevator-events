import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { formatEventDate } from '../../app/utils/eventDate.ts'

const formatterURL = new URL('../../app/utils/eventDate.ts', import.meta.url).href

test('missing and invalid dates do not crash rendering', () => {
  for (const value of [undefined, null, '', 'not-a-date', '2026-99-99T25:00:00Z', '2026-02-29', '2026-04-31', '2026-10-07T24:30:00Z', '   ']) {
    assert.equal(formatEventDate(value), null)
  }
})

test('formats the calendar date and time consistently in UTC', () => {
  assert.deepEqual(formatEventDate('2026-10-07T00:30:00Z'), {
    date: 'Oct 7, 2026',
    time: '12:30 AM UTC',
  })
  assert.deepEqual(formatEventDate('2026-10-07T19:05:00Z'), {
    date: 'Oct 7, 2026',
    time: '7:05 PM UTC',
  })
})

test('normalizes explicit source timezone offsets before display', () => {
  assert.deepEqual(formatEventDate('2026-10-06T20:30:00-04:00'), {
    date: 'Oct 7, 2026',
    time: '12:30 AM UTC',
  })
})

test('a timezone-free ISO datetime is interpreted as UTC', () => {
  assert.deepEqual(formatEventDate('2026-10-07T00:30:00'), {
    date: 'Oct 7, 2026',
    time: '12:30 AM UTC',
  })
})

test('server and client host timezones cannot change the output', () => {
  const source = `import { formatEventDate } from ${JSON.stringify(formatterURL)}; console.log(JSON.stringify(formatEventDate('2026-10-07T00:30:00Z')))`
  const results = ['UTC', 'America/Los_Angeles', 'Asia/Tokyo'].map(TZ => execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', source],
    { env: { ...process.env, TZ }, encoding: 'utf8' },
  ).trim())
  assert.equal(new Set(results).size, 1)
  assert.deepEqual(JSON.parse(results[0]), { date: 'Oct 7, 2026', time: '12:30 AM UTC' })
})
