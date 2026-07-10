import axios from "axios";
import { getBackendUrl } from "../config/backend";
import type { RegistrationPayload } from "../models/registration";

export class RegistrationService {
	private readonly registrationEndpoint = getBackendUrl("/register");

	async registerUser(payload: RegistrationPayload): Promise<void> {
		try {
			await axios.post(this.registrationEndpoint, payload);
		} catch (error) {
			throw error;
		}
	}
}

export const registrationService = new RegistrationService();
export const registerUser =
	registrationService.registerUser.bind(registrationService);
