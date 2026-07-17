import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string) => {
	if (!dateRegex.test(value)) {
		return false;
	}

	const parsedDate = new Date(`${value}T00:00:00.000Z`);

	if (Number.isNaN(parsedDate.getTime())) {
		return false;
	}

	return parsedDate.toISOString().startsWith(`${value}T`);
};

const isTodayOrFutureDate = (value: string) => {
	const today = new Date();
	const todayDateOnly = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	const inputDate = new Date(`${value}T00:00:00`);

	return inputDate.getTime() >= todayDateOnly.getTime();
};

const toOptionalString = (value: unknown) => {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
};

const toOpenPositions = (value: unknown) => {
	if (value === undefined || value === null || value === "") {
		return 0;
	}

	return value;
};

export const createJobRoleSchema = z.object({
	name: z.string().trim().min(1, "Job role name is required."),
	location: z.string().trim().min(1, "Location is required."),
	capabilityId: z.coerce
		.number({ message: "Capability is required." })
		.int("Capability is required.")
		.positive("Capability is required."),
	bandId: z.coerce
		.number({ message: "Band is required." })
		.int("Band is required.")
		.positive("Band is required."),
	closingDate: z
		.string()
		.trim()
		.min(1, "Closing date is required.")
		.refine(isValidDateString, {
			message: "Closing date must be a valid date in YYYY-MM-DD format.",
		})
		.refine(isTodayOrFutureDate, {
			message: "Closing date cannot be before today.",
		}),
	description: z.preprocess(toOptionalString, z.string()),
	sharepointUrl: z.preprocess(toOptionalString, z.string()),
	responsibilities: z.preprocess(toOptionalString, z.string()),
	numberOfOpenPositions: z.preprocess(
		toOpenPositions,
		z.coerce
			.number({ message: "Number of open positions must be a number." })
			.int("Number of open positions must be a whole number.")
			.min(0, "Number of open positions cannot be negative."),
	),
});

export type CreateJobRoleDto = z.infer<typeof createJobRoleSchema>;
