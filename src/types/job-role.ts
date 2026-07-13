export enum JobRoleStatus {
	OPEN = "OPEN",
	CLOSED = "CLOSED",
}

export type JobRole = {
	id: string;
	name: string;
	capability: string;
	band: string;
	closingDate: string;
	status: JobRoleStatus;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
};
