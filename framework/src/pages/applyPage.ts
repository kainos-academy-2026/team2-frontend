import { BasePage } from "./basePage";

/**
 * Apply Page Object
 *
 * Represents the job application flow page.
 * Extends BasePage to inherit common functionality.
 */
export class ApplyPage extends BasePage {
	/**
	 * Navigate to the application page
	 * @param jobRoleId - The ID of the job role to apply for
	 */
	async navigateToApplicationPage(jobRoleId: string): Promise<void> {
		await this.page.goto(`/job-roles/${jobRoleId}/apply`);
		await this.waitForPageLoad();
	}

	/**
	 * Fill in the application form
	 * @param fullName - Applicant's full name
	 * @param email - Applicant's email
	 */
	async fillApplicationForm(fullName: string, email: string): Promise<void> {
		await this.page.getByRole("textbox", { name: /full name/i }).fill(fullName);
		await this.page.getByRole("textbox", { name: /email/i }).fill(email);
	}

	/**
	 * Upload a CV file
	 * @param filePath - Path to the CV file
	 */
	async uploadCV(filePath: string): Promise<void> {
		await this.page.getByRole("button", { name: /upload|cv|file/i }).setInputFiles(filePath);
	}

	/**
	 * Submit the application
	 */
	async submitApplication(): Promise<void> {
		await this.page.getByRole("button", { name: /submit|apply/i }).click();
		await this.page.waitForSelector("[role='alert']");
	}

	/**
	 * Verify application was submitted successfully
	 * @returns True if success message is visible
	 */
	async isApplicationSuccessful(): Promise<boolean> {
		const successMessage = await this.page.locator("[role='alert']");
		return successMessage.isVisible();
	}

	/**
	 * Get the success message text
	 * @returns The text content of the success message
	 */
	async getSuccessMessageText(): Promise<string | null> {
		return await this.page.locator("[role='alert']").textContent();
	}
}
