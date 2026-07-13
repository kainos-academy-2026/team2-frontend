import type { Request, Response } from "express";
import type { JobRoleService } from "../services/job-role-service";

export class JobRoleController {
	private readonly jobRoleService: JobRoleService;

	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	getJobRolesPage = async (_req: Request, res: Response) => {
		try {
			const jobRoles = await this.jobRoleService.getJobRoles();

			res.render("job-role-list", {
				jobRoles,
			});
		} catch {
			res.render("job-role-list", {
				jobRoles: [],
			});
		}
	};
}
