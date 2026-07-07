import path, { dirname } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import { getJobRolesPage } from "./controllers/job-role-controller";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const viewsPath = path.join(dirname(__filename), "views");

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});
app.set("view engine", "njk");

app.get("/", (_req, res) => {
	res.render("index");
});

app.get("/job-roles", getJobRolesPage);

app.get("/health", (_req, res) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
