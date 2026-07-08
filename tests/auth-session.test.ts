import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	getAuthSessionState,
	redirectAuthenticatedUser,
	requireAuthenticatedUser,
	requireAuthSession,
} from "../src/middleware/auth-session";

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

	it("requireAuthenticatedUser redirects unauthenticated requests", () => {
		const req = { cookies: {} } as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthenticatedUser(req, res, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
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
});
