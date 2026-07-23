import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
	readonly page: Page;

	readonly fullNameInput: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly registerButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.fullNameInput = page.getByLabel("Full name", { exact: true });
		this.emailInput = page.getByLabel("Email address", { exact: true });
		this.passwordInput = page.getByLabel("Password", { exact: true });
		this.confirmPasswordInput = page.getByLabel("Confirm password", {
			exact: true,
		});
		this.registerButton = page.getByRole("button", { name: "Register" });
	}

	async goto(baseUrl?: string) {
		const targetUrl = baseUrl ? `${baseUrl}/register` : "/register";
		await this.page.goto(targetUrl);
	}

	async fillForm(
		fullName: string,
		email: string,
		password: string,
		confirmPassword: string,
	) {
		await this.fullNameInput.fill(fullName);
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.confirmPasswordInput.fill(confirmPassword);
	}

	async submit() {
		await this.registerButton.click();
	}
}
