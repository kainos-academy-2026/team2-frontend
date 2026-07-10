export type RegistrationInput = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegistrationPayload = {
	fullName: string;
	email: string;
	password: string;
};

export type RegistrationViewState = {
	values: Pick<RegistrationInput, "fullName" | "email">;
	error?: string;
	success?: string;
};
