import { test as base } from '@playwright/test';
import { UserAPIClient } from '../api/userAPIClient';
import { Config } from '../configuration/config';

/**
 * API Fixture
 * 
 * Provides API client instances for use in tests.
 * Automatically configures clients with environment-specific URLs.
 */

type APIFixture = {
  userApi: UserAPIClient;
};

export const apiFixture = base.extend<APIFixture>({
  userApi: async ({}, use) => {
    const apiBaseUrl = Config.get(Config.EnvironmentVariables.API_BASE_URL);
    const userApiClient = new UserAPIClient(apiBaseUrl);

    await use(userApiClient);
  },
});
