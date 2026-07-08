import { JobRoleStatus, type JobRole } from "../models/job-role";
import type { JobRoleApiResponse } from "../models/job-role-api";

export const toOpenPositions = (numberOfOpenPositions: number | undefined): number => {
	if (typeof numberOfOpenPositions === "number") {
		return Number.isFinite(numberOfOpenPositions) && numberOfOpenPositions > 0
			? numberOfOpenPositions
			: 0;
	}

	return 0;
};

const toStatus = (status: string | undefined): JobRoleStatus => {
	const normalizedStatus = status?.trim().toUpperCase();

	if (normalizedStatus === JobRoleStatus.CLOSED) {
		return JobRoleStatus.CLOSED;
	}

	return JobRoleStatus.OPEN;
};

export const toJobRole = (jobRole: JobRoleApiResponse): JobRole => ({
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