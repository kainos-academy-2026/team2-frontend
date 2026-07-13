import { Router } from "express";
import { LoginController } from "../controllers/login-controller";
import { redirectAuthenticatedUser } from "../middleware/auth-session";
import { DefaultAuthService } from "../services/default-auth-service";
import { MockAuthService } from "../services/mock-auth-service";
import type { AuthService } from "../types/auth";

const router = Router();
const isMockedAuthenticationEnabled =
	process.env.MOCKED_AUTHENTICATION === "true";
const loginApiUrl =
	process.env.AUTH_LOGIN_API_URL?.trim() || "http://localhost:3001/login";

export const authService: AuthService = isMockedAuthenticationEnabled
	? new MockAuthService()
	: new DefaultAuthService({ loginApiUrl });

const authController = new LoginController(authService);

router.get("/login", redirectAuthenticatedUser, authController.getLoginPage);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

export default router;
