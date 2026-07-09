import axios from "axios";
import JobRoleMapper from "../mappers/job-role-mapper";
import { JobRole } from "../models/job-role";
import { JobRoleApiResponse } from "../models/job-role-api";

export class JobRoleService {
	constructor(private jobRoleMapper: JobRoleMapper = new JobRoleMapper()) {}
	
	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRoleApiResponse[]>(
				`${process.env.BACKEND_URL ?? "http://localhost:3001"}/job-roles`,
			);

			return response.data.map(this.jobRoleMapper.toJobRole);
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
				`${process.env.BACKEND_URL ?? "http://localhost:3001"}/job-roles/${id}`,
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
