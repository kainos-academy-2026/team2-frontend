import type { Request, Response } from "express";
import { z } from "zod";
import type { ApplicationService } from "../services/application-service";
import type { JobRoleService } from "../services/job-role-service";

const uploadUrlRequestSchema = z.object({
	fileName: z.string().min(1),
	contentType: z.string().min(1),
});

export class ApplicationController {
	constructor(
		private readonly applicationService: ApplicationService,
		private readonly jobRoleService: JobRoleService,
	) {}

	getApplyPage = async (req: Request, res: Response) => {
		const token = res.locals.authToken!;

		const { id } = req.params;

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(id, token);

			if (!jobRole) {
				return res.status(404).render("error", {
					statusCode: 404,
					message:
						"The job role you are trying to apply for could not be found.",
				});
			}

			return res.render("apply", { jobRole });
		} catch {
			return res.status(502).render("error", {
				statusCode: 502,
				message:
					"Could not load the application page right now. Please try again later.",
			});
		}
	};

	getUploadUrl = async (req: Request, res: Response) => {
		const user = res.locals.user;

		if (!user) {
			return res.status(403).json({ error: "Forbidden." });
		}

		const { id } = req.params;
		const parsedRequest = uploadUrlRequestSchema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			return res
				.status(400)
				.json({ error: "fileName and contentType are required." });
		}

		const { fileName, contentType } = parsedRequest.data;

		try {
			const uploadUrlResponse = await this.applicationService.getUploadUrl(id, {
				userId: user.id,
				fileName,
				contentType,
			});

			return res.json(uploadUrlResponse);
		} catch {
			return res
				.status(502)
				.json({ error: "Could not generate an upload URL. Please try again." });
		}
	};

	postApply = async (req: Request, res: Response) => {
		const user = res.locals.user!;
		const token = res.locals.authToken!;

		const { id } = req.params;
		const { cvKey } = req.body as { cvKey?: string };

		if (!cvKey || cvKey.trim().length === 0) {
			try {
				const jobRole = await this.jobRoleService.getJobRoleById(id, token);
				return res.status(400).render("apply", {
					jobRole,
					error: "Please upload your CV before submitting.",
				});
			} catch {
				return res.status(400).render("apply", {
					jobRole: null,
					error: "Please upload your CV before submitting.",
				});
			}
		}

		try {
			await this.applicationService.createApplication(id, {
				userId: user.id,
				cvKey: cvKey.trim(),
			});

			return res.redirect(`/job-roles/${id}/apply/confirmation`);
		} catch {
			try {
				const jobRole = await this.jobRoleService.getJobRoleById(id, token);
				return res.status(502).render("apply", {
					jobRole,
					error: "Your application could not be submitted. Please try again.",
				});
			} catch {
				return res.status(502).render("apply", {
					jobRole: null,
					error: "Your application could not be submitted. Please try again.",
				});
			}
		}
	};

	getConfirmationPage = async (req: Request, res: Response) => {
		const { id } = req.params;
		const token = res.locals.authToken!;

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(id, token);

			return res.render("apply-confirmation", { jobRole });
		} catch {
			return res.render("apply-confirmation", { jobRole: null });
		}
	};
}
