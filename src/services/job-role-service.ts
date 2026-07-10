import axios from "axios";
import { getBackendUrl } from "../config/backend";
import type { JobRole, JobRoleApiResponse } from "../models/job-role";

export class JobRoleService {
	private readonly jobRolesEndpoint = getBackendUrl("/job-roles");

	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRoleApiResponse[]>(
				this.jobRolesEndpoint,
			);
			const jobRoles = Array.isArray(response.data) ? response.data : [];

			return jobRoles.map((jobRole) => this.toJobRole(jobRole));
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`Failed to fetch job roles: ${error.message}`);
			}

			throw new Error("An unexpected error occurred while fetching job roles.");
		}
	}

	private toJobRole(jobRole: JobRoleApiResponse): JobRole {
		return {
			name: jobRole.roleName?.trim() || "",
			location: jobRole.location?.trim() || "",
			capability: jobRole.capability?.trim() || "",
			band: jobRole.band?.trim() || "",
			closingDate: jobRole.closingDate?.trim() || "",
			status: (jobRole.status?.trim() || "OPEN").toUpperCase(),
		};
	}
}

export const jobRoleService = new JobRoleService();
export const getJobRoles = jobRoleService.getJobRoles.bind(jobRoleService);
