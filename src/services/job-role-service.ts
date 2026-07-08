import axios from "axios";
import { toOpenPositions } from "../mappers/job-role-mapper";
import {
	JOB_ROLES_API_URL,
	type JobRoleApiResponse,
} from "../models/job-role-api";
import { JobRoleStatus, type JobRole } from "../models/job-role";

const toStatus = (status: string | undefined): JobRoleStatus => {
	const normalizedStatus = status?.trim().toUpperCase();

	if (normalizedStatus === JobRoleStatus.CLOSED) {
		return JobRoleStatus.CLOSED;
	}

	return JobRoleStatus.OPEN;
};

const toJobRole = (jobRole: JobRoleApiResponse): JobRole => ({
	id: String(jobRole.id ?? jobRole.roleId ?? ""),
	name: jobRole.roleName?.trim() || "",
	location: jobRole.location?.trim() || "",
	capability: jobRole.capability?.trim() || "",
	band: jobRole.band?.trim() || "",
	closingDate: jobRole.closingDate?.trim() || "",
	status: toStatus(jobRole.status),
	description: jobRole.description?.trim() || "",
	responsibilities: jobRole.responsibilities?.trim() || "",
	sharepointUrl: jobRole.sharepointUrl?.trim() || "",
	numberOfOpenPositions: toOpenPositions(jobRole.numberOfOpenPositions),
	specification: jobRole.specification?.trim() || "",
});

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
