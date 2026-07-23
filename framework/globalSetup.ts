/**
 * Global Setup Hook
 *
 * This file runs once before all tests begin.
 * Use this for:
 * - Framework initialization
 * - One-time setup tasks
 * - Logging framework startup information
 * - Setting up global state
 *
 * Note: This function runs in a separate Node.js process, not in a browser context.
 */

async function globalSetup() {
	console.log("========== GLOBAL SETUP START ==========");
	console.log(
		`[${new Date().toISOString()}] Initializing Playwright Test Framework`,
	);
	console.log("========== GLOBAL SETUP END ==========");
}

export default globalSetup;
