import axios from "axios";
import { getBackendUrl } from "../config/backend";
import type { RegistrationPayload } from "../types/registration";

export class RegistrationService {
	private readonly registrationEndpoint = getBackendUrl("/register");

	async registerUser(payload: RegistrationPayload): Promise<void> {
		await axios.post(this.registrationEndpoint, payload);
	}
}
