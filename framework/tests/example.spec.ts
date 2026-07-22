import { test, expect } from '../src/fixtures/commonFixture';

test.describe('@UI - Playwright.dev Website', () => {
  /**
   * Test: Page has correct title
   * 
   * Demonstrates:
   * - Using injected playwrightDevPage fixture
   * - Navigating to a page
   * - Checking page title
   */
  test('has title', async ({ playwrightDevPage }) => {
    await playwrightDevPage.goto();

    const title = await playwrightDevPage.getPageTitle();
    expect(title).toContain('Playwright');
  });

  /**
   * Test: Navigate via Get started link
   * 
   * Demonstrates:
   * - Using page object methods
   * - Interacting with page elements
   * - Validating page content after navigation
   */
  test('get started link', async ({ playwrightDevPage }) => {
    await playwrightDevPage.goto();

    // Click the get started link using page object method
    await playwrightDevPage.clickGetStartedLink();

    // Validate that Installation heading is visible
    const isVisible = await playwrightDevPage.isInstallationHeadingVisible();
    expect(isVisible).toBe(true);
  });
});

