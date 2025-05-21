import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Card } from "./interfaces";
import { MongoClient } from "mongodb";
import { connect, initAssets, loadAssets } from "./database";
import session from "./session";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import { homeRouter } from "./routers/homeRouter";
import { loginRouter } from "./routers/loginRouter";
dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.use(flashMiddleware);
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);
app.use("/", loginRouter());
app.use("/", secureMiddleware, homeRouter());
let cards: Card[] = [];

async function MTGApp() {
    await connect();       
    await initAssets();    
    cards = await loadAssets(); 

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
    const perPage = 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(cards.length / perPage);
    const pageCards = cards.slice((page - 1) * perPage, page * perPage);
  
    res.render("collection", {
      cards: pageCards,
      currentPage: page,
      totalPages,
    });
  });

app.get("/first-time-user", (req, res) => {
    res.render("first-time-user");
});
};

app.listen(app.get("port"), async() => {
    console.log("Server started on http://localhost:" + app.get("port"));
});

MTGApp().catch(err => {
    console.error("Er is iets misgelopen:", err);
    process.exit(1);
  });
