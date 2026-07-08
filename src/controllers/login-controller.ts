import type { Request, Response } from "express";

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

export const postLogin = (req: Request, res: Response) => {
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

	// Placeholder frontend-ready behavior until backend auth integration is added.
	return res.redirect("/job-roles");
};

export const postLogout = (_req: Request, res: Response) => {
	// Placeholder redirect until backend session/JWT cookie clearing is wired.
	res.redirect("/login?loggedOut=1");
};
