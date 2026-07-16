import type { Request, Response } from "express";
import { ForbiddenError } from "../errors/forbidden-error";
import type { JobRoleService } from "../services/job-role-service";

export class JobRoleController {
	private readonly jobRoleService: JobRoleService;

	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	getJobRolesPage = async (req: Request, res: Response) => {
		const token = req.cookies?.authSession;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			const jobRoles = await this.jobRoleService.getJobRoles(token);

			return res.render("job-role-list", {
				jobRoles,
			});
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res.status(403).render("error", {
					statusCode: 403,
					message: "You do not have permission to access this resource.",
				});
			}

			return res.render("job-role-list", {
				jobRoles: [],
			});
		}
	};

	getJobRoleDetailPage = async (req: Request, res: Response) => {
		const token = req.cookies?.authSession;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				req.params.id,
				token,
			);

			if (!jobRole) {
				return res.status(404).render("job-role-detail", {
					jobRole: null,
					isApplicant: res.locals.isApplicant,
					message: "Job role not found.",
					isAdmin: res.locals.isAdmin,
				});
			}

			console.log(
				!res.locals.user?.isAdmin &&
					jobRole.status === "OPEN" &&
					jobRole.numberOfOpenPositions > 0,
			);
			console.log(!res.locals.user?.isAdmin);
			console.log(jobRole.status === "OPEN");
			console.log(jobRole.numberOfOpenPositions > 0);

			return res.render("job-role-detail", {
				jobRole,
				canApply:
					!res.locals.user?.isAdmin &&
					jobRole.status === "OPEN" &&
					jobRole.numberOfOpenPositions > 0,
			});
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res.status(403).render("error", {
					statusCode: 403,
					message: "You do not have permission to access this resource.",
				});
			}

			return res.status(502).render("job-role-detail", {
				jobRole: null,
				isApplicant: res.locals.isApplicant,
				message: "Could not load this job role right now.",
				isAdmin: res.locals.isAdmin,
			});
		}
	};
}
