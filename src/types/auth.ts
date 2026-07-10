export type LoginCredentials = {
	email: string;
	password: string;
};

export type AuthSessionState = {
	isAuthenticated: boolean;
};

export type LoginResult =
	| {
			isAuthenticated: true;
			redirectTo: string;
			authSession: string;
	  }
	| {
			isAuthenticated: false;
			redirectTo: string;
	  };

export interface AuthService {
	login(credentials: LoginCredentials): Promise<LoginResult>;
	logout(): Promise<void>;
}
