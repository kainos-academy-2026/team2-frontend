import { Router } from "express";
import {
	getRegisterPage,
	postRegister,
} from "../controllers/registration-controller";

const registrationRoutes = Router();

registrationRoutes.get("/register", getRegisterPage);
registrationRoutes.post("/register", postRegister);

export default registrationRoutes;
