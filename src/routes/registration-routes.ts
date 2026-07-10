import { Router } from "express";
import { validateBody } from "../middleware/validationMiddleware";
import { registrationSchema } from "../dto/registrationDto";
import RegistrationController from "../controllers/registration-controller";

const registrationController = new RegistrationController();

const registrationRoutes = Router();

registrationRoutes.get("/register", registrationController.getRegisterPage);
registrationRoutes.post("/register", validateBody(registrationSchema), registrationController.postRegister);

export default registrationRoutes;
