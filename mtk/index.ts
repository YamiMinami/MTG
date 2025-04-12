import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/detail", (req, res) => {
    res.render("detail");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/drawcard", (req, res) => {
    res.render("drawcard");
});

app.get("/deckbuilder", (req, res) => {
    res.render("deckbuilder");
});

app.get("/collection", (req, res) => {
    res.render("collection");
});

app.get("/first-time-user", (req, res) => {
    res.render("first-time-user");
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});
