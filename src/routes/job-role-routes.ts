import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";

const jobRoleController = new JobRoleController();

const jobRoleRoutes = Router();

jobRoleRoutes.get("/job-roles", jobRoleController.getJobRolesPage);

export default jobRoleRoutes;
