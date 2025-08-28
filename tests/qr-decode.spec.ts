import { test, expect } from '@playwright/test';
import { readBarcodes } from 'zxing-wasm/reader';

test.describe('QR Code Verification', () => {
  test('should generate a QR code with the correct URL and display short URL', async ({ page }) => {
    // The default donation URL from index.html's defaults object
    const expectedUrl = 'https://buymeacoffee.com/UkuleleTuesday?utm_source=projector&utm_medium=screen&utm_campaign=break-appeal';

    await page.goto('/');

    // 1. Verify the short URL text is visible
    const qrTextElement = page.locator('#qrUrl');
    await expect(qrTextElement).toBeVisible();
    await expect(qrTextElement).toHaveText('ukuleletuesday.ie/donate');

    // 2. Locate the generated QR code image
    await expect(page.locator('#qrWrap')).toBeVisible();
    const qrCodeImage = page.locator('#qrWrap img');
    await expect(qrCodeImage).toBeVisible();

    // 3. Get the base64 src and decode it using zxing-wasm
    const imgSrc = await qrCodeImage.getAttribute('src');
    expect(imgSrc).not.toBeNull();

    const base64Data = imgSrc!.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const results = await readBarcodes(buffer, {
      tryHarder: true,
      formats: ['QRCode'],
      maxNumberOfSymbols: 1,
    });

    // 4. Assert the decoded text matches the expected URL
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe(expectedUrl);
  });
});
