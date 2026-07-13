import type { Request, Response } from "express";
import type {
	RegistrationInput,
	RegistrationViewState,
} from "../types/registration";
import {
	type RegistrationService,
	registrationService,
} from "../services/registration-service";

export default class RegistrationController {
	constructor(
		private readonly service: RegistrationService = registrationService,
	) {}

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
