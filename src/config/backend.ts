const DEFAULT_BACKEND_URL = "http://localhost:3000";

export const BACKEND_URL = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

export const getBackendUrl = (endpoint: string): string => {
	if (endpoint.startsWith("/")) {
		return `${BACKEND_URL}${endpoint}`;
	}

	return `${BACKEND_URL}/${endpoint}`;
};
