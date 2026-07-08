import { describe, expect, it, vi } from "vitest";
import {
	getAuthSessionState,
	redirectAuthenticatedUser,
	requireAuthenticatedUser,
	requireAuthSession,
} from "../src/middleware/auth-session";

describe("auth session helper", () => {
	it("treats a request with an auth session cookie as authenticated", () => {
		const state = getAuthSessionState({
			cookies: { authSession: "token" },
		} as never);

		expect(state.isAuthenticated).toBe(true);
		expect(
			requireAuthSession({ cookies: { authSession: "token" } } as never),
		).toBe(true);
	});

	it("treats a request without an auth session cookie as unauthenticated", () => {
		const state = getAuthSessionState({ cookies: {} } as never);

		expect(state.isAuthenticated).toBe(false);
		expect(requireAuthSession({ cookies: {} } as never)).toBe(false);
	});

	it("treats a request with an empty auth session cookie as unauthenticated", () => {
		const state = getAuthSessionState({
			cookies: { authSession: "" },
		} as never);

		expect(state.isAuthenticated).toBe(false);
	});

	it("treats a request without parsed cookies as unauthenticated", () => {
		const state = getAuthSessionState({} as never);

		expect(state.isAuthenticated).toBe(false);
	});

	it("requireAuthenticatedUser redirects unauthenticated requests", () => {
		const req = { cookies: {} } as never;
		const res = { redirect: vi.fn() } as never;
		const next = vi.fn();

		requireAuthenticatedUser(req, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirectAuthenticatedUser redirects authenticated requests", () => {
		const req = { cookies: { authSession: "token" } } as never;
		const res = { redirect: vi.fn() } as never;
		const next = vi.fn();

		redirectAuthenticatedUser(req, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
		expect(next).not.toHaveBeenCalled();
	});
});
