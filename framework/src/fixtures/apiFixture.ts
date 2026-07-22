import { test as base } from '@playwright/test';

/**
 * API Fixture
 *
 * Add your API client fixtures here.
 * Import your API clients and register them in the APIFixture type.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type APIFixture = {};

export const apiFixture = base.extend<APIFixture>({});
