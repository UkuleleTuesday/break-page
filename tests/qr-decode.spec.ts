import { test, expect } from '@playwright/test';
import { Browser, DecodeHintType, BarcodeFormat, BrowserQRCodeReader } from '@zxing/library';
import * as fs from 'fs';
import * as path from 'path';

test.describe('QR Code Verification', () => {
  test('should generate a QR code with the correct URL and display short URL', async ({ page }) => {
    // The default donation URL from index.html's defaults object
    const expectedUrl = 'https://buymeacoffee.com/UkuleleTuesday?utm_source=projector&utm_medium=screen&utm_campaign=break-appeal';

    await page.goto('/');

    // 1. Verify the short URL text is visible
    const qrTextElement = page.locator('#qrUrl');
    await expect(qrTextElement).toBeVisible();
    await expect(qrTextElement).toHaveText('ukuleletuesday.ie/donate');

    // 2. Take a screenshot of the QR code, which is inside the #qrWrap element
    await expect(page.locator('#qrWrap')).toBeVisible(); // Ensure the wrapper is visible first
    const qrCodeElement = page.locator('#qrWrap canvas');
    await expect(qrCodeElement).toBeVisible();

    const screenshotPath = path.join(__dirname, 'temp-qr-code.png');
    // We screenshot the wrapper to include the white padding, which is necessary for some decoders
    await page.locator('#qrWrap').screenshot({ path: screenshotPath });

    // 3. Decode the QR code image
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = `data:image/png;base64,${fs.readFileSync(screenshotPath, 'base64')}`;
    });

    const hints = new Map();
    const formats = [BarcodeFormat.QR_CODE];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    const reader = new BrowserQRCodeReader(hints);
    const result = await reader.decodeFromImageElement(image);

    // 4. Clean up the temporary screenshot file
    fs.unlinkSync(screenshotPath);

    // 5. Assert the decoded text matches the expected URL
    expect(result.getText()).toBe(expectedUrl);
  });
});
