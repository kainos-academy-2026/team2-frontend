import express from "express";
import nunjucks from "nunjucks";
import path from "path";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

nunjucks.configure(path.join(process.cwd(), "src/views"), {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

app.get("/", (_req, res) => {
  res.render("index");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "UP",
    time: new Date().toISOString(),
  });
});

export default app;