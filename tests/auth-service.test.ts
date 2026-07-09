import { afterEach, describe, expect, it, vi } from "vitest";

const importAuthService = async () => {
	const module = await import("../src/services/auth-service");
	return module.authService;
};

afterEach(() => {
	delete process.env.ENABLE_DEV_LOGIN;
	delete process.env.DEV_LOGIN_EMAIL;
	delete process.env.DEV_LOGIN_PASSWORD;
	delete process.env.NODE_ENV;
	vi.resetModules();
});

describe("authService dev login", () => {
	it("rejects login when dev login flag is disabled", async () => {
		process.env.ENABLE_DEV_LOGIN = "false";
		process.env.DEV_LOGIN_EMAIL = "dev@example.com";
		process.env.DEV_LOGIN_PASSWORD = "devpassword123";
		const authService = await importAuthService();

		const result = await authService.login({
			email: "dev@example.com",
			password: "devpassword123",
		});

		expect(result.isAuthenticated).toBe(false);
		expect(result).not.toHaveProperty("authSession");
	});

	it("authenticates when enabled and credentials match", async () => {
		process.env.ENABLE_DEV_LOGIN = "true";
		process.env.DEV_LOGIN_EMAIL = "dev@example.com";
		process.env.DEV_LOGIN_PASSWORD = "devpassword123";
		const authService = await importAuthService();

		const result = await authService.login({
			email: "dev@example.com",
			password: "devpassword123",
		});

		expect(result.isAuthenticated).toBe(true);
		expect(result.redirectTo).toBe("/job-roles");
		if (result.isAuthenticated) {
			expect(result.authSession).toBe("dev-session");
		}
	});

	it("rejects login in production even when enabled", async () => {
		process.env.ENABLE_DEV_LOGIN = "true";
		process.env.NODE_ENV = "production";
		process.env.DEV_LOGIN_EMAIL = "dev@example.com";
		process.env.DEV_LOGIN_PASSWORD = "devpassword123";
		const authService = await importAuthService();

		const result = await authService.login({
			email: "dev@example.com",
			password: "devpassword123",
		});

		expect(result.isAuthenticated).toBe(false);
		expect(result).not.toHaveProperty("authSession");
	});
});
