import type { AuthService } from "../types/auth";

const isDevLoginEnabled =
	process.env.ENABLE_DEV_LOGIN === "true" &&
	process.env.NODE_ENV !== "production";

const DEV_LOGIN_EMAIL = process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase();
const DEV_LOGIN_PASSWORD = process.env.DEV_LOGIN_PASSWORD;
const DEV_SESSION_TOKEN = "dev-session";

const defaultAuthService: AuthService = {
	async login(credentials) {
		const normalizedEmail = credentials.email;
		const password = credentials.password;

		if (!isDevLoginEnabled || !DEV_LOGIN_EMAIL || !DEV_LOGIN_PASSWORD) {
			return {
				isAuthenticated: false,
				redirectTo: "/job-roles",
			};
		}

		if (
			normalizedEmail === DEV_LOGIN_EMAIL &&
			password === DEV_LOGIN_PASSWORD
		) {
			return {
				isAuthenticated: true,
				redirectTo: "/job-roles",
				authSession: DEV_SESSION_TOKEN,
			};
		}

		return {
			isAuthenticated: false,
			redirectTo: "/job-roles",
		};
	},
	async logout() {
		return;
	},
};

export const authService = defaultAuthService;
