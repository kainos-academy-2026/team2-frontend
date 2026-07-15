import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import { requireRole } from "../middleware/auth-session";
import { ApplicationService } from "../services/application-service";
import { JobRoleService } from "../services/job-role-service";

const jobRoleMapper = new JobRoleMapper();
const jobRoleService = new JobRoleService(jobRoleMapper);
const applicationService = new ApplicationService();
const applicationController = new ApplicationController(
	applicationService,
	jobRoleService,
);

const applicationRoutes = Router();

applicationRoutes.get(
	"/job-roles/:id/apply/confirmation",
	requireRole(["user"]),
	applicationController.getConfirmationPage,
);

applicationRoutes.get(
	"/job-roles/:id/apply",
	requireRole(["user"]),
	applicationController.getApplyPage,
);

applicationRoutes.post(
	"/job-roles/:id/apply/upload-url",
	requireRole(["user"], {
		onForbidden: (_req, res) => res.status(403).json({ error: "Forbidden." }),
	}),
	applicationController.getUploadUrl,
);

applicationRoutes.post(
	"/job-roles/:id/apply",
	requireRole(["user"]),
	applicationController.postApply,
);

export default applicationRoutes;
