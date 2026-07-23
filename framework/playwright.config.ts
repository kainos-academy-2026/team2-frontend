import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uiBaseUrl = process.env.UI_BASE_URL || "http://localhost:3000";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["list"]],
	use: {
		baseURL: uiBaseUrl,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "cd .. && MOCKED_AUTHENTICATION=true npm run dev",
		url: uiBaseUrl,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
