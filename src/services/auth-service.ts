import axios from "axios";
import type { AuthService, LoginCredentials, LoginResult } from "../types/auth";

const DEV_SESSION_TOKEN = "dev-session";
const MOCK_SESSION_TOKEN = "mock-session";
const DEFAULT_REDIRECT_TARGET = "/job-roles";

type BackendLoginResponse = {
	token?: string;
};

const getBackendLoginUrl = () => {
	const configuredUrl = process.env.AUTH_LOGIN_API_URL?.trim();

	if (configuredUrl && configuredUrl.length > 0) {
		return configuredUrl;
	}

	return null;
};

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
		const backendLoginUrl = getBackendLoginUrl();
		const { isDevLoginEnabled, devLoginEmail, devLoginPassword } =
			getDevLoginConfig();
		const normalizedEmail = credentials.email.trim().toLowerCase();
		const password = credentials.password;

		if (backendLoginUrl) {
			const response = await axios.post<BackendLoginResponse>(
				backendLoginUrl,
				{
					email: normalizedEmail,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					validateStatus: () => true,
					timeout: 5000,
				},
			);

			if (response.status === 401) {
				return {
					isAuthenticated: false,
					redirectTo: DEFAULT_REDIRECT_TARGET,
				};
			}

			if (response.status < 200 || response.status >= 300) {
				throw new Error(
					`Unexpected backend login response status: ${response.status}`,
				);
			}

			const token = response.data?.token;

			if (typeof token !== "string" || token.trim().length === 0) {
				throw new Error("Backend login response did not include a token");
			}

			return {
				isAuthenticated: true,
				redirectTo: DEFAULT_REDIRECT_TARGET,
				authSession: token,
			};
		}

		if (!isDevLoginEnabled || !devLoginEmail || !devLoginPassword) {
			return {
				isAuthenticated: false,
				redirectTo: DEFAULT_REDIRECT_TARGET,
			};
		}

		if (normalizedEmail === devLoginEmail && password === devLoginPassword) {
			return {
				isAuthenticated: true,
				redirectTo: DEFAULT_REDIRECT_TARGET,
				authSession: DEV_SESSION_TOKEN,
			};
		}

		return {
			isAuthenticated: false,
			redirectTo: DEFAULT_REDIRECT_TARGET,
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
