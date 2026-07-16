import { describe, expect, it } from "vitest";
import { parseLoginCredentials } from "../src/validators/login-credentials";

describe("parseLoginCredentials", () => {
	it("returns normalized credentials for valid input", () => {
		const result = parseLoginCredentials({
			email: "  Dev@Example.com ",
			password: "devpassword123",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.credentials).toEqual({
				email: "dev@example.com",
				password: "devpassword123",
			});
		}
	});

	it("returns failure with submitted email when input is invalid", () => {
		const result = parseLoginCredentials({
			email: " invalid-email ",
			password: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.submittedEmail).toBe("invalid-email");
			expect(result.fieldErrors.email).toEqual(["Invalid email address"]);
			expect(result.fieldErrors.password).toEqual([
				"Please enter your password.",
			]);
		}
	});
});
