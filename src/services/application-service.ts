import apiURL from "../config/backend";
import type {
	CreateApplicationRequest,
	UploadUrlRequest,
	UploadUrlResponse,
} from "../types/application";

const authHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
});

export class ApplicationService {
	async getUploadUrl(
		jobRoleId: string,
		request: UploadUrlRequest,
		token: string,
	): Promise<UploadUrlResponse> {
		try {
			const response = await apiURL.post<UploadUrlResponse>(
				`/job-roles/${jobRoleId}/applications/upload-url`,
				request,
				{ headers: authHeaders(token) },
			);
			return response.data;
		} catch (error) {
			console.error("Failed to get upload URL:", error);

			throw error;
		}
	}

	async createApplication(
		jobRoleId: string,
		request: CreateApplicationRequest,
		token: string,
	): Promise<void> {
		try {
			await apiURL.post(`/job-roles/${jobRoleId}/applications`, request, {
				headers: authHeaders(token),
			});
		} catch (error) {
			console.error("Failed to create application:", error);
			throw error;
		}
	}
}
