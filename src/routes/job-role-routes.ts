import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";
import { requireAuthenticatedUser } from "../middleware/auth-session";
import { jobRoleService } from "../services/job-role-service";

const jobRoleController = new JobRoleController(jobRoleService);

const jobRoleRoutes = Router();

jobRoleRoutes.get(
	"/job-roles",
	requireAuthenticatedUser,
	jobRoleController.getJobRolesPage,
);

export default jobRoleRoutes;
