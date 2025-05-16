import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Card } from "./interfaces";
import { MongoClient } from "mongodb";
import { connect } from "./database";


const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let cards: Card[] = [];

(async function () {
    try {
        const response = await fetch('https://raw.githubusercontent.com/s117507/WebOntwikkeling_Project/main/250Cards.json');
        cards = await response.json(); 
        console.log(cards[0].name); 
    } catch (error: any) {
        console.log("Error fetching cards:", error);
    }
})();

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
  const manaFilter = req.query.mana as string;
  const validColors = ['W', 'U', 'B', 'R', 'G'];

  let filteredCards = cards;

  if (manaFilter && manaFilter !== "None") {
    const manaLetter = manaFilter[0].toUpperCase();
    if (validColors.includes(manaLetter)) {
      filteredCards = cards.filter(card =>
        card.color_identity?.includes(manaLetter)
      );
    }
  }

  const totalPages = Math.ceil(filteredCards.length / perPage);
  const pageCards = filteredCards.slice((page - 1) * perPage, page * perPage);

  res.render("collection", {
    cards: pageCards,
    currentPage: page,
    totalPages,
    manaFilter
  });
});

app.get("/first-time-user", (req, res) => {
    res.render("first-time-user");
});

app.listen(app.get("port"), async() => {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
});