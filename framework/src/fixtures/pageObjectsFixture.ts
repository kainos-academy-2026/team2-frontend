import { test as base } from "@playwright/test";
import { ApplyPage } from "../pages/applyPage";

/**
 * Page Objects Fixture
 *
 * Add your page object fixtures here.
 * Import your page objects and register them in the PageObjectsFixture type.
 */

type PageObjectsFixture = {
	applyPage: ApplyPage;
};

export const pageObjectsFixture = base.extend<PageObjectsFixture>({
	applyPage: async ({ page }, use) => {
		const applyPage = new ApplyPage(page);
		await use(applyPage);
	},
});
