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
    const qrCodeImage = page.locator('#qrWrap img');

    // Use expect.poll to wait for the QR code image to have a positive size.
    // This is more reliable than toBeVisible() for elements that might take time to render.
    await expect.poll(async () => {
      const boundingBox = await qrCodeImage.boundingBox();
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

    // 3. Get the base64 src and decode it using zxing-wasm
    const imgSrc = await qrCodeImage.getAttribute('src');
    expect(imgSrc, '#qrWrap img should have a "src" attribute.').not.toBeNull();

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
