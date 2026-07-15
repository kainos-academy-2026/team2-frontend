import axios from "axios";
import apiURL from "../config/backend";
import type { JobRoleMapper } from "../mappers/job-role-mapper";
import type { JobRole } from "../types/job-role";
import type { JobRoleApiResponse } from "../types/job-role-api";

export class ForbiddenError extends Error {
	constructor() {
		super("Forbidden");
		this.name = "ForbiddenError";
	}
}

const authHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
});

export class JobRoleService {
	constructor(private readonly mapper: JobRoleMapper) {}

	async getJobRoles(token: string): Promise<JobRole[]> {
		try {
			const response = await apiURL.get<JobRoleApiResponse[]>("/job-roles", {
				headers: authHeaders(token),
			});
			const jobRoles = Array.isArray(response.data) ? response.data : [];
			return jobRoles.map((jobRole) => this.mapper.toJobRole(jobRole));
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 403) {
				throw new ForbiddenError();
			}
			console.error("Failed to fetch job roles:", error);
			throw error;
		}
	}

	async getJobRoleById(id: string, token: string): Promise<JobRole | null> {
		try {
			const response = await apiURL.get<
				JobRoleApiResponse | JobRoleApiResponse[]
			>(`/job-roles/${id}`, { headers: authHeaders(token) });
			const jobRoleData = Array.isArray(response.data)
				? response.data[0]
				: response.data;

			if (!jobRoleData) {
				return null;
			}

			return this.mapper.toJobRole(jobRoleData);
		} catch (error) {
			const errorWithStatus = error as { response?: { status?: number } };

			if (errorWithStatus.response?.status === 403) {
				throw new ForbiddenError();
			}

			if (errorWithStatus.response?.status === 404) {
				return null;
			}

			if (axios.isAxiosError(error)) {
				throw new Error(`Failed to fetch job role: ${error.message}`);
			}

			throw new Error(
				"An unexpected error occurred while fetching the job role.",
			);
		}
	}
}
