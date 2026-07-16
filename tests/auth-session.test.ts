import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import requireRole from "../src/middleware/auth-session";
import { Role } from "../src/types/role";

const createJwtToken = (
	exp: number,
	extraClaims: Record<string, unknown> = {},
) => {
	const defaults = {
		sub: "test-user-id",
		email: "test@example.com",
		name: "Test User",
	};
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" }),
	).toString("base64url");
	const payload = Buffer.from(
		JSON.stringify({ exp, ...defaults, ...extraClaims }),
	).toString("base64url");

	return `${header}.${payload}.signature`;
};

describe("auth session helper", () => {
	it("redirects to login when no auth session cookie is present", () => {
		const req = { cookies: {} } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirects to login when auth session cookie is empty", () => {
		const req = { cookies: { authSession: "" } } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirects to login when auth session cookie is null", () => {
		const req = {
			cookies: { authSession: null },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirects to login when token is expired", () => {
		const expiredToken = createJwtToken(Math.floor(Date.now() / 1000) - 60);
		const req = {
			cookies: { authSession: expiredToken },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirects expired tokens to login even if the role would otherwise be allowed", () => {
		const expiredToken = createJwtToken(Math.floor(Date.now() / 1000) - 60, {
			role: "admin",
		});
		const req = {
			cookies: { authSession: expiredToken },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next() for a valid unexpired token with an allowed role", () => {
		const validToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const req = {
			cookies: { authSession: validToken },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("calls next() for a valid unexpired admin token on an admin-only route", () => {
		const adminToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "admin",
		});
		const req = {
			cookies: { authSession: adminToken },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("renders forbidden when valid token has an unauthorized role", () => {
		const userToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const req = {
			cookies: { authSession: userToken },
		} as unknown as Request;
		const render = vi.fn();
		const status = vi.fn().mockReturnValue({ render });
		const res = { status, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(render).toHaveBeenCalledWith("forbidden");
		expect(next).not.toHaveBeenCalled();
	});

	it("renders forbidden when token has no role claim", () => {
		const token = createJwtToken(Math.floor(Date.now() / 1000) + 3600);
		const req = {
			cookies: { authSession: token },
		} as unknown as Request;
		const render = vi.fn();
		const status = vi.fn().mockReturnValue({ render });
		const res = { status, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(render).toHaveBeenCalledWith("forbidden");
		expect(next).not.toHaveBeenCalled();
	});

	it("allows both admin and user roles when both are permitted", () => {
		const userToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const adminToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "admin",
		});
		const next = vi.fn();

		const userReq = {
			cookies: { authSession: userToken },
		} as unknown as Request;
		const res1 = { redirect: vi.fn(), locals: {} } as unknown as Response;
		requireRole([Role.User, Role.Admin])(userReq, res1, next as NextFunction);
		expect(next).toHaveBeenCalledTimes(1);

		next.mockClear();

		const adminReq = {
			cookies: { authSession: adminToken },
		} as unknown as Request;
		const res2 = { redirect: vi.fn(), locals: {} } as unknown as Response;
		requireRole([Role.User, Role.Admin])(adminReq, res2, next as NextFunction);
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("sets res.locals.user from token payload after successful auth", () => {
		const validToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
			sub: "user-123",
			email: "user@example.com",
			name: "Test User",
		});
		const req = {
			cookies: { authSession: validToken },
		} as unknown as Request;
		const res = { locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(res.locals.user).toMatchObject({
			id: "user-123",
			role: "user",
			email: "user@example.com",
			name: "Test User",
			isAdmin: false,
		});
	});

	it("sets isAdmin to true in res.locals.user for admin role", () => {
		const adminToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "admin",
		});
		const req = {
			cookies: { authSession: adminToken },
		} as unknown as Request;
		const res = { locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(res.locals.user.isAdmin).toBe(true);
	});

	it("sets isAdmin to false in res.locals.user for user role", () => {
		const userToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const req = {
			cookies: { authSession: userToken },
		} as unknown as Request;
		const res = { locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(res.locals.user.isAdmin).toBe(false);
	});

	it("extracts admin role from token payload into res.locals.user", () => {
		const adminToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "admin",
		});
		const req = {
			cookies: { authSession: adminToken },
		} as unknown as Request;
		const res = { locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(res.locals.user.role).toBe("admin");
	});

	it("extracts user role from token payload into res.locals.user", () => {
		const userToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const req = {
			cookies: { authSession: userToken },
		} as unknown as Request;
		const res = { locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User])(req, res, next);

		expect(res.locals.user.role).toBe("user");
	});

	it("redirects to login when no cookie is present for an admin-only route", () => {
		const req = { cookies: {} } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("renders forbidden when user-role token is used for an admin-only route", () => {
		const userToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "user",
		});
		const req = {
			cookies: { authSession: userToken },
		} as unknown as Request;
		const render = vi.fn();
		const status = vi.fn().mockReturnValue({ render });
		const res = { status, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.Admin])(req, res, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(render).toHaveBeenCalledWith("forbidden");
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next() for admin role on routes allowing both user and admin", () => {
		const adminToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
			role: "admin",
		});
		const req = {
			cookies: { authSession: adminToken },
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireRole([Role.User, Role.Admin])(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
		expect(res.locals.user.isAdmin).toBe(true);
	});
});
