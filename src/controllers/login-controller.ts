import type { Request, Response } from "express";
import { authService } from "../services/auth-service";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

const isValidEmail = (email: string) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
};

export const getLoginPage = (req: Request, res: Response) => {
	try {
		res.render("login", {
			loggedOut: req.query.loggedOut === "1",
			error: undefined,
			oldInput: {},
		});
	} catch {
		res.status(500).send("An error occurred while rendering the login page.");
	}
};

export const postLogin = async (req: Request, res: Response) => {
	const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
	const password =
		typeof req.body.password === "string" ? req.body.password : "";

	if (!isValidEmail(email) || password.length === 0) {
		return res.status(400).render("login", {
			loggedOut: false,
			error: INVALID_CREDENTIALS_MESSAGE,
			oldInput: { email },
		});
	}

	try {
		const loginResult = await authService.login({ email, password });

		if (!loginResult.isAuthenticated) {
			return res.status(401).render("login", {
				loggedOut: false,
				error: INVALID_CREDENTIALS_MESSAGE,
				oldInput: { email },
			});
		}

		return res.redirect(loginResult.redirectTo);
	} catch {
		return res.status(500).render("login", {
			loggedOut: false,
			error: "Unable to sign in right now. Please try again.",
			oldInput: { email },
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
		res.redirect("/login?loggedOut=1");
	}
};
