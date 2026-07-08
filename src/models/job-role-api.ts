import type { JobRole } from "./job-role";

export const JOB_ROLES_API_URL =
	process.env.JOB_ROLES_API_URL || "http://localhost:3001/job-roles";

export type JobRoleApiResponse = Partial<JobRole> & {
	id?: string | number;
	roleId?: string | number;
	roleName?: string;
	specification?: string;
	description?: string;
	responsibilities?: string;
	sharepointUrl?: string;
	numberOfOpenPositions?: number;
};