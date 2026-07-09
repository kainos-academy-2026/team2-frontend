import axios from "axios";
import JobRoleMapper from "../mappers/job-role-mapper";
import { JobRole } from "../models/job-role";
import { JobRoleApiResponse } from "../models/job-role-api";

const normalizeText = (value: unknown): string =>
	typeof value === "string" ? value.trim() : "";

const normalizeNumber = (value: unknown): number =>
	typeof value === "number" && Number.isFinite(value) ? value : 0;

const normalizeApiJobRole = (
	jobRole: JobRoleApiResponse & { roleId?: unknown },
): JobRoleApiResponse => ({
	id: String(jobRole.id ?? jobRole.roleId ?? ""),
	roleName: normalizeText(jobRole.roleName),
	location: "",
	capability: normalizeText(jobRole.capability),
	band: normalizeText(jobRole.band),
	closingDate: normalizeText(jobRole.closingDate),
	status: normalizeText(jobRole.status),
	description: normalizeText(jobRole.description),
	responsibilities: normalizeText(jobRole.responsibilities),
	sharepointUrl: normalizeText(jobRole.sharepointUrl),
	numberOfOpenPositions: normalizeNumber(jobRole.numberOfOpenPositions),
});

export class JobRoleService {
	constructor(private jobRoleMapper: JobRoleMapper = new JobRoleMapper()) {}
	
	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<(JobRoleApiResponse & { roleId?: unknown })[]>(
				`${process.env.BACKEND_URL ?? "http://localhost:3001"}/job-roles`,
			);
			const jobRoles = Array.isArray(response.data) ? response.data : [];
			return jobRoles.map((jobRole) => {
				const mappedJobRole = this.jobRoleMapper.toJobRole(
					normalizeApiJobRole(jobRole),
				);

				return {
					...mappedJobRole,
					location: "",
					specification: "",
				} as JobRole;
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`Failed to fetch job roles: ${error.message}`);
			}

			throw new Error("An unexpected error occurred while fetching job roles.");
		}
	}

	async getJobRoleById(id: string): Promise<JobRole | null> {
		try {
			const response = await axios.get<JobRoleApiResponse & { roleId?: unknown }>(
				`${process.env.BACKEND_URL ?? "http://localhost:3001"}/job-roles/${id}`,
			);

			if (!response.data) {
				return null;
			}

			const mappedJobRole = this.jobRoleMapper.toJobRole(
				normalizeApiJobRole(response.data),
			);

			return {
				...mappedJobRole,
				location: "",
				specification: "",
			} as JobRole;
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
