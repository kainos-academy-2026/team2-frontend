import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

const importAuthService = async () => {
	const module = await import("../src/services/auth-service");
	return module.authService;
};

afterEach(() => {
	delete process.env.AUTH_LOGIN_API_URL;
	delete process.env.ENABLE_DEV_LOGIN;
	delete process.env.DEV_LOGIN_EMAIL;
	delete process.env.DEV_LOGIN_PASSWORD;
	delete process.env.NODE_ENV;
	mockedAxios.post.mockReset();
	vi.resetModules();
});

describe("authService backend login", () => {
	it("authenticates with backend token when AUTH_LOGIN_API_URL is set", async () => {
		process.env.AUTH_LOGIN_API_URL = "http://localhost:3001/login";
		mockedAxios.post.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "jwt-token",
			},
		});
		const authService = await importAuthService();

		const result = await authService.login({
			email: "ExampleUser1@Hotmail.com",
			password: "password123",
		});

		expect(mockedAxios.post).toHaveBeenCalledWith(
			"http://localhost:3001/login",
			{
				email: "exampleuser1@hotmail.com",
				password: "password123",
			},
			expect.objectContaining({
				headers: {
					"Content-Type": "application/json",
				},
			}),
		);
		expect(result).toEqual({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "jwt-token",
		});
	});

	it("rejects login when backend returns 401", async () => {
		process.env.AUTH_LOGIN_API_URL = "http://localhost:3001/login";
		mockedAxios.post.mockResolvedValueOnce({
			status: 401,
			data: {
				message: "Invalid email or password",
			},
		});
		const authService = await importAuthService();

		const result = await authService.login({
			email: "exampleuser1@hotmail.com",
			password: "wrong-password",
		});

		expect(result).toEqual({
			isAuthenticated: false,
			redirectTo: "/job-roles",
		});
	});

	it("throws when backend returns 200 without token", async () => {
		process.env.AUTH_LOGIN_API_URL = "http://localhost:3001/login";
		mockedAxios.post.mockResolvedValueOnce({
			status: 200,
			data: {},
		});
		const authService = await importAuthService();

		await expect(
			authService.login({
				email: "exampleuser1@hotmail.com",
				password: "password123",
			}),
		).rejects.toThrow("Backend login response did not include a token");
	});
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
