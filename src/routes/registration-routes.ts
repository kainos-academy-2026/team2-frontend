import { Router } from "express";
import RegistrationController from "../controllers/registration-controller";
import { registrationSchema } from "../dto/registrationDto";
import { validateBody } from "../middleware/validationMiddleware";

const registrationController = new RegistrationController();

const registrationRoutes = Router();

registrationRoutes.get("/register", registrationController.getRegisterPage);
registrationRoutes.post(
	"/register",
	validateBody(registrationSchema),
	registrationController.postRegister,
);

export default registrationRoutes;
