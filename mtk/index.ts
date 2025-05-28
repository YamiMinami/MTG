import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Card } from "./interfaces";
import { MongoClient, ObjectId } from "mongodb";
import { connect, initAssets, loadAssets, deckCollection, getDeckCollection } from "./database";
import session from "./session";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import { homeRouter } from "./routers/homeRouter";
import { loginRouter } from "./routers/loginRouter";
import { deckRouter } from "./deckbuilder";
import { collectionRouter } from "./collection";
import methodOverride from "method-override";

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
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

app.use("/", loginRouter());
app.use("/", secureMiddleware, homeRouter());
app.use("/", secureMiddleware, deckRouter());
app.use("/", secureMiddleware, collectionRouter());
let cards: Card[] = [];
async function MTGApp() {
  await connect();
  await initAssets();
  cards = await loadAssets();

  app.get("/detail", (req, res) => {
    res.render("detail");
  });

  app.get("/home", (req, res) => {
    res.render("home");
  });

  // index.ts, ná connect()/initAssets()/loadAssets()

// Kans berekenen
app.post("/drawcard/probability", async (req, res) => {
  const { deckName, cardName } = req.body;
  const user = req.session.user;
  if (!user?._id) return res.status(401).json({ error: "Unauthorized" });

  // 1) Haal deck op
  const deck = await deckCollection.findOne({
    userId: new ObjectId(user._id),
    name: deckName
  });
  if (!deck) return res.status(404).json({ error: "Deck not found" });

  // 2) Laden van alle kaart‐metadata
  const allCards = await loadAssets();

  // 3) Filter op kaartnaam
  const matchCount = deck.cards.filter(id => {
    const cardObj = allCards.find(c => c.id === id);
    return cardObj?.name.toLowerCase() === cardName.toLowerCase();
  }).length;

  const total = deck.cards.length;
  const probability = total > 0 ? (matchCount / total) * 100 : 0;

  res.json({
    probability: probability.toFixed(2),
    total,
    matchCount
  });
});

// Willekeurige kaart trekken
app.post("/drawcard/random", async (req, res) => {
  const { deckName } = req.body;
  const user = req.session.user;
  if (!user?._id) return res.status(401).json({ error: "Unauthorized" });

  // 1) Haal deck op
  const deck = await deckCollection.findOne({
    userId: new ObjectId(user._id),
    name: deckName
  });
  if (!deck) return res.status(404).json({ error: "Deck not found" });

  // 2) Init session.drawnCards voor dit deck
  if (!req.session.drawnCards) req.session.drawnCards = {};
  if (!req.session.drawnCards[deckName]) req.session.drawnCards[deckName] = [];

  // 3) Bereken welke nog over zijn
  const remaining = deck.cards.filter(
    id => !req.session.drawnCards![deckName].includes(id)
  );

  if (remaining.length === 0) {
    return res.json({ error: "Geen kaarten meer over in dit deck." });
  }

  // 4) Kies er één uit de remaining
  const randId = remaining[Math.floor(Math.random() * remaining.length)];
  req.session.drawnCards[deckName].push(randId);

  // 5) Laad metadata en stuur image terug
  const allCards = await loadAssets();
  const cardObj = allCards.find(c => c.id === randId)!;
  res.json({ image: cardObj.image_uris?.png ?? "/assets/card1.jpg" });
});


// Pas daarna pas de GET /drawcard
app.get("/drawcard", secureMiddleware, async (req, res) => {
  const user = req.session.user!;
  const decks = await getDeckCollection()
    .find({ userId: new ObjectId(user._id) })
    .toArray();
  res.render("drawcard", {
    decks,
    pageScript: "drawcard.js"
  });
});

app.post("/drawcard/reset", (req, res) => {
  const { deckName } = req.body;
  if (req.session.drawnCards) {
    delete req.session.drawnCards[deckName];
  }
  res.json({ ok: true });
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

  app.get("/detail/:id", secureMiddleware, async (req, res) => {
    const cardId = req.params.id;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return res.status(404).send("Card not found");

    const userId = req.session.user!._id;
    const decks = await deckCollection.find({ userId }).toArray();

    res.render("detail", {
      card,
      decks,
      message: req.session.message,
    });
    delete req.session.message;
  });

  app.get("/first-time-user", (req, res) => {
    res.render("first-time-user");
  });
}

app.listen(app.get("port"), async () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});

MTGApp().catch((err) => {
  console.error("Er is iets misgelopen:", err);
  process.exit(1);
});
