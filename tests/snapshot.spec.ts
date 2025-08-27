import { test, expect } from '@playwright/test';

test('visual regression for index.html', async ({ page }) => {
  await page.goto('/index.html?autostart=false', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Let fonts load and animations settle

  await expect(page).toHaveScreenshot('index.html.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixels: 100,
    timeout: 10_000
  });
});
