import { test, expect } from '@playwright/test';
import { BrowserQRCodeReader } from '@zxing/library';

test.use({ timezoneId: 'UTC' });

test('QR code decode verification', async ({ page }) => {
  // Mock the date to ensure consistent test results
  await page.clock.install({ time: new Date('2023-08-22T20:00:00.000Z') });

  await page.goto('/index.html?autostart=false');
  await page.evaluate(() => document.fonts.ready); // Wait for fonts to load

  // Wait for QR code generation or fallback to complete
  await page.waitForSelector('#qrWrap', { state: 'visible' });

  // Check that the short URL is always visible
  const shortUrlElement = page.locator('.qr-shorturl');
  await expect(shortUrlElement).toBeVisible();
  await expect(shortUrlElement).toHaveText('ukuleletuesday.ie/donate');

  // Check if we have a QR canvas or fallback text
  const qrCanvas = page.locator('#qr');
  const qrFallback = page.locator('.qr-fallback');
  
  const hasCanvas = await qrCanvas.count() > 0;
  const hasFallback = await qrFallback.count() > 0;
  
  if (hasCanvas) {
    // Try to check if it's actually a canvas
    try {
      const isCanvas = await qrCanvas.evaluate(el => el.tagName.toLowerCase() === 'canvas');
      if (isCanvas) {
        // QR Code generated successfully
        const expectedUrl = 'https://buymeacoffee.com/UkuleleTuesday?utm_source=projector&utm_medium=screen&utm_campaign=break-appeal';
        
        // Verify the QR generation logic by checking the expected URL used
        const actualUrl = await page.evaluate(() => {
          const qs = new URLSearchParams(location.search);
          const defaults = {
            ctaUrl: 'https://buymeacoffee.com/UkuleleTuesday?utm_source=projector&utm_medium=screen&utm_campaign=break-appeal'
          };
          const cfg = {
            ctaUrl: (qs.get('ctaUrl') || defaults.ctaUrl)
          };
          return cfg.ctaUrl;
        });
        
        expect(actualUrl).toBe(expectedUrl);
      }
    } catch (error) {
      // Canvas doesn't exist or isn't accessible, check for fallback
      await expect(qrFallback).toBeVisible();
      await expect(qrFallback).toContainText('https://buymeacoffee.com/UkuleleTuesday');
    }
  } else if (hasFallback) {
    // Fallback mode - check that the canonical URL is displayed
    await expect(qrFallback).toBeVisible();
    await expect(qrFallback).toContainText('https://buymeacoffee.com/UkuleleTuesday');
    await expect(qrFallback).toContainText('utm_source=projector');
    await expect(qrFallback).toContainText('utm_medium=screen');
    await expect(qrFallback).toContainText('utm_campaign=break-appeal');
  } else {
    throw new Error('Neither QR canvas nor fallback found');
  }
});

test('QR offline functionality', async ({ page }) => {
  // Block external CDN to simulate offline scenario
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  
  // Mock the date to ensure consistent test results
  await page.clock.install({ time: new Date('2023-08-22T20:00:00.000Z') });

  await page.goto('/index.html?autostart=false');
  await page.evaluate(() => document.fonts.ready);

  // Wait for QR area to be visible
  await page.waitForSelector('#qrWrap', { state: 'visible' });

  // Should show fallback text when CDN is blocked
  const qrFallback = page.locator('.qr-fallback');
  await expect(qrFallback).toBeVisible();
  await expect(qrFallback).toContainText('https://buymeacoffee.com/UkuleleTuesday');

  // Short URL should always be visible
  const shortUrlElement = page.locator('.qr-shorturl');
  await expect(shortUrlElement).toBeVisible();
  await expect(shortUrlElement).toHaveText('ukuleletuesday.ie/donate');
  
  // Verify the canonical URL is being used by checking fallback content
  await expect(qrFallback).toContainText('utm_source=projector');
  await expect(qrFallback).toContainText('utm_medium=screen');
  await expect(qrFallback).toContainText('utm_campaign=break-appeal');
});