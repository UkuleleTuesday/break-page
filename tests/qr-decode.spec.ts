import { test, expect } from '@playwright/test';
import { BrowserQRCodeReader } from '@zxing/library';

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
    await expect(page.locator('#qrWrap')).toBeVisible(); // Ensure the wrapper is visible first
    const qrCodeImage = page.locator('#qrWrap img');
    await expect(qrCodeImage).toBeVisible();

    // 3. Decode the QR code image from its src attribute (data URL)
    const imgSrc = await qrCodeImage.getAttribute('src');
    expect(imgSrc).not.toBeNull();

    const reader = new BrowserQRCodeReader();
    const result = await reader.decodeFromImageUrl(imgSrc!);
    
    // 4. Assert the decoded text matches the expected URL
    expect(result.getText()).toBe(expectedUrl);
  });
});
