import { afterEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { DefaultAuthService } from "../src/services/default-auth-service";
import { MockAuthService } from "../src/services/mock-auth-service";

vi.mock("../src/config/backend", () => ({
	default: {
		post: vi.fn(),
		interceptors: {
			response: { use: vi.fn() },
		},
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);

afterEach(() => {
	mockedApiURL.post.mockReset();
});

describe("DefaultAuthService", () => {
	it("authenticates with backend token", async () => {
		mockedApiURL.post.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "jwt-token",
			},
		});
		const authService = new DefaultAuthService();

		const result = await authService.login({
			email: "ExampleUser1@Hotmail.com",
			password: "password123",
		});

		expect(mockedApiURL.post).toHaveBeenCalledWith(
			"/login",
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

	it("configures axios validateStatus to accept all statuses", async () => {
		mockedApiURL.post.mockResolvedValueOnce({
			status: 401,
			data: { message: "Invalid" },
		});
		const authService = new DefaultAuthService();

		await authService.login({
			email: "exampleuser1@hotmail.com",
			password: "wrong-password",
		});

		const config = mockedApiURL.post.mock.calls[0]?.[2];
		expect(config).toBeDefined();
		expect(config?.validateStatus?.(500)).toBe(true);
	});

	it("rejects login when backend returns 401", async () => {
		mockedApiURL.post.mockResolvedValueOnce({
			status: 401,
			data: {
				message: "Invalid email or password",
			},
		});
		const authService = new DefaultAuthService();

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
		mockedApiURL.post.mockResolvedValueOnce({
			status: 200,
			data: {},
		});
		const authService = new DefaultAuthService();

		await expect(
			authService.login({
				email: "exampleuser1@hotmail.com",
				password: "password123",
			}),
		).rejects.toThrow("Backend login response did not include a token");
	});

	it("throws when backend returns non-401 non-2xx status", async () => {
		mockedApiURL.post.mockResolvedValueOnce({
			status: 500,
			data: {
				message: "Server error",
			},
		});
		const authService = new DefaultAuthService();

		await expect(
			authService.login({
				email: "exampleuser1@hotmail.com",
				password: "password123",
			}),
		).rejects.toThrow("Unexpected backend login response status: 500");
	});

	it("throws when backend token is blank", async () => {
		mockedApiURL.post.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "   ",
			},
		});
		const authService = new DefaultAuthService();

		await expect(
			authService.login({
				email: "exampleuser1@hotmail.com",
				password: "password123",
			}),
		).rejects.toThrow("Backend login response did not include a token");
	});

	it("logout resolves without error", async () => {
		const authService = new DefaultAuthService();

		await expect(authService.logout()).resolves.toBeUndefined();
	});
});

describe("MockAuthService", () => {
	it("returns authenticated result for hardcoded credentials", async () => {
		const authService = new MockAuthService();

		const result = await authService.login({
			email: "mock@example.com",
			password: "mockpassword123",
		});

		expect(result).toEqual({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "mock-session",
		});
	});

	it("returns unauthenticated result for incorrect credentials", async () => {
		const authService = new MockAuthService();

		const result = await authService.login({
			email: "not-mock@example.com",
			password: "wrong-password",
		});

		expect(result).toEqual({
			isAuthenticated: false,
			redirectTo: "/job-roles",
		});
	});

	it("logout resolves without error", async () => {
		const authService = new MockAuthService();

		await expect(authService.logout()).resolves.toBeUndefined();
	});
});
