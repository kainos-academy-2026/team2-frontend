import axios from "axios";

const apiClient = axios.create({
	baseURL: process.env.BACKEND_URL || "http://localhost:3001",
	headers: {
		"content-type": "application/json",
	},
	timeout: 5000,
});

export default apiClient;
