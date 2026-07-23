import type { APIRequestContext, Page, Response } from "@playwright/test";
import { expect, test } from "../src/fixtures/commonFixture";

const ADMIN_EMAIL = "admin.seed@example.com";
const ADMIN_PASSWORD = "Admin!12345";
const BACKEND_URL = "http://localhost:3001";

const loginAsAdmin = async (apiRequest: APIRequestContext): Promise<string> => {
	const response = await apiRequest.post(`${BACKEND_URL}/login`, {
		data: {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		},
	});

	expect(response.status()).toBe(200);
	const body = (await response.json()) as { token?: string };
	expect(typeof body.token).toBe("string");
	return body.token as string;
};

const signInThroughUi = async (page: Page): Promise<void> => {
	await page.goto("http://localhost:3000/login");
	await page.getByLabel("Email address").fill(ADMIN_EMAIL);
	await page.getByLabel("Password").fill(ADMIN_PASSWORD);
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page).toHaveURL(/\/job-roles/);
};

test("admin can add a new job role and backend confirms creation", async ({
	page,
	request,
}: {
	page: Page;
	request: APIRequestContext;
}) => {
	let createdJobRoleId: number | null = null;
	const roleName = `Playwright UI API Role ${Date.now()}`;

	const adminToken = await loginAsAdmin(request);

	await signInThroughUi(page);
	await page.getByRole("link", { name: "Create role" }).click();

	await expect(page).toHaveURL(/\/job-roles\/add/);
	await expect(
		page.getByRole("heading", { name: "Add a new role" }),
	).toBeVisible();

	await page.getByLabel("Job role name").fill(roleName);
	await page
		.getByLabel("Job spec summary")
		.fill("Test role created by Playwright UI + API integration");
	await page
		.getByLabel("SharePoint link")
		.fill("https://example.com/playwright-ui-api-role");
	await page
		.getByLabel("Responsibilities (one per line)")
		.fill("Write automated tests\nReview test evidence");
	await page.getByLabel("Number of open positions").fill("1");
	await page.getByLabel("Location").fill("Belfast");
	await page.getByLabel("Closing date").fill("2026-12-31");

	await page.locator("#bandId").selectOption({ index: 1 });
	await page.locator("#capabilityId").selectOption({ index: 1 });

	const submitResponsePromise = page.waitForResponse((response: Response) => {
		return (
			response.request().method() === "POST" &&
			response.url().includes("/job-roles/add")
		);
	});

	await page.getByRole("button", { name: "Create role" }).click();

	const submitResponse = await submitResponsePromise;
	expect(submitResponse.status()).toBe(302);

	await expect(page).toHaveURL(/\/job-roles\?created=1/);
	await expect(
		page.getByText("New job role created successfully."),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: roleName }).first(),
	).toBeVisible();

	const getRolesResponse = await request.get(`${BACKEND_URL}/job-roles`, {
		headers: {
			Authorization: `Bearer ${adminToken}`,
		},
	});

	expect(getRolesResponse.status()).toBe(200);
	const roles = (await getRolesResponse.json()) as Array<{
		jobRoleId: number;
		roleName: string;
		location: string;
		status: string;
	}>;

	const createdRole = roles.find((role) => role.roleName === roleName);
	expect(createdRole).toBeDefined();
	expect(createdRole?.location).toBe("Belfast");
	expect(createdRole?.status).toBe("OPEN");
	createdJobRoleId = createdRole?.jobRoleId ?? null;

	if (createdJobRoleId !== null) {
		const deleteResponse = await request.delete(
			`${BACKEND_URL}/${createdJobRoleId}`,
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			},
		);

		expect(deleteResponse.status()).toBe(204);
	}
});
