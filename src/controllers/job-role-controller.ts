import type { Request, Response } from "express";
import { getJobRoles } from "../services/job-role-service";

type JobRoleControllerDeps = {
	getJobRoles: typeof getJobRoles;
};

export class JobRoleController {
	private readonly getJobRolesService: typeof getJobRoles;

	constructor(deps: JobRoleControllerDeps) {
		this.getJobRolesService = deps.getJobRoles;
	}

	getJobRolesPage = async (_req: Request, res: Response) => {
		try {
			const jobRoles = await this.getJobRolesService();

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

export const jobRoleController = new JobRoleController({ getJobRoles });
