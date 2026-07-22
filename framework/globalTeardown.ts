/**
 * Global Teardown Hook
 * 
 * This file runs once after all tests complete.
 * Use this for:
 * - Cleanup tasks
 * - Stopping services or servers
 * - Clearing test data
 * - Logging test completion information
 * 
 * Note: This function runs in a separate Node.js process, not in a browser context.
 */

async function globalTeardown() {
  console.log('========== GLOBAL TEARDOWN START ==========');
  console.log(`[${new Date().toISOString()}] Test execution completed`);
  console.log('========== GLOBAL TEARDOWN END ==========');
}

export default globalTeardown;
