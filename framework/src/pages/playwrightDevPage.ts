import { Page } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Playwright.dev Page Object
 * 
 * Represents the Playwright documentation homepage.
 * Example implementation of BasePage pattern.
 * 
 * Demonstrates:
 * - Page object extending BasePage
 * - Locator definitions
 * - Common interactions (goto, click, etc.)
 */

export class PlaywrightDevPage extends BasePage {
  // Locators
  readonly getStartedLink = this.page.getByRole('link', { name: 'Get started' });
  readonly installationHeading = this.page.getByRole('heading', { name: 'Installation' });
  readonly pageTitle = this.page.title();

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Playwright.dev homepage
   */
  async goto(): Promise<void> {
    await this.page.goto('https://playwright.dev/');
    await this.waitForPageLoad();
  }

  /**
   * Click the "Get started" link
   */
  async clickGetStartedLink(): Promise<void> {
    await this.getStartedLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if Installation heading is visible
   * 
   * @returns true if Installation heading is visible
   */
  async isInstallationHeadingVisible(): Promise<boolean> {
    return await this.installationHeading.isVisible();
  }

  /**
   * Get the page heading text
   * 
   * @returns Heading text
   */
  async getInstallationHeadingText(): Promise<string | null> {
    return await this.installationHeading.textContent();
  }
}
