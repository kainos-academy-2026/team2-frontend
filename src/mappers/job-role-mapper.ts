import { JobRoleStatus, type JobRole } from "../types/job-role";
import type { JobRoleApiResponse } from "../types/job-role-api";

export default class JobRoleMapper {
	private toStatus = (status: string): JobRoleStatus => {
		const normalizedStatus = status?.trim().toUpperCase();

		if (normalizedStatus === JobRoleStatus.CLOSED) {
			return JobRoleStatus.CLOSED;
		}

		return JobRoleStatus.OPEN;
	};

	public toJobRole(jobRole: JobRoleApiResponse): JobRole {
		return {
			id: jobRole.id,
			name: jobRole.roleName,
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