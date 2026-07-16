import { z } from "zod";
import type { LoginCredentials } from "../types/auth";

const loginCredentialsSchema = z.object({
	email: z
		.string()
		.trim()
		.email()
		.transform((value) => value.toLowerCase()),
	password: z.string().min(1, "Please enter your password."),
});

type LoginFieldErrors = {
	email?: string[];
	password?: string[];
};

type ParseLoginCredentialsResult =
	| {
			success: true;
			credentials: LoginCredentials;
	  }
	| {
			success: false;
			submittedEmail: string;
			fieldErrors: LoginFieldErrors;
	  };

const getSubmittedEmail = (input: unknown) => {
	if (!input || typeof input !== "object") {
		return "";
	}

	const body = input as { email?: unknown };
	return typeof body.email === "string" ? body.email.trim() : "";
};

export const parseLoginCredentials = (
	input: unknown,
): ParseLoginCredentialsResult => {
	const parsed = loginCredentialsSchema.safeParse(input);

	if (!parsed.success) {
		const errorTree = z.treeifyError(parsed.error);
		const emailError = errorTree.properties?.email?.errors?.[0];
		const passwordError = errorTree.properties?.password?.errors?.[0];

		return {
			success: false,
			submittedEmail: getSubmittedEmail(input),
			fieldErrors: {
				email: emailError ? [emailError] : undefined,
				password: passwordError ? [passwordError] : undefined,
			},
		};
	}

	return {
		success: true,
		credentials: parsed.data,
	};
};
