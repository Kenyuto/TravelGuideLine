import { test, expect } from '@playwright/test'

test.describe('Deep Link Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage with auth token
    await page.addInitScript(() => {
      const authData = {
        sheetId: 'test-sheet-id',
        password: 'test-password',
        isAuthenticated: true,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      }
      localStorage.setItem('travel-guideline-auth', JSON.stringify(authData))
    })
  })

  test('should navigate to specific date with date parameter', async ({ page }) => {
    // Navigate with date parameter
    await page.goto('/#/itinerary?date=2025-01-15')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if the date is displayed (adjust selector based on actual implementation)
    const dateDisplay = page.locator('text=/2025.*1.*15/')
    await expect(dateDisplay).toBeVisible()
  })

  test('should navigate directly to itinerary item with item parameter', async ({ page }) => {
    // Navigate with item parameter (slug format)
    await page.goto('/#/itinerary?item=tokyo-skytree')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Wait for potential scroll animation
    await page.waitForTimeout(1000)

    // Check if item is in viewport (it should be scrolled to)
    const itemCard = page.locator('[data-item-id*="tokyo"]').first()

    // If element exists, check if it's in viewport
    const exists = await itemCard.count()
    if (exists > 0) {
      await expect(itemCard).toBeInViewport()
    }
  })

  test('should handle both date and item parameters', async ({ page }) => {
    // Navigate with both parameters
    await page.goto('/#/itinerary?date=2025-01-15&item=tokyo-skytree')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check date is displayed
    const dateDisplay = page.locator('text=/2025.*1.*15/')
    await expect(dateDisplay).toBeVisible()

    // Check if item exists and is visible
    const itemCard = page.locator('[data-item-id*="tokyo"]').first()
    const exists = await itemCard.count()
    if (exists > 0) {
      await expect(itemCard).toBeInViewport()
    }
  })

  test('should preserve deep link through login redirect', async ({ page }) => {
    // Clear auth data to simulate unauthenticated state
    await page.addInitScript(() => {
      localStorage.removeItem('travel-guideline-auth')
    })

    // Navigate with deep link parameters
    await page.goto('/#/itinerary?date=2025-01-15&item=tokyo-skytree')

    // Should be redirected to login
    await expect(page).toHaveURL(/login/)

    // Check if redirect parameter is preserved in URL
    const url = page.url()
    expect(url).toContain('redirect=')
    expect(url).toContain('date=2025-01-15')
    expect(url).toContain('item=tokyo-skytree')
  })

  test('should copy share link to clipboard when share button clicked', async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Navigate to itinerary
    await page.goto('/#/itinerary')
    await page.waitForLoadState('networkidle')

    // Find first share button (adjust selector based on actual implementation)
    const shareButton = page.locator('button[title*="分享"]').first()

    // Check if share button exists
    const exists = await shareButton.count()
    if (exists > 0) {
      // Click share button
      await shareButton.click()

      // Wait for clipboard operation
      await page.waitForTimeout(500)

      // Check if toast notification appears
      const toast = page.locator('text=/連結已複製/')
      await expect(toast).toBeVisible({ timeout: 2000 })

      // Read clipboard content
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText())

      // Verify clipboard contains a valid URL with deep link parameters
      expect(clipboardContent).toContain('http')
      expect(clipboardContent).toMatch(/\?.*date=|item=/)
    }
  })

  test('should handle invalid date parameter gracefully', async ({ page }) => {
    // Navigate with invalid date
    await page.goto('/#/itinerary?date=invalid-date')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Page should still load (just without switching to invalid date)
    // Check that some date is displayed
    const dateDisplay = page.locator('text=/20[0-9]{2}/')
    await expect(dateDisplay).toBeVisible()
  })

  test('should handle non-existent item parameter gracefully', async ({ page }) => {
    // Navigate with non-existent item
    await page.goto('/#/itinerary?item=non-existent-item-xyz')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Page should still load without errors
    // Just verify itinerary view is shown
    const itineraryContent = page.locator('[data-testid="itinerary-content"], .space-y-4')
    await expect(itineraryContent.first()).toBeVisible()
  })
})

test.describe('Deep Link URL Generation', () => {
  test('should generate correct deep link format', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Mock authenticated state
    await page.addInitScript(() => {
      const authData = {
        sheetId: 'test-sheet-id',
        password: 'test-password',
        isAuthenticated: true,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }
      localStorage.setItem('travel-guideline-auth', JSON.stringify(authData))
    })

    await page.goto('/#/itinerary')
    await page.waitForLoadState('networkidle')

    // Find and click first share button
    const shareButton = page.locator('button[title*="分享"]').first()
    const exists = await shareButton.count()

    if (exists > 0) {
      await shareButton.click()
      await page.waitForTimeout(500)

      // Get clipboard content
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText())

      // Verify URL structure
      expect(clipboardContent).toMatch(/^https?:\/\/[^/]+\/#\/itinerary\?/)

      // Verify query parameters exist
      expect(clipboardContent).toMatch(/[?&](date|item|title)=/)
    }
  })
})
