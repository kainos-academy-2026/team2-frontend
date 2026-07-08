import type { NextFunction, Request, Response } from "express";

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

export const requireAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!requireAuthSession(req)) {
		return res.redirect("/login");
	}

	next();
};

export const redirectAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (requireAuthSession(req)) {
		return res.redirect("/job-roles");
	}

	next();
};
