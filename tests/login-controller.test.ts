import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getLoginPage,
	postLogin,
	postLogout,
} from "../src/controllers/login-controller";
import { authService } from "../src/services/auth-service";

const createResponse = () => {
	const response: Partial<Response> = {
		status: vi.fn(),
		render: vi.fn(),
		cookie: vi.fn(),
		clearCookie: vi.fn(),
		redirect: vi.fn(),
		send: vi.fn(),
	};

	(response.status as ReturnType<typeof vi.fn>).mockImplementation(
		() => response as Response,
	);

	return response as Response;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("login controller", () => {
	it("getLoginPage renders loggedOut state from query", () => {
		const req = { query: { loggedOut: "1" } } as unknown as Request;
		const res = createResponse();

		getLoginPage(req, res);

		expect(res.render).toHaveBeenCalledWith("login", {
			loggedOut: true,
			error: undefined,
			oldInput: {},
			fieldErrors: {},
		});
	});

	it("postLogin returns 400 with field errors for invalid input", async () => {
		const req = {
			body: {
				email: "invalid-email",
				password: "",
			},
		} as Request;
		const res = createResponse();

		await postLogin(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("login", {
			loggedOut: false,
			error: undefined,
			oldInput: { email: "invalid-email" },
			fieldErrors: {
				email: "Invalid email address",
				password: "Too small: expected string to have >=1 characters",
			},
		});
	});

	it("postLogin calls authService and redirects on successful login", async () => {
		const req = {
			body: {
				email: "dev@example.com",
				password: "devpassword123",
			},
		} as Request;
		const res = createResponse();
		const loginSpy = vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "dev-session",
		});

		await postLogin(req, res);

		expect(loginSpy).toHaveBeenCalledWith({
			email: "dev@example.com",
			password: "devpassword123",
		});
		expect(res.cookie).toHaveBeenCalledWith("authSession", "dev-session", {
			httpOnly: true,
			sameSite: "lax",
		});
		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("postLogout redirects even if authService.logout fails", async () => {
		const req = {} as Request;
		const res = createResponse();
		vi.spyOn(authService, "logout").mockRejectedValueOnce(
			new Error("logout failed"),
		);

		await postLogout(req, res);

		expect(res.clearCookie).toHaveBeenCalledWith("authSession");
		expect(res.redirect).toHaveBeenCalledWith("/login?loggedOut=1");
	});
});
