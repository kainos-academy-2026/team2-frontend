import path, { dirname } from "node:path";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import authRouter from "./routes/auth-router";
import jobRoleRouter from "./routes/jobRoleRouter";
import registrationRoutes from "./routes/registration-routes";
import { JobRoleService } from "./services/job-role-service";

const app = express();
const distPublicPath = path.join(dirname(__filename), "public");
const rootPublicPath = path.join(dirname(__filename), "..", "public");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(distPublicPath));
app.use("/public", express.static(rootPublicPath));

app.get("/styles.css", (_req, res) => {
	res.sendFile(path.join(dirname(__filename), "styles.css"));
});

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

app.get("/", (_req, res) => {
	res.redirect("/login");
});

app.use(jobRoleRouter);

app.use(registrationRoutes);
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
