import type { Request, Response } from "express";
import { JobRoleService } from "../services/job-role-service";

type JobRoleServiceContract = Pick<
	JobRoleService,
	"getJobRoles" | "getJobRoleById"
>;

export const createJobRoleController = (
	jobRoleService: JobRoleServiceContract,
) => {
	const getJobRolesPage = async (_req: Request, res: Response) => {
		try {
			const jobRoles = await jobRoleService.getJobRoles();

			res.render("job-role-list", {
				jobRoles,
			});
		} catch {
			res.render("job-role-list", {
				jobRoles: [],
			});
		}
	};

	const getJobRoleDetailPage = async (req: Request, res: Response) => {
		try {
			const jobRole = await jobRoleService.getJobRoleById(req.params.id);

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

	return {
		getJobRolesPage,
		getJobRoleDetailPage,
	};
};

const defaultJobRoleController = createJobRoleController(new JobRoleService());

export const getJobRolesPage = defaultJobRoleController.getJobRolesPage;
export const getJobRoleDetailPage = defaultJobRoleController.getJobRoleDetailPage;
