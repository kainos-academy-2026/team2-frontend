import { Router } from "express";
import RegistrationController from "../controllers/registration-controller";
import { registrationSchema } from "../dto/registrationDto";
import { validateBody } from "../middleware/validationMiddleware";
import { RegistrationService } from "../services/registration-service";

const registrationService = new RegistrationService();
const registrationController = new RegistrationController(registrationService);

const registrationRoutes = Router();

registrationRoutes.get("/register", registrationController.getRegisterPage);
registrationRoutes.post(
	"/register",
	validateBody(registrationSchema),
	registrationController.postRegister,
);

export default registrationRoutes;
