import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DefaultAuthService } from "../src/services/default-auth-service";
import { MockAuthService } from "../src/services/mock-auth-service";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

afterEach(() => {
	mockedAxios.post.mockReset();
});

describe("DefaultAuthService", () => {
	it("authenticates with backend token", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "jwt-token",
			},
		});
		const authService = new DefaultAuthService({
			loginApiUrl: "http://localhost:3001/login",
		});

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
		mockedAxios.post.mockResolvedValueOnce({
			status: 401,
			data: {
				message: "Invalid email or password",
			},
		});
		const authService = new DefaultAuthService({
			loginApiUrl: "http://localhost:3001/login",
		});

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
		mockedAxios.post.mockResolvedValueOnce({
			status: 200,
			data: {},
		});
		const authService = new DefaultAuthService({
			loginApiUrl: "http://localhost:3001/login",
		});

		await expect(
			authService.login({
				email: "exampleuser1@hotmail.com",
				password: "password123",
			}),
		).rejects.toThrow("Backend login response did not include a token");
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
});
