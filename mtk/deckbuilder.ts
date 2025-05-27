import express, { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { deckCollection, loadAssets } from "./database";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { Card, Deck } from "./interfaces";

export function deckRouter(): Router {
    const router = express.Router();

    // Haal alle decks op met filters en paginering
    router.get("/deckbuilder", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const { color, search, page } = req.query;
            const currentPage = parseInt(page as string) || 1;
            const limit = 5;

            // Bouw query
            const query: any = { userId: user._id };
            if (color && color !== "None") query.colors = color;
            if (search) query.name = { $regex: search as string, $options: "i" };

            // Paginering
            const total = await deckCollection.countDocuments(query);
            const totalPages = Math.ceil(total / limit);
            const decks = await deckCollection.find(query)
                .skip((currentPage - 1) * limit)
                .limit(limit)
                .toArray();

            res.render("deckbuilder", {
                decks,
                currentPage,
                totalPages,
                currentFilter: color || "None",
                searchQuery: search || "",
                cards: await loadAssets()
            });
        } catch (error) {
            handleError(res, error, "Kan decks niet laden");
        }
    });

    // Maak nieuw deck aan
    router.post("/deck", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const { name, colors } = req.body;
            
            if (!name || name.length < 3) {
                throw new Error("Decknaam moet minstens 3 karakters zijn");
            }

            const newDeck: Deck = {
                name,
                colors: Array.isArray(colors) ? colors : [colors],
                cards: [],
                userId: user._id!,
                createdAt: new Date()
            };

            await deckCollection.insertOne(newDeck);
            req.session.message = { type: "success", message: "Deck aangemaakt!" };
            res.redirect("/deckbuilder");
        } catch (error) {
            handleError(res, error, "Aanmaken mislukt");
        }
    });

    // Genereer random deck
    router.post("/deck/random", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const allCards = await loadAssets();
            
            if (allCards.length < 60) {
                throw new Error("Niet genoeg kaarten beschikbaar");
            }

            const randomCards = shuffle(allCards)
                .slice(0, 60)
                .map(card => card.id!);

            const newDeck: Deck = {
                name: `Random Deck ${new Date().toLocaleDateString()}`,
                colors: ["None"],
                cards: randomCards,
                userId: user._id!,
                createdAt: new Date()
            };

            await deckCollection.insertOne(newDeck);
            req.session.message = { type: "success", message: "Random deck gegenereerd!" };
            res.redirect("/deckbuilder");
        } catch (error) {
            handleError(res, error, "Genereren mislukt");
        }
    });

    // Verwijder deck
    router.delete("/deck/:id", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const deckId = new ObjectId(req.params.id);
        const result = await deckCollection.deleteOne({ 
            _id: deckId,
            userId: req.session.user!._id 
        });

        if (result.deletedCount === 0) {
            req.session.message = { type: "error", message: "Deck niet gevonden" };
        } else {
            req.session.message = { type: "success", message: "Deck verwijderd!" };
        }
        
        res.redirect("/deckbuilder");
    } catch (error) {
        req.session.message = { type: "error", message: "Serverfout" };
        res.redirect("/deckbuilder");
    }
});

    // Bewerk deck

    router.get("/deck/:id/edit", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const deck = await deckCollection.findOne({ 
            _id: new ObjectId(req.params.id),
            userId: req.session.user!._id 
        });
        
        if (!deck) {
            req.session.message = { type: "error", message: "Deck niet gevonden" };
            return res.redirect("/deckbuilder");
        }
        
        res.render("edit-deck", { 
            deck,
            message: req.session.message 
        });
        delete req.session.message;
    } catch (error) {
        req.session.message = { type: "error", message: "Serverfout" };
        res.redirect("/deckbuilder");
    }
});
    router.put("/deck/:id", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const deckId = new ObjectId(req.params.id);
        const { name, colors } = req.body;

        // Conversie voor checkbox values
        const colorsArray = Array.isArray(colors) ? colors : [colors];

        const result = await deckCollection.updateOne(
            { 
                _id: deckId,
                userId: req.session.user!._id 
            },
            { 
                $set: { 
                    name,
                    colors: colorsArray.filter(c => c) // Verwijder lege values
                } 
            }
        );

        if (result.matchedCount === 0) {
            req.session.message = { type: "error", message: "Deck niet gevonden" };
        } else {
            req.session.message = { type: "success", message: "Deck bijgewerkt!" };
        }
        res.redirect("/deckbuilder");
    } catch (error) {
        console.error("Bewerkingsfout:", error);
        req.session.message = { type: "error", message: "Bewerken mislukt" };
        res.redirect("/deckbuilder");
    }
});

    return router;
}

// Hulp functies
function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

function handleError(res: Response, error: unknown, message: string): void {
    console.error(message + ":", error);
    if (res.headersSent) return;
    
    if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
    } else {
        res.status(500).json({ success: false, message: "Onbekende fout" });
    }
}