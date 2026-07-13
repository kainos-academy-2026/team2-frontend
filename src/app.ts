import { existsSync } from "node:fs";
import path, { dirname } from "node:path";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import jobRoleRoutes from "./routes/job-role-routes";
import registrationRoutes from "./routes/registration-routes";

const app = express();
const distPublicPath = path.join(dirname(__filename), "public");
const sourcePublicPath = path.join(dirname(__filename), "..", "public");
const publicPath = existsSync(distPublicPath)
	? distPublicPath
	: sourcePublicPath;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(publicPath));

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

app.use(jobRoleRoutes);
app.use(registrationRoutes);

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
