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

export type RegistrationFieldErrorMap = Partial<
	Record<keyof RegistrationInput, string[]>
>;

export interface RegistrationViewState {
	values: RegistrationValues;
	fieldErrors?: RegistrationFieldErrorMap;
	error?: string;
	success?: string;
}
