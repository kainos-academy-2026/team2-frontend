import apiURL from "../config/backend";
import type {
	CreateApplicationRequest,
	UploadUrlRequest,
	UploadUrlResponse,
} from "../types/application";

export class ApplicationService {
	async getUploadUrl(
		jobRoleId: string,
		request: UploadUrlRequest,
	): Promise<UploadUrlResponse> {
		try {
			const response = await apiURL.post<UploadUrlResponse>(
				`/job-roles/${jobRoleId}/applications/upload-url`,
				request,
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
	): Promise<void> {
		try {
			await apiURL.post(`/job-roles/${jobRoleId}/applications`, request);
		} catch (error) {
			console.error("Failed to create application:", error);
			throw error;
		}
	}
}
