import apiURL from "../config/backend";
import type { AuthService, LoginCredentials, LoginResult } from "../types/auth";

const DEFAULT_REDIRECT_TARGET = "/job-roles";

type BackendLoginResponse = {
	token?: string;
};

export class DefaultAuthService implements AuthService {
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		const response = await apiURL.post<BackendLoginResponse>(
			"/login",
			{
				email: credentials.email.trim().toLowerCase(),
				password: credentials.password,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
				validateStatus: () => true,
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

	async logout() {
		return;
	}
}
