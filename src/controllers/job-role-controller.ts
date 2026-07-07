import type { Request, Response } from "express";
import { getJobRoles } from "../services/job-role-service";

export const getJobRolesPage = async (_req: Request, res: Response) => {
	try {
		const jobRoles = await getJobRoles();

		res.render("job-role-list", {
			jobRoles,
		});
	} catch {
		res.render("job-role-list", {
			jobRoles: [],
		});
	}
};
