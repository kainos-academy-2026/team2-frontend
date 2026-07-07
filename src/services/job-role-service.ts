import axios from "axios";
import type { JobRole } from "../models/job-role";

const JOB_ROLES_API_URL =
	process.env.JOB_ROLES_API_URL || "http://localhost:3001/job-roles";

type JobRoleApiResponse = Partial<JobRole> & {
	roleName?: string;
};

const toJobRole = (jobRole: JobRoleApiResponse): JobRole => ({
	name: jobRole.roleName?.trim() || "",
	location: jobRole.location?.trim() || "",
	capability: jobRole.capability?.trim() || "",
	band: jobRole.band?.trim() || "",
	closingDate: jobRole.closingDate?.trim() || "",
	status: jobRole.status?.trim() || "OPEN",
});

export const getJobRoles = async (): Promise<JobRole[]> => {
	const response = await axios.get<JobRoleApiResponse[]>(JOB_ROLES_API_URL);
	const jobRoles = Array.isArray(response.data) ? response.data : [];

	return jobRoles.map(toJobRole);
};
