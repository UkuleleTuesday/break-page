import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'iPad Pro 11',
      use: { 
        ...devices['iPad Pro 11'],
        hasTouch: true,
      },
    },
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: false,
      },
    },
    {
      name: 'Galaxy Tab S9',
      use: { 
        ...devices['Galaxy Tab S9'],
        hasTouch: true,
      },
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
     command: 'python3 -m http.server',
     url: 'http://localhost:8000',
     reuseExistingServer: !process.env.CI,
     stdout: 'ignore',
     stderr: 'ignore',
  },
});
