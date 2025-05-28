import express, { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { deckCollection, loadAssets } from "./database";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { Deck, Card } from "./interfaces";

// Map full color names to short codes
const colorMap: Record<string, string> = {
  White: "W",
  Blue: "U",
  Black: "B",
  Red: "R",
  Green: "G",
};

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

// Centralized error handler
function handleError(res: Response, error: unknown, message: string) {
  console.error(message, error);
  if (res.headersSent) return;
  const msg = error instanceof Error ? error.message : "Onbekende fout";
  res.status(500).json({ success: false, message: msg });
}

export function deckRouter(): Router {
  const router = express.Router();

  // LIST & FILTER decks, hydrate with card objects
  router.get(
    "/deckbuilder",
    secureMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.session.user!;
        const rawColor = (req.query.color as string) || "None";
        const searchTerm = (req.query.search as string) || "";
        const page = Math.max(
          1,
          parseInt((req.query.page as string) || "1", 10)
        );
        const limit = 5;

        // Build query for decks
        const query: any = { userId: user._id };
        if (rawColor !== "None" && colorMap[rawColor]) {
          query.colors = colorMap[rawColor];
        }
        if (searchTerm) {
          query.name = { $regex: searchTerm, $options: "i" };
        }

        // Load decks
        const total = await deckCollection.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const decks = await deckCollection
          .find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        // Hydrate cards for each deck
        const allCards = await loadAssets(); // load all Card[]
        const decksWithObjects = decks.map((deck) => ({
          ...deck,
          cardObjects: deck.cards
            .map((id) => allCards.find((c) => c.id === id))
            .filter((c): c is Card => Boolean(c)),
        }));

        // Render
        res.render("deckbuilder", {
          decks: decksWithObjects,
          currentPage: page,
          totalPages,
          currentFilter: rawColor,
          searchQuery: searchTerm,
          cards: allCards,
        });
      } catch (err) {
        handleError(res, err, "Kan decks niet laden");
      }
    }
  );

  // CREATE new deck
  router.post("/deck", secureMiddleware, async (req, res) => {
    try {
      const user = req.session.user!;
      const { name, colors } = req.body;
      if (!name || name.length < 3)
        throw new Error("Decknaam moet minstens 3 karakters zijn");
      const newDeck: Deck = {
        name,
        colors: Array.isArray(colors) ? colors : [colors],
        cards: [],
        userId: user._id!,
        createdAt: new Date(),
      };
      await deckCollection.insertOne(newDeck);
      req.session.message = { type: "success", message: "Deck aangemaakt!" };
      res.redirect("/deckbuilder");
    } catch (err) {
      handleError(res, err, "Aanmaken mislukt");
    }
  });

  // RANDOM deck
  router.post("/deck/random", secureMiddleware, async (req, res) => {
    try {
      const user = req.session.user!;
      const allCards = await loadAssets();
      if (allCards.length < 60)
        throw new Error("Niet genoeg kaarten beschikbaar");
      const randomIds = shuffle(allCards)
        .slice(0, 60)
        .map((c) => c.id!);
      const newDeck: Deck = {
        name: `Random Deck ${new Date().toLocaleDateString()}`,
        colors: ["None"],
        cards: randomIds,
        userId: user._id!,
        createdAt: new Date(),
      };
      await deckCollection.insertOne(newDeck);
      req.session.message = {
        type: "success",
        message: "Random deck gegenereerd!",
      };
      res.redirect("/deckbuilder");
    } catch (err) {
      handleError(res, err, "Genereren mislukt");
    }
  });

  // DELETE deck
  router.delete("/deck/:id", secureMiddleware, async (req, res) => {
    try {
      const result = await deckCollection.deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.session.user!._id,
      });
      req.session.message = {
        type: result.deletedCount ? "success" : "error",
        message: result.deletedCount
          ? "Deck verwijderd!"
          : "Deck niet gevonden",
      };
      res.redirect("/deckbuilder");
    } catch (err) {
      req.session.message = { type: "error", message: "Serverfout" };
      res.redirect("/deckbuilder");
    }
  });

  // EDIT deck form
  router.get("/deck/:id/edit", secureMiddleware, async (req, res) => {
    try {
      const deck = await deckCollection.findOne({
        _id: new ObjectId(req.params.id),
        userId: req.session.user!._id,
      });
      if (!deck) {
        req.session.message = { type: "error", message: "Deck niet gevonden" };
        return res.redirect("/deckbuilder");
      }
      res.render("edit-deck", { deck, message: req.session.message });
      delete req.session.message;
    } catch (err) {
      req.session.message = { type: "error", message: "Serverfout" };
      res.redirect("/deckbuilder");
    }
  });

  // UPDATE deck metadata (name/colors)
  router.put("/deck/:id", secureMiddleware, async (req, res) => {
    try {
      const { name, colors } = req.body;
      const cols = Array.isArray(colors)
        ? colors.filter(Boolean)
        : [colors].filter(Boolean);
      const result = await deckCollection.updateOne(
        { _id: new ObjectId(req.params.id), userId: req.session.user!._id },
        { $set: { name, colors: cols } }
      );
      req.session.message = {
        type: result.matchedCount ? "success" : "error",
        message: result.matchedCount
          ? "Deck bijgewerkt!"
          : "Deck niet gevonden",
      };
      res.redirect("/deckbuilder");
    } catch (err) {
      console.error("Bewerkingsfout:", err);
      req.session.message = { type: "error", message: "Bewerken mislukt" };
      res.redirect("/deckbuilder");
    }
  });

  // TOGGLE card in deck via detail-page
  router.post("/deck/:id/cards/:cardId", secureMiddleware, async (req, res) => {
    try {
      const userId = req.session.user!._id;
      const deckId = new ObjectId(req.params.id);
      const cardId = req.params.cardId;
      const deck = await deckCollection.findOne({ _id: deckId, userId });
      if (!deck) throw new Error("Deck niet gevonden");
      const has = deck.cards.includes(cardId);
      const op = has
        ? { $pull: { cards: cardId } }
        : { $push: { cards: cardId } };
      await deckCollection.updateOne({ _id: deckId, userId }, op);
      req.session.message = {
        type: "success",
        message: has ? "Kaart verwijderd" : "Kaart toegevoegd",
      };
      res.redirect(`/detail/${cardId}`);
    } catch (err) {
      console.error(err);
      req.session.message = {
        type: "error",
        message: "Kon kaart niet togglen",
      };
      res.redirect("back");
    }
  });

  return router;
}
