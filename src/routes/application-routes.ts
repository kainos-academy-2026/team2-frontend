import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import { requireAuthenticatedUser } from "../middleware/auth-session";
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
	requireAuthenticatedUser,
	applicationController.getConfirmationPage,
);

applicationRoutes.get(
	"/job-roles/:id/apply",
	requireAuthenticatedUser,
	applicationController.getApplyPage,
);

applicationRoutes.post(
	"/job-roles/:id/apply/upload-url",
	requireAuthenticatedUser,
	applicationController.getUploadUrl,
);

applicationRoutes.post(
	"/job-roles/:id/apply",
	requireAuthenticatedUser,
	applicationController.postApply,
);

export default applicationRoutes;
