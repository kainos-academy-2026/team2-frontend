import { Router } from "express";
import { LoginController } from "../controllers/login-controller";
import { DefaultAuthService } from "../services/default-auth-service";
import { MockAuthService } from "../services/mock-auth-service";
import type { AuthService } from "../types/auth";

const router = Router();
const isMockedAuthenticationEnabled =
	process.env.MOCKED_AUTHENTICATION === "true";

export const authService: AuthService = isMockedAuthenticationEnabled
	? new MockAuthService()
	: new DefaultAuthService();

const authController = new LoginController(authService);

router.get("/login", authController.getLoginPage);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

export default router;
