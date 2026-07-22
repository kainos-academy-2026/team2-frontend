import { test as base } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwrightDevPage';

/**
 * Page Objects Fixture
 * 
 * Provides page object instances for use in tests.
 * Each test gets fresh instances of page objects.
 */

type PageObjectsFixture = {
  playwrightDevPage: PlaywrightDevPage;
};

export const pageObjectsFixture = base.extend<PageObjectsFixture>({
  playwrightDevPage: async ({ page }, use) => {
    const playwrightDevPage = new PlaywrightDevPage(page);
    await use(playwrightDevPage);
  },
});
