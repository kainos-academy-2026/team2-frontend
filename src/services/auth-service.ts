export type LoginCredentials = {
	email: string;
	password: string;
};

export type AuthSessionState = {
	isAuthenticated: boolean;
};

export type LoginResult = AuthSessionState & {
	redirectTo: string;
};

export interface AuthService {
	login(credentials: LoginCredentials): Promise<LoginResult>;
	logout(): Promise<void>;
}

const isDevLoginEnabled =
	process.env.ENABLE_DEV_LOGIN === "true" &&
	process.env.NODE_ENV !== "production";

const DEV_LOGIN_EMAIL = process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase();
const DEV_LOGIN_PASSWORD = process.env.DEV_LOGIN_PASSWORD;

const defaultAuthService: AuthService = {
	async login(credentials) {
		if (!isDevLoginEnabled || !DEV_LOGIN_EMAIL || !DEV_LOGIN_PASSWORD) {
			return {
				isAuthenticated: false,
				redirectTo: "/job-roles",
			};
		}

		const normalizedEmail = credentials.email.trim().toLowerCase();
		const isAuthenticated =
			normalizedEmail === DEV_LOGIN_EMAIL &&
			credentials.password === DEV_LOGIN_PASSWORD;

		return {
			isAuthenticated,
			redirectTo: "/job-roles",
		};
	},
	async logout() {
		return;
	},
};

export const authService = defaultAuthService;
