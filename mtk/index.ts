import express, { Express } from "express";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import { Card } from "./interfaces";
import { connect, initAssets, loadAssets } from "./database";
import session from "./session";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import { homeRouter } from "./routers/homeRouter";
import { loginRouter } from "./routers/loginRouter";
import { deckCollection } from "./database";
import { deckRouter } from "./deckbuilder";

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

// Routers
app.use("/", loginRouter());

app.use("/", deckRouter());

// Test route
app.get("/test", (req, res) => {
  console.log("✅ Test route aangeroepen");
  res.send("Test werkt");
});

let cards: Card[] = [];

// Belangrijke routes
app.get("/", (req, res) => {
  console.log("GET / aangeroepen");
  res.send("Homepage werkt");
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
  const validColors = ["W", "U", "B", "R", "G"];

  let filteredCards = cards;

  if (manaFilter && manaFilter !== "None") {
    const manaLetter = manaFilter[0].toUpperCase();
    if (validColors.includes(manaLetter)) {
      filteredCards = cards.filter((card) =>
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
    manaFilter,
  });
});

app.get("/detail/:id", (req, res) => {
  const cardId = req.params.id;
  const card = cards.find((c) => c.id === cardId);

  if (!card) {
    return res.status(404).send("Card not found");
  }

  res.render("detail", { card });
});

app.get("/first-time-user", (req, res) => {
  res.render("first-time-user");
});

// Voeg nieuw deck toe
app.post("/decks", secureMiddleware, async (req, res) => {
  const { name, colors } = req.body;
  const user = req.session.user!;

  if (cards.length > 20) {
    req.session.message = { type: "error", message: "Maximaal 20 kaarten per deck" };
    return res.redirect("/deckbuilder");
  }

  await deckCollection.insertOne({
    name,
    colors,
    cards: [],
    userId: user._id!,
    createdAt: new Date()
  });

  res.redirect("/deckbuilder");
});

// Genereer random deck
app.post("/decks/random", secureMiddleware, async (req, res) => {
  const user = req.session.user!;
  const allCards = await loadAssets();
  const randomCards = allCards.sort(() => 0.5 - Math.random()).slice(0, 20);

  await deckCollection.insertOne({
    name: "Random Deck",
    colors: ["None"],
    cards: randomCards.map(c => c.id!),
    userId: user._id!,
    createdAt: new Date()
  });

  res.redirect("/deckbuilder");
});

// Fallbacks en foutafhandeling
app.use((req, res) => {
  console.log("⚠️ 404 route: " + req.originalUrl);
  res.status(404).send("Pagina niet gevonden");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Fout opgevangen:", err.message);
  res.status(500).send("Interne serverfout");
});
app.use("/", secureMiddleware, homeRouter());
// App starten
async function MTGApp() {
  await connect();
  await initAssets();
  cards = await loadAssets();
}

MTGApp().then(() => {
  app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
  });
}).catch((err) => {
  console.error("Er is iets misgelopen:", err);
  process.exit(1);
});
