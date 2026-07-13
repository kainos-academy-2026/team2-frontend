import apiURL from "../config/backend";
import type { JobRoleMapper } from "../mappers/job-role-mapper";
import type { JobRole, JobRoleApiResponse } from "../types/job-role";

export class JobRoleService {
	constructor(private readonly mapper: JobRoleMapper) {}

	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await apiURL.get<JobRoleApiResponse[]>("/job-roles");
			const jobRoles = Array.isArray(response.data) ? response.data : [];
			return jobRoles.map((jobRole) => this.mapper.toJobRole(jobRole));
		} catch (error) {
			console.error("Failed to fetch job roles:", error);
			throw error;
		}
	}
}
