import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uiBaseUrl = process.env.UI_BASE_URL || "http://localhost:3000";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

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
