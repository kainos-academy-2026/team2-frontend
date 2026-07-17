import axios from "axios";
import apiURL from "../config/backend";
import { ForbiddenError } from "../errors/forbidden-error";
import { ServerError } from "../errors/server-error";
import type { JobRoleMapper } from "../mappers/job-role-mapper";
import type { JobRole } from "../types/job-role";
import type { JobRoleApiResponse } from "../types/job-role-api";

const authHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
});

export class JobRoleService {
	constructor(private readonly mapper: JobRoleMapper) {}

	async deleteJobRole(id: string, token: string): Promise<void> {
		try {
			await apiURL.delete(`/${id}`, {
				headers: authHeaders(token),
			});
		} catch (error) {
			if (error instanceof ForbiddenError || error instanceof ServerError) {
				throw error;
			}

			const isAxiosError = axios.isAxiosError(error);

			if (isAxiosError) {
				throw error;
			}

			throw new Error(
				"An unexpected error occurred while deleting the job role.",
			);
		}
	}

	async getJobRoles(token: string): Promise<JobRole[]> {
		const response = await apiURL.get<JobRoleApiResponse[]>("/job-roles", {
			headers: authHeaders(token),
		});
		const jobRoles = Array.isArray(response.data) ? response.data : [];
		return jobRoles.map((jobRole) => this.mapper.toJobRole(jobRole));
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
			const isAxiosError = axios.isAxiosError(error);

			if (isAxiosError && error.response?.status === 404) {
				return null;
			}
			if (isAxiosError) {
				throw new Error(`Failed to fetch job role: ${error.message}`);
			}

			throw new Error(
				"An unexpected error occurred while fetching the job role.",
			);
		}
	}
}
