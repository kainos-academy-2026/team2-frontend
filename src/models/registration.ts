export interface RegistrationInput {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface RegistrationPayload {
	fullName: string;
	email: string;
	password: string;
}

export interface RegistrationValues {
	fullName: string;
	email: string;
}

export interface RegistrationViewState {
	values: RegistrationValues;
	error?: string;
	success?: string;
}
