import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * Generate report name based on date/time (YYYY-MM-DD_HH-mm-ss format)
 */
function getReportName(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");
	return `report_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

const reportName = getReportName();
const reportDir = "test-reports";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./tests",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: 3,
	/* Opt out of parallel tests on CI. */
	workers: 4,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["html", { outputFolder: `${reportDir}/${reportName}` }],
		["json", { outputFile: `${reportDir}/${reportName}/results.json` }],
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: "http://localhost:3000",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		/* Screenshot on failure */
		screenshot: "only-on-failure",
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		{
			name: "edge",
			use: { ...devices["Desktop Edge"], channel: "msedge" },
		},

		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 5"] },
		},
	],

	/* Global setup hook - runs once before all tests */
	globalSetup: require.resolve("./globalSetup.ts"),

	/* Global teardown hook - runs once after all tests */
	globalTeardown: require.resolve("./globalTeardown.ts"),

	/* Run your local dev server before starting the tests */
	webServer: [
		{
			command: "cd .. && npm run dev",
			url: "http://localhost:3000/login",
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000,
		},
	],
});
