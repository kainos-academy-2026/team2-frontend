import type { Request } from "express";

export const getAuthSessionState = (req: Request) => {
	const sessionCookie = req.cookies?.authSession;
	const hasSessionCookie =
		typeof sessionCookie === "string" && sessionCookie.trim().length > 0;

	return {
		isAuthenticated: hasSessionCookie,
	};
};

export const requireAuthSession = (req: Request) => {
	return getAuthSessionState(req).isAuthenticated;
};
