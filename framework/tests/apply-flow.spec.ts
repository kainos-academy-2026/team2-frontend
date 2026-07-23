import { test, expect } from "../src/fixtures/commonFixture";

// Smoke test for apply flow page

const getLoginCredentials = () => {
	const email =
		process.env.PLAYWRIGHT_LOGIN_EMAIL?.trim() ||
		process.env.DEV_LOGIN_EMAIL?.trim();
	const password =
		process.env.PLAYWRIGHT_LOGIN_PASSWORD || process.env.DEV_LOGIN_PASSWORD;

	if (!email || !password) {
		throw new Error(
			"Login credentials are required for integration flow. Set PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD (for example in framework/.env.local).",
		);
	}

	return { email, password };
};

const loginAsValidUser = async (
	applyPage: { getPage: () => import("@playwright/test").Page },
) => {
	const page = applyPage.getPage();
	const credentials = getLoginCredentials();

	await page.goto("/login");
	await page.getByLabel(/email address/i).fill(credentials.email);
	await page.getByLabel(/password/i).fill(credentials.password);
	await page.getByRole("button", { name: /sign in/i }).click();
	await expect(page).toHaveURL(/\/job-roles/);
};

test("Apply Flow: User navigates to apply page - page loads successfully", async ({
	applyPage,
}) => {
	// Given: User logs in with valid credentials and navigates to application page
	await loginAsValidUser(applyPage);
	await applyPage.navigateToApplicationPage("1");

	// When & Then: Page loads and URL is correct
	const url = await applyPage.getPageUrl();
	expect(url).toContain("/job-roles/1/apply");
	await expect(applyPage.getPage().locator("#apply-form")).toBeVisible();

	const title = await applyPage.getPageTitle();
	expect(title).toBeTruthy();
});

test("Apply Flow: Submitting without a CV shows validation error", async ({
	applyPage,
}) => {
	// Given: User logs in with valid credentials and is on the apply page
	await loginAsValidUser(applyPage);
	await applyPage.navigateToApplicationPage("1");
	await expect(applyPage.getPage().locator("#apply-form")).toBeVisible();

	// When: User submits without selecting a file
	await applyPage.submitApplication();

	// Then: A helpful file validation error is displayed
	const alertMessage = await applyPage.getSuccessMessageText();
	expect(alertMessage).toContain("Please select a CV to upload.");
});

import { expect, test } from "../src/fixtures/commonFixture";

// Smoke test for apply flow page

const getLoginCredentials = () => {
	const email =
		process.env.PLAYWRIGHT_LOGIN_EMAIL?.trim() ||
		process.env.DEV_LOGIN_EMAIL?.trim();
	const password =
		process.env.PLAYWRIGHT_LOGIN_PASSWORD || process.env.DEV_LOGIN_PASSWORD;

	if (!email || !password) {
		throw new Error(
			"Login credentials are required for integration flow. Set PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD (for example in framework/.env.local).",
		);
	}

	return { email, password };
};

const loginAsValidUser = async (applyPage: {
	getPage: () => import("@playwright/test").Page;
}) => {
	const page = applyPage.getPage();
	const credentials = getLoginCredentials();

	await page.goto("/login");
	await page.getByLabel(/email address/i).fill(credentials.email);
	await page.getByLabel(/password/i).fill(credentials.password);
	await page.getByRole("button", { name: /sign in/i }).click();
	await expect(page).toHaveURL(/\/job-roles/);
};

test("Apply Flow: User navigates to apply page - page loads successfully", async ({
	applyPage,
}) => {
	// Given: User logs in with valid credentials and navigates to application page
	await loginAsValidUser(applyPage);
	await applyPage.navigateToApplicationPage("1");

	// When & Then: Page loads and URL is correct
	const url = await applyPage.getPageUrl();
	expect(url).toContain("/job-roles/1/apply");
	await expect(applyPage.getPage().locator("#apply-form")).toBeVisible();

	const title = await applyPage.getPageTitle();
	expect(title).toBeTruthy();
});

test("Apply Flow: Submitting without a CV shows validation error", async ({
	applyPage,
}) => {
	// Given: User logs in with valid credentials and is on the apply page
	await loginAsValidUser(applyPage);
	await applyPage.navigateToApplicationPage("1");
	await expect(applyPage.getPage().locator("#apply-form")).toBeVisible();

	// When: User submits without selecting a file
	await applyPage.submitApplication();

	// Then: A helpful file validation error is displayed
	const alertMessage = await applyPage.getSuccessMessageText();
	expect(alertMessage).toContain("Please select a CV to upload.");
});
