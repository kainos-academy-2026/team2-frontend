import type { NextFunction, Request, Response } from "express";
import { getAllowedRedirectTarget } from "../auth/redirect-target";
import type { UserRole } from "../types/auth";

const POST_LOGIN_REDIRECT_COOKIE = "postLoginRedirect";
const POST_LOGIN_REDIRECT_MAX_AGE_MS = 5 * 60 * 1000;

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
	const tokenParts = token.split(".");

	if (tokenParts.length !== 3) {
		return null;
	}

	try {
		const payload = JSON.parse(
			Buffer.from(tokenParts[1], "base64url").toString("utf8"),
		) as Record<string, unknown>;

		return payload;
	} catch {
		return null;
	}
};

const hasExpiredJwtToken = (token: string): boolean => {
	const payload = parseJwtPayload(token);

	if (!payload || typeof payload.exp !== "number") {
		return false;
	}

	const nowInSeconds = Math.floor(Date.now() / 1000);
	return payload.exp <= nowInSeconds;
};

const extractRole = (token: string): UserRole | null => {
	const payload = parseJwtPayload(token);
	if (!payload) return null;
	if (payload.role === "admin") return "admin";
	if (payload.role === "user") return "user";
	return null;
};

export const getAuthSessionState = (req: Request) => {
	const token = req.cookies?.authSession;

	if (
		typeof token !== "string" ||
		token.trim().length === 0 ||
		hasExpiredJwtToken(token)
	) {
		return { isAuthenticated: false, role: null };
	}

	return { isAuthenticated: true, role: extractRole(token) };
};

export const getTokenFromRequest = (req: Request): string | undefined => {
	const token = req.cookies?.authSession;
	return typeof token === "string" && token.trim().length > 0
		? token
		: undefined;
};

export const requireAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!getAuthSessionState(req).isAuthenticated) {
		const originalPath = getAllowedRedirectTarget(req.originalUrl);

		if (originalPath) {
			res.cookie(POST_LOGIN_REDIRECT_COOKIE, originalPath, {
				httpOnly: true,
				sameSite: "lax",
				maxAge: POST_LOGIN_REDIRECT_MAX_AGE_MS,
			});
		}

		return res.redirect("/login");
	}

	next();
};

export const requireAdminUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { isAuthenticated, role } = getAuthSessionState(req);

	if (!isAuthenticated) {
		const originalPath = getAllowedRedirectTarget(req.originalUrl);

		if (originalPath) {
			res.cookie(POST_LOGIN_REDIRECT_COOKIE, originalPath, {
				httpOnly: true,
				sameSite: "lax",
				maxAge: POST_LOGIN_REDIRECT_MAX_AGE_MS,
			});
		}

		return res.redirect("/login");
	}

	if (role !== "admin") {
		return res.redirect("/job-roles?forbidden=1");
	}

	next();
};

export const redirectAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (getAuthSessionState(req).isAuthenticated) {
		return res.redirect("/job-roles");
	}

	next();
};
