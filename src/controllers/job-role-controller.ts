import type { Request, Response } from "express";
import { getJobRoleById, getJobRoles } from "../services/job-role-service";

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

export const getJobRoleDetailPage = async (req: Request, res: Response) => {
	try {
		const jobRole = await getJobRoleById(req.params.id);

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
