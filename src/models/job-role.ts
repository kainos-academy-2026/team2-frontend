export interface JobRole {
	name: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: string;
}

export interface JobRoleApiResponse {
	roleName?: string;
	location?: string;
	capability?: string;
	band?: string;
	closingDate?: string;
	status?: string;
}
