import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uiBaseUrl = process.env.UI_BASE_URL || "http://localhost:3000";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
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
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	outputDir: `${reportDir}/${reportName}/artifacts`,
	reporter: [
		["html", { outputFolder: `${reportDir}/${reportName}` }],
		["json", { outputFile: `${reportDir}/${reportName}/results.json` }],
	],
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: "http://localhost:3000",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		/* Screenshot on failure */
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
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
