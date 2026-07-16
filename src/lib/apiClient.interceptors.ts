import axios from "axios";
import { ForbiddenError } from "../errors/forbidden-error";
import { ServerError } from "../errors/server-error";
import apiClient from "./apiClient";

export function handleResponseError(error: unknown): never {
	if (axios.isAxiosError(error)) {
		if (error.response?.status === 403) {
			throw new ForbiddenError();
		}
		if (error.response?.status === 500) {
			throw new ServerError();
		}
	}
	throw error;
}

apiClient.interceptors.response.use(undefined, handleResponseError);
