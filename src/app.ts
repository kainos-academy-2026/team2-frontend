import path, { dirname } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import { JobRoleController } from "./controllers/job-role-controller";
import { JobRoleService } from "./services/job-role-service";
import jobRoleRouter from "./routes/jobRoleRouter";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/styles.css", (_req, res) => {
	res.sendFile(path.join(dirname(__filename), "styles.css"));
});

const viewsPath = path.join(dirname(__filename), "views");

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});
app.set("view engine", "njk");

app.get("/", (_req, res) => {
	res.render("index");
});

app.use(jobRoleRouter);

app.get("/health", (_req, res) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
