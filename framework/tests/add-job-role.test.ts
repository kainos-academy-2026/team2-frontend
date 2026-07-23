import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = "admin.seed@example.com";
const ADMIN_PASSWORD = "Admin!12345";

test("admin can add a new job role", async ({ page }: { page: Page }) => {
	const roleName = `Playwright Role ${Date.now()}`;

	await page.goto("http://localhost:3000/login");

	await page.getByLabel("Email address").fill(ADMIN_EMAIL);
	await page.getByLabel("Password").fill(ADMIN_PASSWORD);
	await page.getByRole("button", { name: "Sign In" }).click();

	await expect(page).toHaveURL(/\/job-roles/);
	await page.getByRole("link", { name: "Create role" }).click();

	await expect(page).toHaveURL(/\/job-roles\/add/);
	await expect(
		page.getByRole("heading", { name: "Add a new role" }),
	).toBeVisible();

	await page.getByLabel("Job role name").fill(roleName);
	await page
		.getByLabel("Job spec summary")
		.fill("Test role created by Playwright");
	await page
		.getByLabel("SharePoint link")
		.fill("https://example.com/playwright-role");
	await page
		.getByLabel("Responsibilities (one per line)")
		.fill("Write automated tests\nReview test results");
	await page.getByLabel("Number of open positions").fill("1");
	await page.getByLabel("Location").fill("Belfast");
	await page.getByLabel("Closing date").fill("2026-12-31");

	await page.locator("#bandId").selectOption({ index: 1 });
	await page.locator("#capabilityId").selectOption({ index: 1 });

	await page.getByRole("button", { name: "Create role" }).click();

	await expect(page).toHaveURL(/\/job-roles\?created=1/);
	await expect(
		page.getByText("New job role created successfully."),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: roleName }).first(),
	).toBeVisible();
});
