import { type JobRole, JobRoleStatus } from "../types/job-role";
import type { JobRoleApiResponse } from "../types/job-role-api";

export class JobRoleMapper {
	private toStatus = (status: string): JobRoleStatus => {
		const normalizedStatus = status?.trim().toUpperCase();

		if (normalizedStatus === JobRoleStatus.CLOSED) {
			return JobRoleStatus.CLOSED;
		}

		return JobRoleStatus.OPEN;
	};

	public toJobRole(jobRole: JobRoleApiResponse): JobRole {
		return {
			id: String(jobRole.jobRoleId),
			name: jobRole.roleName,
			location: jobRole.location,
			capability: jobRole.capability,
			band: jobRole.band,
			closingDate: jobRole.closingDate,
			status: this.toStatus(jobRole.status),
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl,
			numberOfOpenPositions: jobRole.numberOfOpenPositions ?? 0,
		};
	}
}

export default JobRoleMapper;
