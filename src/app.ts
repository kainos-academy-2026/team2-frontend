import path, { dirname } from "node:path";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import { JobRoleController } from "./controllers/job-role-controller";
import { requireAuthenticatedUser } from "./middleware/auth-session";
import authRouter from "./routes/auth-router";
import { JobRoleService } from "./services/job-role-service";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const publicPath = path.join(dirname(__filename), "public");
app.use(express.static(publicPath));

const viewsPath = path.join(dirname(__filename), "views");

const renderErrorPage = (
	res: Response,
	statusCode: number,
	message: string,
) => {
	return res.status(statusCode).render("error", {
		statusCode,
		message,
	});
};

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});
app.set("view engine", "njk");

const jobRoleService = new JobRoleService(
	process.env.JOB_ROLES_API_URL || "http://localhost:3001/job-roles",
);
const jobRoleController = new JobRoleController(jobRoleService);

app.get("/", (_req, res) => {
	res.redirect("/login");
});

app.get(
	"/job-roles",
	requireAuthenticatedUser,
	jobRoleController.getJobRolesPage,
);

app.use(authRouter);

app.get("/health", (_req, res) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

app.use((_req: Request, res: Response) => {
	return renderErrorPage(
		res,
		404,
		"The page you requested could not be found.",
	);
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.error("Unhandled application error", {
		error: error instanceof Error ? error.message : "Unknown error",
	});

	if (res.headersSent) {
		return;
	}

	return renderErrorPage(
		res,
		500,
		"Something went wrong. Please try again later.",
	);
});

export default app;
