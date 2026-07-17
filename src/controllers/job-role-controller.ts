import axios from "axios";
import type { Request, Response } from "express";
import { createJobRoleSchema } from "../dto/job-role-createDto";
import { ForbiddenError } from "../errors/forbidden-error";
import type { JobRoleCreateMapper } from "../mappers/job-role-create-mapper";
import type { JobRoleService } from "../services/job-role-service";
import type { CreateJobRoleFieldErrors } from "../types/job-role-create";

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
		private readonly jobRoleCreateMapper: JobRoleCreateMapper,
	) {}

	private async renderAddRolePage(
		res: Response,
		token: string,
		input?: Record<string, unknown>,
		errors?: CreateJobRoleFieldErrors,
	) {
		const [bands, capabilities] = await Promise.all([
			this.jobRoleService.getBands(token),
			this.jobRoleService.getCapabilities(token),
		]);

		return res.render("job-role-add", {
			bands,
			capabilities,
			values: this.jobRoleCreateMapper.toFormValues(input),
			errors,
		});
	}

	getJobRolesPage = async (req: Request, res: Response) => {
		const token = req.cookies?.authSession;
		const roleCreated = req.query.created === "1";
		const deletedMessage =
			req.query.deleted === "1" ? "Job role deleted successfully." : undefined;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			const jobRoles = await this.jobRoleService.getJobRoles(token);

			return res.render("job-role-list", {
				jobRoles,
				roleCreated,
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
				roleCreated,
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

	getAddJobRolePage = async (
		req: Request,
		res: Response,
		_next: (error: unknown) => void,
	) => {
		const token = req.cookies?.authSession;

		if (!token) {
			return res.redirect("/login");
		}

		try {
			return await this.renderAddRolePage(res, token);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				return res.status(403).render("error", {
					statusCode: 403,
					message: "You do not have permission to access this resource.",
				});
			}

			return res.status(502).render("error", {
				statusCode: 502,
				message:
					"Could not load the add role page right now. Please try again later.",
			});
		}
	};

	postAddJobRole = async (
		req: Request,
		res: Response,
		next: (error: unknown) => void,
	) => {
		const token = req.cookies?.authSession;

		if (!token) {
			return res.redirect("/login");
		}

		if (res.locals.errors) {
			try {
				return await this.renderAddRolePage(
					res,
					token,
					req.body as Record<string, unknown>,
					res.locals.errors as CreateJobRoleFieldErrors,
				);
			} catch (error) {
				if (error instanceof ForbiddenError) {
					return res.status(403).render("error", {
						statusCode: 403,
						message: "You do not have permission to access this resource.",
					});
				}

				return res.status(502).render("error", {
					statusCode: 502,
					message:
						"Could not load the add role page right now. Please try again later.",
				});
			}
		}

		const parsedRequest = createJobRoleSchema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			try {
				return await this.renderAddRolePage(
					res,
					token,
					req.body as Record<string, unknown>,
				);
			} catch (error) {
				if (error instanceof ForbiddenError) {
					return res.status(403).render("error", {
						statusCode: 403,
						message: "You do not have permission to access this resource.",
					});
				}

				return res.status(502).render("error", {
					statusCode: 502,
					message:
						"Could not load the add role page right now. Please try again later.",
				});
			}
		}

		const payload = this.jobRoleCreateMapper.toCreatePayload(
			parsedRequest.data,
		);

		try {
			await this.jobRoleService.createJobRole(token, payload);
			return res.redirect("/job-roles?created=1");
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 400) {
				const backendMessage =
					typeof error.response.data?.message === "string"
						? error.response.data.message
						: "Unable to create this role with the provided information.";

				return res.status(400).render("error", {
					statusCode: 400,
					message: backendMessage,
				});
			}

			return next(error);
		}
	};
}
