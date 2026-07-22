import { test, expect } from '../src/fixtures/commonFixture';

/**
 * UI Tests - Playwright.dev Website
 * 
 * These tests demonstrate UI testing patterns:
 * - Page Object Model (POM) usage
 * - Page navigation and interaction
 * - Element visibility assertions
 * - Page state validation
 * 
 * Tag: @UI - Run with: npx playwright test --grep @UI
 */

test.describe('@UI - Page Navigation Tests', () => {
  /**
   * Test: Load homepage
   * 
   * Verifies that the Playwright.dev homepage loads correctly.
   */
  test('should load Playwright homepage', async ({ playwrightDevPage }) => {
    // Navigate to homepage
    await playwrightDevPage.goto();

    // Verify page URL
    const url = await playwrightDevPage.getPageUrl();
    expect(url).toContain('playwright.dev');

    // Verify page title
    const title = await playwrightDevPage.getPageTitle();
    expect(title).toContain('Playwright');
  });

  /**
   * Test: Get started link navigation
   * 
   * Verifies that clicking the "Get started" link navigates to the Installation page.
   */
  test('should navigate to installation page', async ({ playwrightDevPage }) => {
    // Navigate to homepage
    await playwrightDevPage.goto();

    // Click Get started link
    await playwrightDevPage.clickGetStartedLink();

    // Verify Installation heading is visible
    const isVisible = await playwrightDevPage.isInstallationHeadingVisible();
    expect(isVisible).toBe(true);

    // Verify heading text
    const headingText = await playwrightDevPage.getInstallationHeadingText();
    expect(headingText).toContain('Installation');
  });
});

test.describe('@UI - Page Object Pattern Examples', () => {
  /**
   * Test: Demonstrates page object reusability
   * 
   * Multiple interactions with the same page object within a single test.
   */
  test('should reuse page object for multiple interactions', async ({ playwrightDevPage }) => {
    // First interaction: Load page and check title
    await playwrightDevPage.goto();
    const initialTitle = await playwrightDevPage.getPageTitle();
    expect(initialTitle).toBeDefined();

    // Second interaction: Navigate within page
    await playwrightDevPage.clickGetStartedLink();
    
    // Third interaction: Check new page state
    const currentUrl = await playwrightDevPage.getPageUrl();
    expect(currentUrl).not.toContain('playwright.dev/');
  });
});
