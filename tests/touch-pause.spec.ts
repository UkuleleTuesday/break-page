import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test.describe('Touch Pause Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the date for consistent test results
    await page.clock.install({ time: new Date('2023-08-22T20:00:00.000Z') });
    
    // Navigate to the app with autostart=false so we can control the initial state
    await page.goto('/index.html?autostart=false&minutes=1');
    await page.evaluate(() => document.fonts.ready); // Wait for fonts to load
  });

  test('should pause timer when tapping outside interactive elements', async ({ page }) => {
    // Initially the timer should be paused (autostart=false)
    const pauseBtn = page.locator('#pauseBtn');
    await expect(pauseBtn).toHaveText('Resume');
    
    // Controls should be visible when paused
    const controls = page.locator('#controls');
    await expect(controls).not.toHaveClass(/hidden/);
    
    // Start the timer by clicking resume
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Pause');
    
    // Controls should be hidden when running
    await expect(controls).toHaveClass(/hidden/);
    
    // Now tap somewhere outside interactive elements to pause
    // Tap on the main timer area
    await page.locator('#timer').tap();
    
    // Timer should be paused and controls should be visible
    await expect(pauseBtn).toHaveText('Resume');
    await expect(controls).not.toHaveClass(/hidden/);
  });

  test('should not interfere with tapping interactive elements', async ({ page }) => {
    // Initially paused, so controls are visible
    const pauseBtn = page.locator('#pauseBtn');
    await expect(pauseBtn).toHaveText('Resume');
    
    // Tap on the pause button itself should not trigger the tap-to-pause logic
    // It should just work normally as a button click
    await pauseBtn.tap();
    await expect(pauseBtn).toHaveText('Pause');
    
    // Controls should be hidden after resuming
    const controls = page.locator('#controls');
    await expect(controls).toHaveClass(/hidden/);
    
    // Tap on pause button again to pause
    await pauseBtn.tap();
    await expect(pauseBtn).toHaveText('Resume');
    await expect(controls).not.toHaveClass(/hidden/);
  });

  test('should not trigger pause when tapping QR code area', async ({ page }) => {
    // Start with timer running
    const pauseBtn = page.locator('#pauseBtn');
    await pauseBtn.click(); // Resume
    await expect(pauseBtn).toHaveText('Pause');
    
    const controls = page.locator('#controls');
    await expect(controls).toHaveClass(/hidden/);
    
    // Tap on QR code area - should not pause
    const qrArea = page.locator('#qrWrap');
    if (await qrArea.isVisible()) {
      await qrArea.tap();
      
      // Should still be running (not paused)
      await expect(pauseBtn).toHaveText('Pause');
      await expect(controls).toHaveClass(/hidden/);
    }
  });

  test('should handle touch events on iPad Pro device', async ({ page }) => {
    // This test specifically targets iPad behavior
    // Start timer
    const pauseBtn = page.locator('#pauseBtn');
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Pause');
    
    // Use Playwright's tap to simulate a touch on the timer
    await page.locator('#timer').tap();
    
    // Should be paused after touch event
    await expect(pauseBtn).toHaveText('Resume');
    
    const controls = page.locator('#controls');
    await expect(controls).not.toHaveClass(/hidden/);
  });
});
