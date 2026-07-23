import { test as base } from "@playwright/test";

/**
 * API Fixture
 *
 * Add your API client fixtures here.
 * Import your API clients and register them in the APIFixture type.
 */

// biome-ignore lint/complexity/noBannedTypes: fixture type will be extended with API clients
type APIFixture = {};

export const apiFixture = base.extend<APIFixture>({});
