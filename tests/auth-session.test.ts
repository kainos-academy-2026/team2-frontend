import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	getAuthSessionState,
	redirectAuthenticatedUser,
	requireAuthenticatedUser,
	requireAuthSession,
} from "../src/middleware/auth-session";

const createJwtToken = (exp: number) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" }),
	).toString("base64url");
	const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");

	return `${header}.${payload}.signature`;
};

describe("auth session helper", () => {
	it("treats a request with an auth session cookie as authenticated", () => {
		const req = { cookies: { authSession: "token" } } as unknown as Request;
		const state = getAuthSessionState(req);

		expect(state.isAuthenticated).toBe(true);
		expect(requireAuthSession(req)).toBe(true);
	});

	it("treats a request without an auth session cookie as unauthenticated", () => {
		const req = { cookies: {} } as unknown as Request;
		const state = getAuthSessionState(req);

		expect(state.isAuthenticated).toBe(false);
		expect(requireAuthSession(req)).toBe(false);
	});

	it("treats a request with an empty auth session cookie as unauthenticated", () => {
		const state = getAuthSessionState({
			cookies: { authSession: "" },
		} as unknown as Request);

		expect(state.isAuthenticated).toBe(false);
	});

	it("treats a request without parsed cookies as unauthenticated", () => {
		const state = getAuthSessionState({} as unknown as Request);

		expect(state.isAuthenticated).toBe(false);
	});

	it("treats a request with an expired token as unauthenticated", () => {
		const expiredToken = createJwtToken(Math.floor(Date.now() / 1000) - 60);
		const state = getAuthSessionState({
			cookies: { authSession: expiredToken },
		} as unknown as Request);

		expect(state.isAuthenticated).toBe(false);
	});

	it("treats a request with an unexpired token as authenticated", () => {
		const validToken = createJwtToken(Math.floor(Date.now() / 1000) + 60);
		const state = getAuthSessionState({
			cookies: { authSession: validToken },
		} as unknown as Request);

		expect(state.isAuthenticated).toBe(true);
	});

	it("requireAuthenticatedUser redirects unauthenticated requests", () => {
		const req = { cookies: {} } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthenticatedUser(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("stores allowlisted original path in temporary redirect cookie", () => {
		const req = {
			cookies: {},
			originalUrl: "/job-roles",
		} as unknown as Request;
		const redirect = vi.fn();
		const cookie = vi.fn();
		const res = { redirect, cookie } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthenticatedUser(req, res, next);

		expect(cookie).toHaveBeenCalledWith(
			"postLoginRedirect",
			"/job-roles",
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
			}),
		);
		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("does not store non-allowlisted original path in redirect cookie", () => {
		const req = {
			cookies: {},
			originalUrl: "/admin",
		} as unknown as Request;
		const redirect = vi.fn();
		const cookie = vi.fn();
		const res = { redirect, cookie } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthenticatedUser(req, res, next);

		expect(cookie).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("requireAuthenticatedUser allows authenticated requests", () => {
		const req = { cookies: { authSession: "token" } } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthenticatedUser(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("redirectAuthenticatedUser redirects authenticated requests", () => {
		const req = { cookies: { authSession: "token" } } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		redirectAuthenticatedUser(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/job-roles");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirectAuthenticatedUser allows unauthenticated requests", () => {
		const req = { cookies: {} } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		redirectAuthenticatedUser(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});
});
