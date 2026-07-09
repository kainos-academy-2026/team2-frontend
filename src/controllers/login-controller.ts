import type { Request, Response } from "express";
import { authService } from "../services/auth-service";
import { parseLoginCredentials } from "../validators/login-credentials";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export const getLoginPage = (req: Request, res: Response) => {
	try {
		res.render("login", {
			loggedOut: req.query.loggedOut === "1",
			error: undefined,
			oldInput: {},
			fieldErrors: {},
		});
	} catch {
		res.status(500).send("An error occurred while rendering the login page.");
	}
};

export const postLogin = async (req: Request, res: Response) => {
	const parsedCredentials = parseLoginCredentials(req.body);

	if (!parsedCredentials.success) {
		return res.status(400).render("login", {
			loggedOut: false,
			oldInput: { email: parsedCredentials.submittedEmail },
			fieldErrors: parsedCredentials.fieldErrors,
		});
	}

	const email = parsedCredentials.credentials.email;

	try {
		const loginResult = await authService.login(parsedCredentials.credentials);

		if (!loginResult.isAuthenticated) {
			return res.status(401).render("login", {
				loggedOut: false,
				error: INVALID_CREDENTIALS_MESSAGE,
				oldInput: { email },
				fieldErrors: {},
			});
		}

		// Temporary frontend-owned session marker for local dev auth flow.
		res.cookie("authSession", loginResult.authSession, {
			httpOnly: true,
			sameSite: "lax",
		});

		return res.redirect(loginResult.redirectTo);
	} catch {
		return res.status(500).render("login", {
			loggedOut: false,
			error: "Unable to sign in right now. Please try again.",
			oldInput: { email },
			fieldErrors: {},
		});
	}
};

export const postLogout = async (_req: Request, res: Response) => {
	try {
		await authService.logout();
	} catch (error) {
		console.warn("Logout cleanup failed", {
			route: "POST /logout",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	} finally {
		res.clearCookie("authSession");
		res.redirect("/login?loggedOut=1");
	}
};
