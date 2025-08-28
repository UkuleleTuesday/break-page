import { test, expect } from '@playwright/test';
import Jimp from 'jimp';
import QrCode from 'qrcode-reader';

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

    // 3. Get the base64 src and decode it
    const imgSrc = await qrCodeImage.getAttribute('src');
    expect(imgSrc).not.toBeNull();

    // Remove the data URL prefix
    const base64Data = imgSrc!.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const image = await Jimp.read(buffer);

    const qr = new QrCode();
    const result: string = await new Promise((resolve, reject) => {
      qr.callback = (err: Error | null, value: { result: string } | null) => {
        console.log('qrcode-reader callback triggered');
        console.log('Error:', err);
        console.log('Value:', value);

        if (err) {
          console.error('QR code decoding failed. Raw error:', err);
          // Attempt to get a more detailed error message
          const errorMessage = err.message || JSON.stringify(err);
          return reject(new Error(`QR code decoding failed: ${errorMessage}`));
        }
        
        if (!value || !value.result) {
            console.warn('QR code decoded, but result is empty.');
        }

        resolve(value?.result || '');
      };
      
      console.log('Attempting to decode image bitmap...');
      qr.decode(image.bitmap);
    });

    // 4. Assert the decoded text matches the expected URL
    expect(result).toBe(expectedUrl);
  });
});
