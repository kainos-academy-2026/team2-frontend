import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginController } from "../src/controllers/login-controller";
import type { AuthService } from "../src/types/auth";

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

const createAuthService = (): AuthService => {
	return {
		login: vi.fn(),
		logout: vi.fn(),
	};
};

describe("login controller", () => {
	it("getLoginPage renders loggedOut state from query", () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = { query: { loggedOut: "1" } } as unknown as Request;
		const res = createResponse();

		controller.getLoginPage(req, res);

		expect(res.render).toHaveBeenCalledWith("login", {
			loggedOut: true,
			error: undefined,
			oldInput: {},
			fieldErrors: {},
		});
	});

	it("postLogin returns 400 with field errors for invalid input", async () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = {
			body: {
				email: "invalid-email",
				password: "",
			},
		} as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;

		await controller.postLogin(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("login", {
			loggedOut: false,
			error: undefined,
			oldInput: { email: "invalid-email" },
			fieldErrors: {
				email: ["Invalid email address"],
				password: ["Too small: expected string to have >=1 characters"],
			},
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("postLogin calls authService and redirects on successful login", async () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = {
			body: {
				email: "dev@example.com",
				password: "devpassword123",
			},
			cookies: {
				postLoginRedirect: "/job-roles",
			},
		} as unknown as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;
		const loginSpy = vi.mocked(authService.login).mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "dev-session",
		});

		await controller.postLogin(req, res, next);

		expect(loginSpy).toHaveBeenCalledWith({
			email: "dev@example.com",
			password: "devpassword123",
		});
		expect(res.cookie).toHaveBeenCalledWith("authSession", "dev-session", {
			httpOnly: true,
			sameSite: "lax",
		});
		expect(res.clearCookie).toHaveBeenCalledWith("postLoginRedirect");
		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
		expect(next).not.toHaveBeenCalled();
	});

	it("postLogin falls back to service redirect for unsafe cookie redirect", async () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = {
			body: {
				email: "dev@example.com",
				password: "devpassword123",
			},
			cookies: {
				postLoginRedirect: "https://evil.example/path",
			},
		} as unknown as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;

		vi.mocked(authService.login).mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "dev-session",
		});

		await controller.postLogin(req, res, next);

		expect(res.clearCookie).toHaveBeenCalledWith("postLoginRedirect");
		expect(res.redirect).toHaveBeenCalledWith("/");
		expect(next).not.toHaveBeenCalled();
	});

	it("postLogin forwards unexpected errors to global error handler", async () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = {
			body: {
				email: "dev@example.com",
				password: "devpassword123",
			},
		} as unknown as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;
		const loginError = new Error("service unavailable");

		vi.mocked(authService.login).mockRejectedValueOnce(loginError);

		await controller.postLogin(req, res, next);

		expect(next).toHaveBeenCalledWith(loginError);
		expect(res.render).not.toHaveBeenCalledWith(
			"login",
			expect.objectContaining({
				error: "Unable to sign in right now. Please try again.",
			}),
		);
	});

	it("postLogout redirects even if authService.logout fails", async () => {
		const authService = createAuthService();
		const controller = new LoginController(authService);
		const req = {} as Request;
		const res = createResponse();
		vi.mocked(authService.logout).mockRejectedValueOnce(
			new Error("logout failed"),
		);

		await controller.postLogout(req, res);

		expect(res.clearCookie).toHaveBeenCalledWith("authSession");
		expect(res.redirect).toHaveBeenCalledWith("/login?loggedOut=1");
	});
});
