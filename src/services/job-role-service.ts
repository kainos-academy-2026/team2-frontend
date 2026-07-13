import axios from "axios";
import { getBackendUrl } from "../config/backend";
import type { JobRoleMapper } from "../mappers/job-role-mapper";
import type { JobRole, JobRoleApiResponse } from "../types/job-role";

export class JobRoleService {
	private readonly jobRolesEndpoint = getBackendUrl("/job-roles");

	constructor(private readonly mapper: JobRoleMapper) {}

	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRoleApiResponse[]>(
				this.jobRolesEndpoint,
			);
			const jobRoles = Array.isArray(response.data) ? response.data : [];

			return jobRoles.map((jobRole) => this.mapper.toJobRole(jobRole));
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`Failed to fetch job roles: ${error.message}`);
			}

			throw new Error("An unexpected error occurred while fetching job roles.");
		}
	}
}
