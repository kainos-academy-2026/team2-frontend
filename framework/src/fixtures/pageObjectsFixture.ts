import { test as base } from '@playwright/test';

/**
 * Page Objects Fixture
 *
 * Add your page object fixtures here.
 * Import your page objects and register them in the PageObjectsFixture type.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PageObjectsFixture = {};

export const pageObjectsFixture = base.extend<PageObjectsFixture>({});
