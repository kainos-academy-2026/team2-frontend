import type { NextFunction, Request, Response } from "express";
import { resolveRedirectTarget } from "../auth/redirect-target";
import { authService } from "../services/auth-service";
import type { AuthService } from "../types/auth";
import type { LoginControllerDeps } from "../types/controller-deps";
import { parseLoginCredentials } from "../validators/login-credentials";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const POST_LOGIN_REDIRECT_COOKIE = "postLoginRedirect";

export class LoginController {
	private readonly authService: AuthService;

	constructor(deps: LoginControllerDeps) {
		this.authService = deps.authService;
	}

	getLoginPage = (req: Request, res: Response) => {
		res.render("login", {
			loggedOut: req.query.loggedOut === "1",
			error: undefined,
			oldInput: {},
			fieldErrors: {},
		});
	};

	postLogin = async (req: Request, res: Response, next: NextFunction) => {
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
			const loginResult = await this.authService.login(
				parsedCredentials.credentials,
			);

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

			const redirectTarget = resolveRedirectTarget(
				req.cookies?.[POST_LOGIN_REDIRECT_COOKIE],
				loginResult.redirectTo,
			);
			res.clearCookie(POST_LOGIN_REDIRECT_COOKIE);

			return res.redirect(redirectTarget);
		} catch (error) {
			return next(error);
		}
	};

	postLogout = async (_req: Request, res: Response) => {
		try {
			await this.authService.logout();
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
}

export const loginController = new LoginController({ authService });
