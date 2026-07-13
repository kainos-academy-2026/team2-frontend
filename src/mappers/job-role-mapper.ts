import type { JobRole, JobRoleApiResponse } from "../types/job-role";

export class JobRoleMapper {
	toJobRole(jobRole: JobRoleApiResponse): JobRole {
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
