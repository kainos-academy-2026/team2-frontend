import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type FieldErrorMap = Record<string, string[]>;

export const validateBody =
	(schema: ZodType): RequestHandler =>
	(req, res, next): void => {
		const parsedRequest = schema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			const fieldErrors: FieldErrorMap = {};

			for (const issue of parsedRequest.error.issues) {
				const field = issue.path?.[0];

				if (typeof field !== "string" || typeof issue.message !== "string") {
					continue;
				}

				const existingMessages = fieldErrors[field] ?? [];

				if (!existingMessages.includes(issue.message)) {
					existingMessages.push(issue.message);
				}

				fieldErrors[field] = existingMessages;
			}

			res.locals.errors = fieldErrors;
		} else {
			res.locals.errors = null;
		}

		next();
	};
