import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller";
import JobRoleMapper from "../mappers/job-role-mapper";
import { JobRoleService } from "../services/job-role-service";

const router = Router();

const jobRoleMapper = new JobRoleMapper();
const jobRoleService = new JobRoleService(jobRoleMapper);
const jobRoleController = new JobRoleController(jobRoleService);

router.get("/job-roles", jobRoleController.getJobRolesPage);
router.get("/job-roles/:id", jobRoleController.getJobRoleDetailPage);

export default router;
