import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";
import { JobRoleMapper } from "../mappers/job-role-mapper";
import { requireAuthenticatedUser } from "../middleware/auth-session";
import { JobRoleService } from "../services/job-role-service";

const jobRoleMapper = new JobRoleMapper();
const jobRoleService = new JobRoleService(jobRoleMapper);
const jobRoleController = new JobRoleController(jobRoleService);

const jobRoleRoutes = Router();

jobRoleRoutes.get(
	"/job-roles",
	requireAuthenticatedUser,
	jobRoleController.getJobRolesPage,
);

export default jobRoleRoutes;
