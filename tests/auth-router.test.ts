import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

const originalMockedAuth = process.env.MOCKED_AUTHENTICATION;

afterEach(() => {
	process.env.MOCKED_AUTHENTICATION = originalMockedAuth;
	mockedAxios.post.mockReset();
	vi.resetModules();
});

describe("auth-router authService", () => {
	it("uses MockAuthService when mocked auth is enabled", async () => {
		process.env.MOCKED_AUTHENTICATION = "true";
		vi.resetModules();

		const module = await import("../src/routes/auth-router");
		const result = await module.authService.login({
			email: "mock@example.com",
			password: "mockpassword123",
		});

		expect(result).toEqual({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "mock-session",
		});
		expect(mockedAxios.post).not.toHaveBeenCalled();
	});

	it("uses DefaultAuthService when mocked auth is disabled", async () => {
		process.env.MOCKED_AUTHENTICATION = "false";
		vi.resetModules();
		mockedAxios.post.mockResolvedValueOnce({
			status: 200,
			data: { token: "jwt-token" },
		});

		const module = await import("../src/routes/auth-router");
		const result = await module.authService.login({
			email: "user@example.com",
			password: "password123",
		});

		expect(result).toEqual({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "jwt-token",
		});
		expect(mockedAxios.post).toHaveBeenCalledTimes(1);
	});
});
