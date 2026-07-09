import path, { dirname } from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import { getJobRolesPage } from "./controllers/job-role-controller";
import {
	getLoginPage,
	postLogin,
	postLogout,
} from "./controllers/login-controller";
import {
	redirectAuthenticatedUser,
	requireAuthenticatedUser,
} from "./middleware/auth-session";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const publicPath = path.join(dirname(__filename), "public");
app.use(express.static(publicPath));

const viewsPath = path.join(dirname(__filename), "views");

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});
app.set("view engine", "njk");

app.get("/", (_req, res) => {
	res.redirect("/login");
});

app.get("/job-roles", requireAuthenticatedUser, getJobRolesPage);

app.get("/login", redirectAuthenticatedUser, getLoginPage);
app.post("/login", postLogin);
app.post("/logout", postLogout);

app.get("/health", (_req, res) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
