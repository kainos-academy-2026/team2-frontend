import type { Page } from "@playwright/test";

/**
 * Base Page Class
 *
 * Abstract base class for all page objects.
 * Provides common page functionality that can be reused across all pages.
 *
 * All page objects should extend this class.
 */

export abstract class BasePage {
	protected readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Get the current page title
	 *
	 * @returns Page title
	 */
	async getPageTitle(): Promise<string> {
		return await this.page.title();
	}

	/**
	 * Get the current page URL
	 *
	 * @returns Current page URL
	 */
	async getPageUrl(): Promise<string> {
		return this.page.url();
	}

	/**
	 * Wait for page to load (wait for network to be idle)
	 *
	 * @returns Promise that resolves when page is loaded
	 */
	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState("networkidle");
	}

	/**
	 * Take a screenshot
	 *
	 * @param name - Screenshot name/path
	 */
	async takeScreenshot(name: string): Promise<void> {
		await this.page.screenshot({ path: `screenshots/${name}.png` });
	}

	/**
	 * Accept browser alert
	 */
	async acceptAlert(): Promise<void> {
		this.page.once("dialog", (dialog) => dialog.accept());
	}

	/**
	 * Dismiss browser alert
	 */
	async dismissAlert(): Promise<void> {
		this.page.once("dialog", (dialog) => dialog.dismiss());
	}
}
