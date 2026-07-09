import type { AuthService, LoginCredentials, LoginResult } from "../types/auth";

const DEV_SESSION_TOKEN = "dev-session";
const MOCK_SESSION_TOKEN = "mock-session";

const getDevLoginConfig = () => {
	return {
		isDevLoginEnabled:
			process.env.ENABLE_DEV_LOGIN === "true" &&
			process.env.NODE_ENV !== "production",
		devLoginEmail: process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase(),
		devLoginPassword: process.env.DEV_LOGIN_PASSWORD,
	};
};

export class DefaultAuthService implements AuthService {
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		const { isDevLoginEnabled, devLoginEmail, devLoginPassword } =
			getDevLoginConfig();
		const normalizedEmail = credentials.email.trim().toLowerCase();
		const password = credentials.password;

		if (!isDevLoginEnabled || !devLoginEmail || !devLoginPassword) {
			return {
				isAuthenticated: false,
				redirectTo: "/job-roles",
			};
		}

		if (normalizedEmail === devLoginEmail && password === devLoginPassword) {
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
	}

	async logout() {
		return;
	}
}

export class MockAuthService implements AuthService {
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		if (!credentials.email || !credentials.password) {
			return {
				isAuthenticated: false,
				redirectTo: "/job-roles",
			};
		}

		return {
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: MOCK_SESSION_TOKEN,
		};
	}

	async logout() {
		return;
	}
}

export const authService: AuthService = new DefaultAuthService();
