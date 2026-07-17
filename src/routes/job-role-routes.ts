import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import requireRole from "../middleware/auth-session";
import { JobRoleService } from "../services/job-role-service";
import { Role } from "../types/role";

const jobRoleMapper = new JobRoleMapper();
const jobRoleService = new JobRoleService(jobRoleMapper);
const jobRoleController = new JobRoleController(jobRoleService);

const jobRoleRoutes = Router();

jobRoleRoutes.get(
	"/job-roles",
	requireRole([Role.Admin, Role.User]),
	jobRoleController.getJobRolesPage,
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
