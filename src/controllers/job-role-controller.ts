import type { NextFunction, Request, Response } from "express";
import type { JobRoleService } from "../services/job-role-service";

export class JobRoleController {
	private readonly jobRoleService: JobRoleService;

	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	getJobRolesPage = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const jobRoles = await this.jobRoleService.getJobRoles(
				req.cookies.authSession,
			);

			res.render("job-role-list", {
				jobRoles,
			});
		} catch (error) {
			next(error);
		}
	};

	getJobRoleDetailPage = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				req.params.id,
				req.cookies.authSession,
			);

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
		} catch (error) {
			next(error);
		}
	};
}
