import type { Request, Response } from "express";
import type {
	RegistrationInput,
	RegistrationViewState,
} from "../models/registration";
import { registerUser } from "../services/registration-service";

const emptyState: RegistrationViewState = {
	values: {
		fullName: "",
		email: "",
	},
};

const normalizeInput = (
	body: Partial<RegistrationInput>,
): RegistrationInput => ({
	fullName: body.fullName?.trim() || "",
	email: body.email?.trim() || "",
	password: body.password || "",
	confirmPassword: body.confirmPassword || "",
});

const validateRegistration = (input: RegistrationInput): string | undefined => {
	if (
		!input.fullName ||
		!input.email ||
		!input.password ||
		!input.confirmPassword
	) {
		return "All fields are required.";
	}

	if (input.password.length < 8) {
		return "Password must be at least 8 characters long.";
	}

	if (input.password !== input.confirmPassword) {
		return "Passwords do not match.";
	}

	return undefined;
};

export const getRegisterPage = (_req: Request, res: Response) => {
	res.render("register", emptyState);
};

export const postRegister = async (req: Request, res: Response) => {
	const input = normalizeInput(req.body as Partial<RegistrationInput>);
	const validationError = validateRegistration(input);

	if (validationError) {
		res.status(400).render("register", {
			values: {
				fullName: input.fullName,
				email: input.email,
			},
			error: validationError,
		});
		return;
	}

	try {
		await registerUser({
			fullName: input.fullName,
			email: input.email,
			password: input.password,
		});

		res.status(201).render("register", {
			values: {
				fullName: "",
				email: input.email,
			},
			success: "Your account has been created.",
		});
	} catch (error) {
		res.status(502).render("register", {
			values: {
				fullName: input.fullName,
				email: input.email,
			},
			error:
				error instanceof Error
					? error.message
					: "Registration failed. Please try again.",
		});
	}
};

import type { Request, Response } from "express";
import type { RegistrationService } from "../services/registration-service";
import type {
	RegistrationInput,
	RegistrationViewState,
} from "../types/registration";

export default class RegistrationController {
	constructor(private readonly service: RegistrationService) {}

	getRegisterPage = (_req: Request, res: Response) => {
		res.render("register");
	};

	postRegister = async (req: Request, res: Response) => {
		const input = req.body;

		if (res.locals.errors) {
			res.render("register", {
				values: this.getValues(input),
			});

			return;
		}

		try {
			await this.service.registerUser({
				fullName: input.fullName,
				email: input.email,
				password: input.password,
			});

			res.redirect("/login");
		} catch {
			res.render("register", {
				values: this.getValues(input),
			});
		}
	};

	private getValues(
		body: Partial<RegistrationInput>,
	): RegistrationViewState["values"] {
		return {
			fullName: body.fullName?.trim() || "",
			email: body.email?.trim() || "",
		};
	}
}
