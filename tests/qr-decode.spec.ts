import { test, expect } from '@playwright/test';
import { readBarcodes } from 'zxing-wasm/reader';

test.describe('QR Code Verification', () => {
  test('should generate a QR code with the correct URL and display short URL', async ({ page }) => {
    // The default donation URL from index.html's defaults object
    const expectedUrl = 'ukuleletuesday.ie/donate-qr';

    await page.goto('/');

    // 1. Verify the short URL text is visible
    const qrTextElement = page.locator('#qrUrl');
    await expect(qrTextElement).toBeVisible();
    await expect(qrTextElement).toHaveText('ukuleletuesday.ie/donate');

    // 2. Locate the generated QR code image
    const qrWrap = page.locator('#qrWrap');
    await expect(qrWrap).toBeVisible();
    // The library can render an `<img>` or a `<canvas>` and may leave both in the DOM.
    // We target the one that is not hidden by `display: none`.
    const qrCodeElement = page.locator('#qrWrap > *:not([style*="display: none"])');

    // Use expect.poll to wait for the QR code to have a positive size.
    await expect.poll(async () => {
      const boundingBox = await qrCodeElement.boundingBox();
      if (!boundingBox) {
        console.log('Polling: QR image bounding box is null.');
        return false;
      }
      console.log(`Polling QR image dimensions: width=${boundingBox.width}, height=${boundingBox.height}`);
      return boundingBox.width > 0 && boundingBox.height > 0;
    }, {
      message: 'QR code image did not render with a positive size within the timeout.',
      timeout: 7000,
    }).toBe(true);

    // 3. Take a screenshot of the page and decode the QR code from it
    console.log('Taking a screenshot of the page...');
    const buffer = await page.screenshot({ fullPage: true });

    console.log('Decoding QR code from screenshot...');
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
