

const router = new Router();

const isMockedAuthenticationEnabled = process.env.MOCKED_AUTHENTICATION === "true";

const authServive = isMockedAuthenticationEnabled ? new MockAuthService() : new DefaultAuthService();
const authController = new AuthController(authServive);