import type { Request, Response } from "express";
import type { JobRoleService } from "../services/job-role-service";

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

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

	getJobRoleDetailPage = async (req: Request, res: Response) => {
		try {
			const jobRole = await this.jobRoleService.getJobRoleById(req.params.id);

			if (!jobRole) {
				res.status(404).render("job-role-detail", {
					jobRole: null,
					message: "Job role not found.",
				});
				return;
			}

			res.render("job-role-detail", {
				jobRole,
				message: "",
			});
		} catch {
			res.status(502).render("job-role-detail", {
				jobRole: null,
				message: "Could not load this job role right now.",
			});
		}
	};
}
