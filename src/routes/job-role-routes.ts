import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";
import { createJobRoleSchema } from "../dto/job-role-createDto";
import { JobRoleCreateMapper } from "../mappers/job-role-create-mapper";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import requireRole from "../middleware/auth-session";
import { validateBody } from "../middleware/validationMiddleware";
import { JobRoleService } from "../services/job-role-service";
import { Role } from "../types/role";

const jobRoleMapper = new JobRoleMapper();
const jobRoleCreateMapper = new JobRoleCreateMapper();
const jobRoleService = new JobRoleService(jobRoleMapper);
const jobRoleController = new JobRoleController(
	jobRoleService,
	jobRoleCreateMapper,
);

const jobRoleRoutes = Router();

jobRoleRoutes.get(
	"/job-roles",
	requireRole([Role.Admin, Role.User]),
	jobRoleController.getJobRolesPage,
);
jobRoleRoutes.get(
	"/job-roles/add",
	requireRole([Role.Admin]),
	jobRoleController.getAddJobRolePage,
);
jobRoleRoutes.post(
	"/job-roles/add",
	requireRole([Role.Admin]),
	validateBody(createJobRoleSchema),
	jobRoleController.postAddJobRole,
);
jobRoleRoutes.get(
	"/job-roles/:id",
	requireRole([Role.Admin, Role.User]),
	jobRoleController.getJobRoleDetailPage,
);
jobRoleRoutes.post(
	"/job-roles/:id/delete",
	requireRole([Role.Admin]),
	jobRoleController.postDeleteJobRole,
);

export default jobRoleRoutes;
