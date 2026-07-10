import type { AuthService, LoginCredentials, LoginResult } from "../types/auth";

const MOCK_SESSION_TOKEN = "mock-session";
const MOCK_LOGIN_EMAIL = "mock@example.com";
const MOCK_LOGIN_PASSWORD = "mockpassword123";

export class MockAuthService implements AuthService {
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		const normalizedEmail = credentials.email.trim().toLowerCase();

		if (
			normalizedEmail !== MOCK_LOGIN_EMAIL ||
			credentials.password !== MOCK_LOGIN_PASSWORD
		) {
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
