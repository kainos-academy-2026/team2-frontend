import type { Request, Response } from "express";
import {
	getAuthSessionState,
	getTokenFromRequest,
} from "../middleware/auth-session";
import {
	ForbiddenError,
	type JobRoleService,
} from "../services/job-role-service";

const FORBIDDEN_MESSAGE = "You do not have permission to access this resource.";

const resolveToken = (req: Request, res: Response): string | null => {
	const token = getTokenFromRequest(req);
	if (!token) {
		res.redirect("/login");
		return null;
	}
	return token;
};

export class JobRoleController {
	private readonly jobRoleService: JobRoleService;

	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	getJobRolesPage = async (req: Request, res: Response) => {
		const token = resolveToken(req, res);
		if (!token) return;

		const { role } = getAuthSessionState(req);
		const isAdmin = role === "admin";
		const forbidden = req.query.forbidden === "1";

		try {
			const jobRoles = await this.jobRoleService.getJobRoles(token);

			res.render("job-role-list", {
				jobRoles,
				isAdmin,
				forbidden,
			});
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res
					.status(403)
					.render("error", { statusCode: 403, message: FORBIDDEN_MESSAGE });
			}

			res.render("job-role-list", {
				jobRoles: [],
				isAdmin,
				forbidden,
			});
		}
	};

	getJobRoleDetailPage = async (req: Request, res: Response) => {
		const token = resolveToken(req, res);
		if (!token) return;
		const { role } = getAuthSessionState(req);
		const isAdmin = role === "admin";

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				req.params.id,
				token,
			);

			if (!jobRole) {
				res.status(404).render("job-role-detail", {
					jobRole: null,
					message: "Job role not found.",
					isAdmin,
				});
				return;
			}

			res.render("job-role-detail", {
				jobRole,
				message: "",
				isAdmin,
			});
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res
					.status(403)
					.render("error", { statusCode: 403, message: FORBIDDEN_MESSAGE });
			}

			res.status(502).render("job-role-detail", {
				jobRole: null,
				message: "Could not load this job role right now.",
				isAdmin,
			});
		}
	};
}
