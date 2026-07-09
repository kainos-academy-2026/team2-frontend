import path, { dirname } from "node:path";
import path, { dirname } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import { getJobRolesPage } from "./controllers/job-role-controller";
import registrationRoutes from "./routes/registration-routes";

const app = express();
const publicPath = path.join(dirname(__filename), "..", "public");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(publicPath));

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

app.use(registrationRoutes);

app.get("/health", (_req, res) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
