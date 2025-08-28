import { test, expect } from '@playwright/test';
import { readBarcodes } from 'zxing-wasm/reader';

test.describe('QR Code Verification', () => {
  test('should generate a QR code with the correct URL and display short URL', async ({ page }) => {
    console.log('Starting QR code verification test...');
    // The default donation URL from index.html's defaults object
    const expectedUrl = 'ukuleletuesday.ie/donate-qr';
    console.log(`Expected URL in QR code: ${expectedUrl}`);

    console.log('Navigating to page...');
    await page.goto('/');
    console.log('Page navigation complete.');

    // 1. Verify the short URL text is visible
    console.log('Locating #qrUrl element...');
    const qrTextElement = page.locator('#qrUrl');
    console.log('Checking if #qrUrl is visible...');
    await expect(qrTextElement).toBeVisible();
    console.log('#qrUrl is visible.');
    const qrTextContent = await qrTextElement.textContent();
    console.log(`Actual text content of #qrUrl: "${qrTextContent}"`);
    await expect(qrTextElement).toHaveText('ukuleletuesday.ie/donate');
    console.log('#qrUrl text content is correct.');

    // 2. Locate the generated QR code image
    console.log('Locating #qrWrap element...');
    const qrWrap = page.locator('#qrWrap');
    console.log('Checking if #qrWrap is visible...');
    await expect(qrWrap).toBeVisible();
    console.log('#qrWrap is visible.');
    console.log('Locating #qrWrap img element...');
    const qrCodeImage = page.locator('#qrWrap img');
    console.log('Checking if #qrWrap img is visible...');

    // Instead of toBeVisible(), check if the element has a positive bounding box.
    // This can be more reliable for images that are dynamically loaded or sized.
    await expect(qrCodeImage).toHaveBoundingBox({ width: (w) => w > 0, height: (h) => h > 0, timeout: 7000 });

    console.log('#qrWrap img has positive dimensions and is considered visible.');

    // 3. Get the base64 src and decode it using zxing-wasm
    console.log('Getting "src" attribute from QR code image...');
    const imgSrc = await qrCodeImage.getAttribute('src');
    expect(imgSrc).not.toBeNull();

    expect(imgSrc, '#qrWrap img should have a "src" attribute.').not.toBeNull();
    console.log(`Image src attribute found: ${imgSrc!.substring(0, 50)}...`);

    const base64Data = imgSrc!.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('Decoding QR code from image buffer...');

    const results = await readBarcodes(buffer, {
      tryHarder: true,
      formats: ['QRCode'],
      maxNumberOfSymbols: 1,
    });
    console.log(`Found ${results.length} QR codes.`);

    // 4. Assert the decoded text matches the expected URL
    expect(results).toHaveLength(1);
    const decodedText = results[0].text;
    console.log(`Decoded QR code text: "${decodedText}"`);
    expect(decodedText).toBe(expectedUrl);
    console.log('QR code content matches expected URL. Test finished.');
  });
});
