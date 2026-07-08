import axios from "axios";
import type { RegistrationPayload } from "../models/registration";

const REGISTRATION_API_URL =
	process.env.REGISTRATION_API_URL || "http://localhost:3000/register";

export const registerUser = async (
	payload: RegistrationPayload,
): Promise<void> => {
	try {
		await axios.post(REGISTRATION_API_URL, payload);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const apiMessage =
				typeof error.response?.data === "object" && error.response?.data
					? (error.response.data as { message?: string }).message
					: undefined;

			throw new Error(apiMessage || "Registration failed. Please try again.");
		}

		throw new Error("Registration failed. Please try again.");
	}
};
