import axios from "axios";
import { toJobRole } from "../mappers/job-role-mapper";
import {
	JOB_ROLES_API_URL,
	type JobRoleApiResponse,
} from "../models/job-role-api";



export class JobRoleService {
	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRoleApiResponse[]>(JOB_ROLES_API_URL);
			const jobRoles = Array.isArray(response.data) ? response.data : [];
			return jobRoles.map(toJobRole);
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
				`${JOB_ROLES_API_URL}/${id}`,
			);

			if (!response.data) {
				return null;
			}

			return toJobRole(response.data);
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
