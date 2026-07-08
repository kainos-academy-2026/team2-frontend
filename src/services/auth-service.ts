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

const defaultAuthService: AuthService = {
	async login() {
		return {
			isAuthenticated: true,
			redirectTo: "/job-roles",
		};
	},
	async logout() {
		return;
	},
};

export const authService = defaultAuthService;