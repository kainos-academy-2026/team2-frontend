import { test as base, mergeTests } from '@playwright/test';
import { apiFixture } from './apiFixture';
import { pageObjectsFixture } from './pageObjectsFixture';

/**
 * Common fixture that merges all framework fixtures.
 * 
 * This fixture serves as the central point for dependency injection.
 * All other fixtures created in the framework will be merged here.
 * 
 * Current fixtures:
 * - apiFixture: Provides API clients (userApi)
 * - pageObjectsFixture: Provides page objects (playwrightDevPage)
 * 
 * Usage in tests:
 *   import { test, expect } from '../fixtures/commonFixture';
 *   
 *   test('example test', async ({ page, userApi, playwrightDevPage }) => {
 *     // page is automatically injected by Playwright
 *     // userApi is automatically injected by apiFixture
 *     // playwrightDevPage is automatically injected by pageObjectsFixture
 *   });
 */

export const test = mergeTests(base, apiFixture, pageObjectsFixture);
export { expect } from '@playwright/test';
