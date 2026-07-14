import type { Request, Response } from "express";
import { getUserFromSession } from "../middleware/auth-session";
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

	getJobRoleDetailPage = async (req: Request, res: Response) => {
		const user = getUserFromSession(req);
		const isApplicant = user !== null && user.role !== "admin";

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				req.params.id,
				req.cookies.authSession,
			);

			if (!jobRole) {
				res.status(404).render("job-role-detail", {
					jobRole: null,
					isApplicant,
					message: "Job role not found.",
				});
				return;
			}

			res.render("job-role-detail", {
				jobRole,
				isApplicant,
				message: "",
			});
		} catch {
			res.status(502).render("job-role-detail", {
				jobRole: null,
				isApplicant,
				message: "Could not load this job role right now.",
			});
		}
	};
}
