import { Router } from "express";
import { LoginController } from "../controllers/login-controller";
import { redirectAuthenticatedUser } from "../middleware/auth-session";
import { DefaultAuthService, MockAuthService } from "../services/auth-service";
import type { AuthService } from "../types/auth";

const router = Router();
const isMockedAuthenticationEnabled =
	process.env.MOCKED_AUTHENTICATION === "true";

export const authService: AuthService = isMockedAuthenticationEnabled
	? new MockAuthService()
	: new DefaultAuthService();

export const authController = new LoginController({ authService });

router.get("/login", redirectAuthenticatedUser, authController.getLoginPage);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

export default router;
