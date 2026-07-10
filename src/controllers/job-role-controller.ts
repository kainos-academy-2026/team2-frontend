import type { Request, Response } from "express";
import {
	type JobRoleService,
	jobRoleService,
} from "../services/job-role-service";

export class JobRoleController {
	constructor(private readonly service: JobRoleService = jobRoleService) {}

	getJobRolesPage = async (_req: Request, res: Response) => {
		try {
			const jobRoles = await this.service.getJobRoles();

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

export const jobRoleController = new JobRoleController();
export const getJobRolesPage = jobRoleController.getJobRolesPage;
