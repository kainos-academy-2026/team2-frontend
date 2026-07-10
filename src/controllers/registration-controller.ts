import type { Request, Response } from "express";
import { z } from "zod";
import type {
	RegistrationInput,
	RegistrationViewState,
} from "../models/registration";
import {
	type RegistrationService,
	registrationService,
} from "../services/registration-service";

const emptyState: RegistrationViewState = {
	values: {
		fullName: "",
		email: "",
	},
};

const trimString = (value: unknown): string =>
	typeof value === "string" ? value.trim() : "";

const preserveString = (value: unknown): string =>
	typeof value === "string" ? value : "";

const registrationSchema = z
	.object({
		fullName: z.preprocess(trimString, z.string()),
		email: z.preprocess(trimString, z.string()),
		password: z.preprocess(preserveString, z.string()),
		confirmPassword: z.preprocess(preserveString, z.string()),
	})
	.superRefine((input, ctx) => {
		if (
			!input.fullName ||
			!input.email ||
			!input.password ||
			!input.confirmPassword
		) {
			ctx.addIssue({
				code: "custom",
				message: "All fields are required.",
			});
			return;
		}

		if (input.password.length < 8) {
			ctx.addIssue({
				code: "custom",
				message: "Password must be at least 8 characters long.",
				path: ["password"],
			});
		}

		if (input.password !== input.confirmPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Passwords do not match.",
				path: ["confirmPassword"],
			});
		}
	});

export class RegistrationController {
	constructor(
		private readonly service: RegistrationService = registrationService,
	) {}

	getRegisterPage = (_req: Request, res: Response) => {
		res.render("register", emptyState);
	};

	postRegister = async (req: Request, res: Response) => {
		const result = registrationSchema.safeParse(req.body);

		if (!result.success) {
			const input = this.getValues(req.body as Partial<RegistrationInput>);
			res.status(400).render("register", {
				values: input,
				error: result.error.issues[0]?.message,
			});
			return;
		}

		const input = result.data;

		try {
			await this.service.registerUser({
				fullName: input.fullName,
				email: input.email,
				password: input.password,
			});

			res.redirect(303, "/login");
		} catch {
			res.status(502).render("register", {
				values: {
					fullName: input.fullName,
					email: input.email,
				},
				error: "Registration failed. Please try again.",
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

export const registrationController = new RegistrationController();
export const getRegisterPage = registrationController.getRegisterPage;
export const postRegister = registrationController.postRegister;
