import apiURL from "../config/backend";
import type { RegistrationPayload } from "../types/registration";

export class RegistrationService {
	async registerUser(payload: RegistrationPayload): Promise<void> {
		try {
			const response = await apiURL.post("/register", payload);
			return response.data;
		} catch (error) {
			console.error("Error registering user:", error);
			throw error;
		}
	}
}
