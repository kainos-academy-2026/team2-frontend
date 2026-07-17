export interface CreateJobRolePayload {
	name: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: string;
	description: string;
	sharepointUrl: string;
	responsibilities: string[];
	numberOfOpenPositions: number;
}

export interface CreateJobRoleFormValues {
	name: string;
	location: string;
	capabilityId: string;
	bandId: string;
	closingDate: string;
	description: string;
	sharepointUrl: string;
	responsibilities: string;
	numberOfOpenPositions: string;
}

export type CreateJobRoleFieldErrors = Partial<
	Record<keyof CreateJobRoleFormValues, string[]>
>;
