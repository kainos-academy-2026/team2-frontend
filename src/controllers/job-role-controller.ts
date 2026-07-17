import axios from "axios";
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
		const deletedMessage =
			req.query.deleted === "1" ? "Job role deleted successfully." : undefined;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			const jobRoles = await this.jobRoleService.getJobRoles(token);

			return res.render("job-role-list", {
				jobRoles,
				deletedMessage,
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
				deletedMessage,
			});
		}
	};

	postDeleteJobRole = async (req: Request, res: Response) => {
		const token = req.cookies?.authSession;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			await this.jobRoleService.deleteJobRole(req.params.id, token);

			return res.redirect("/job-roles?deleted=1");
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res.status(403).render("error", {
					statusCode: 403,
					message: "You do not have permission to access this resource.",
				});
			}

			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					res.clearCookie("authSession");
					return res.redirect("/login");
				}

				if (error.response?.status === 404) {
					return res.status(404).render("error", {
						statusCode: 404,
						message: "Job role not found.",
					});
				}
			}

			return res.status(502).render("error", {
				statusCode: 502,
				message: "Could not delete this job role right now. Please try again.",
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
