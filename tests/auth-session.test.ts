import { describe, expect, it } from "vitest";
import {
	getAuthSessionState,
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
});
