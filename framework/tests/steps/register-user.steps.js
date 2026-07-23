const {
	After,
	Before,
	Given,
	setDefaultTimeout,
	Then,
	When,
} = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");
const { RegisterPage } = require("../pages/registerPage");

setDefaultTimeout(60 * 1000);

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

let browser;
let page;
let registerPage;
let generatedEmail;

const resolveEmail = (email) => {
	if (email !== "AUTO_EMAIL") {
		return email;
	}

	if (!generatedEmail) {
		generatedEmail = `damiantestemail+${Date.now()}@gmail.com`;
	}

	return generatedEmail;
};

Before(async () => {
	generatedEmail = null;
	browser = await chromium.launch();
	const context = await browser.newContext();
	page = await context.newPage();
	registerPage = new RegisterPage(page);
});

After(async () => {
	if (page) {
		await page.close();
		page = null;
	}

	if (browser) {
		await browser.close();
		browser = null;
	}

	registerPage = null;
	generatedEmail = null;
});

Given("I am on the register page", async () => {
	await registerPage.goto(baseUrl);
});

Given(
	"I have already attempted registration with full name {string}, email {string}, password {string}, and confirm password {string}",
	async (fullName, email, password, confirmPassword) => {
		const resolvedEmail = resolveEmail(email);

		await registerPage.goto(baseUrl);
		await registerPage.fillForm(
			fullName,
			resolvedEmail,
			password,
			confirmPassword,
		);
		await registerPage.submit();
		await expect(page).toHaveURL(/\/login$|\/register$/);
		await registerPage.goto(baseUrl);
	},
);

When(
	"I submit the registration form with full name {string}, email {string}, password {string}, and confirm password {string}",
	async (fullName, email, password, confirmPassword) => {
		const resolvedEmail = resolveEmail(email);
		await page.locator("form[action='/register']").evaluate((form) => {
			form.noValidate = true;
		});

		await registerPage.fillForm(
			fullName,
			resolvedEmail,
			password,
			confirmPassword,
		);
		await registerPage.submit();
	},
);

Then("I should be redirected to the login page", async () => {
	await expect(page).toHaveURL(/\/login$/);
});

Then("I should remain on the register page", async () => {
	await expect(page).toHaveURL(/\/register$/);
});

Then(
	"I should see the validation error {string} for the {string} field",
	async (message, field) => {
		await expect(page.locator(`#${field}-error-1`)).toHaveText(message);
	},
);
