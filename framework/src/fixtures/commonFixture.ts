import { mergeTests } from "@playwright/test";
import { apiFixture } from "./apiFixture";
import { pageObjectsFixture } from "./pageObjectsFixture";

/**
 * Common fixture that merges all framework fixtures.
 *
 * This fixture serves as the central point for dependency injection.
 * All other fixtures created in the framework will be merged here.
 *
 * Usage in tests:
 *   import { test, expect } from '../fixtures/commonFixture';
 *
 *   test('example test', async ({ page }) => {
 *     // page is automatically injected by Playwright
 *     // add your own fixtures to apiFixture and pageObjectsFixture
 *   });
 */

export const test = mergeTests(apiFixture, pageObjectsFixture);
export { expect } from "@playwright/test";
