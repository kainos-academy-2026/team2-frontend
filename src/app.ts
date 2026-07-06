import "dotenv/config";
import express from "express";
import nunjucks from "nunjucks";
import path from "path";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

export default app;