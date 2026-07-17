import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller";
import { JobRoleCreateMapper } from "../mappers/job-role-create-mapper";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import requireRole from "../middleware/auth-session";
import { ApplicationService } from "../services/application-service";
import { JobRoleService } from "../services/job-role-service";
import { Role } from "../types/role";

const jobRoleMapper = new JobRoleMapper();
const jobRoleCreateMapper = new JobRoleCreateMapper();
const jobRoleService = new JobRoleService(jobRoleMapper, jobRoleCreateMapper);
const applicationService = new ApplicationService();
const applicationController = new ApplicationController(
	applicationService,
	jobRoleService,
);

const applicationRoutes = Router();

applicationRoutes.get(
	"/job-roles/:id/apply/confirmation",
	requireRole([Role.User]),
	applicationController.getConfirmationPage,
);

applicationRoutes.get(
	"/job-roles/:id/apply",
	requireRole([Role.User]),
	applicationController.getApplyPage,
);

applicationRoutes.post(
	"/job-roles/:id/apply/upload-url",
	requireRole([Role.User]),
	applicationController.getUploadUrl,
);

applicationRoutes.post(
	"/job-roles/:id/apply",
	requireRole([Role.User]),
	applicationController.postApply,
);

export default applicationRoutes;
