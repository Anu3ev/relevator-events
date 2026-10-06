import { defineConfig, devices } from '@playwright/test'

const port = 3100
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: {
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      },
    },
  }],
  webServer: {
    command: process.env.PLAYWRIGHT_SKIP_BUILD
      ? 'node .output/server/index.mjs'
      : 'npm run build && node .output/server/index.mjs',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NUXT_DEMO_MODE: 'true',
      // Synthetic server-only value lets SSR tests detect accidental credential exposure.
      NUXT_DATOCMS_TOKEN: 'e2e-private-cms-token-never-expose',
      DATOCMS_API_TOKEN: '',
      PORT: String(port),
      HOST: '127.0.0.1',
      TZ: 'UTC',
    },
  },
})
