import axios from "axios";
import JobRoleMapper from "../mappers/job-role-mapper";
import type { JobRole } from "../types/job-role";
import type { JobRoleApiResponse } from "../types/job-role-api";

export class JobRoleService {
	private readonly apiUrl: string;
	private readonly jobRoleMapper: JobRoleMapper;

	constructor(
		apiUrlOrMapper: string | JobRoleMapper =
			process.env.JOB_ROLES_API_URL || "http://localhost:3001/job-roles",
		jobRoleMapper: JobRoleMapper = new JobRoleMapper(),
	) {
		if (typeof apiUrlOrMapper === "string") {
			this.apiUrl = apiUrlOrMapper;
			this.jobRoleMapper = jobRoleMapper;
			return;
		}

		this.apiUrl =
			process.env.JOB_ROLES_API_URL || "http://localhost:3001/job-roles";
		this.jobRoleMapper = apiUrlOrMapper;
	}
	
	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRoleApiResponse[]>(this.apiUrl);
			const jobRoles = Array.isArray(response.data) ? response.data : [];

			return jobRoles.map((jobRole) => this.jobRoleMapper.toJobRole(jobRole));
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`Failed to fetch job roles: ${error.message}`);
			}

			throw new Error("An unexpected error occurred while fetching job roles.");
		}
	}

	async getJobRoleById(id: string): Promise<JobRole | null> {
		try {
			const response = await axios.get<JobRoleApiResponse>(
				`${this.apiUrl}/${id}`,
			);

			if (!response.data) {
				return null;
			}

			return this.jobRoleMapper.toJobRole(response.data);
		} catch (error) {
			const errorWithStatus = error as { response?: { status?: number } };

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
