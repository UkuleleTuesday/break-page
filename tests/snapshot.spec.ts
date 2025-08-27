import { test, expect } from '@playwright/test';

test('visual regression for index.html', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Let fonts load and animations settle

  // Pause the timer to get a stable screenshot by clicking a non-interactive area.
  await page.locator('.wrap').click({ position: { x: 1, y: 1 } });

  await expect(page).toHaveScreenshot('index.html.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixels: 100,
    timeout: 10_000
  });
});
