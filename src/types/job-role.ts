export enum JobRoleStatus {
	OPEN = "OPEN",
	CLOSED = "CLOSED",
}

export interface JobRole {
	id: string;
	name: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: JobRoleStatus;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}

export interface JobRoleApiResponse {
	roleName?: string;
	location?: string;
	capability?: string;
	band?: string;
	closingDate?: string;
	status?: string;
}
