import type { NextFunction, Request, Response } from "express";

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

export const getAuthSessionState = (req: Request) => {
	const sessionCookie = req.cookies?.authSession;
	const hasSessionCookie =
		typeof sessionCookie === "string" && sessionCookie.trim().length > 0;
	const hasExpiredSessionToken =
		hasSessionCookie && hasExpiredJwtToken(sessionCookie);

	return {
		isAuthenticated: hasSessionCookie && !hasExpiredSessionToken,
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
