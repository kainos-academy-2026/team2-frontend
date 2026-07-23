import { expect, test } from "@playwright/test";

test.describe("Login UI", () => {
	test("shows the login form", async ({ page }) => {
		await page.goto("/login");

		await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
		await expect(
			page.getByRole("textbox", { name: "Email address" }),
		).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();
		await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
	});

	test("shows field errors for missing password", async ({ page }) => {
		await page.goto("/login");
		await page
			.getByRole("textbox", { name: "Email address" })
			.fill("valid.user@example.com");

		const loginResponsePromise = page.waitForResponse((response) => {
			return (
				response.url().endsWith("/login") &&
				response.request().method() === "POST"
			);
		});

		await page.getByRole("button", { name: "Sign In" }).click();
		const loginResponse = await loginResponsePromise;
		expect(loginResponse.status()).toBe(400);

		await expect(page.getByText("Please enter your password.")).toBeVisible();
		await expect(
			page.getByRole("textbox", { name: "Email address" }),
		).toHaveValue("valid.user@example.com");
	});

	test("shows an error for incorrect credentials", async ({ page }) => {
		await page.goto("/login");
		await page
			.getByRole("textbox", { name: "Email address" })
			.fill("mock@example.com");
		await page.getByLabel("Password").fill("wrongpassword");
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page.getByText("Invalid email or password.")).toBeVisible();
		await expect(page).toHaveURL(/\/login$/);
	});

	test("redirects to job roles for correct credentials", async ({ page }) => {
		await page.goto("/login");
		await page
			.getByRole("textbox", { name: "Email address" })
			.fill("mock@example.com");
		await page.getByLabel("Password").fill("mockpassword123");
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page).toHaveURL(/\/job-roles$/);
	});
});
