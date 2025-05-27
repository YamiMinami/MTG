import express, { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import {deckCollection, loadAssets } from "./database";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { Card,Deck } from "./interfaces";

export function deckRouter(): Router {
    const router = express.Router();

    // Toon deckbuilder pagina met alle decks van de gebruiker
    router.get("/deckbuilder", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const colorFilter = req.query.color as string;
            
            let query: any = { userId: user._id };
            if (colorFilter && colorFilter !== "None") {
                query.colors = colorFilter;
            }

            const decks = await deckCollection.find(query).toArray();
            res.render("deckbuilder", { 
                decks,
                colors: ['W', 'U', 'B', 'R', 'G', 'None'],
                currentFilter: colorFilter || "None"
            });
        } catch (error) {
            console.error("Fout bij ophalen decks:", error);
            req.session.message = { type: "error", message: "Kan decks niet laden" };
            res.redirect("/home");
        }
    });

    // Maak nieuw deck aan
    router.post("/deck", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const { name, colors } = req.body;
            
            if (!name || name.length < 3) {
                req.session.message = { type: "error", message: "Decknaam moet minstens 3 karakters zijn" };
                return res.redirect("/deckbuilder");
            }

            const newDeck: Deck = {
                name,
                colors: Array.isArray(colors) ? colors : [colors],
                cards: [],
                userId: user._id!,
                createdAt: new Date()
            };

            await deckCollection.insertOne(newDeck);
            req.session.message = { type: "success", message: "Deck succesvol aangemaakt!" };
        } catch (error) {
            console.error("Fout bij aanmaken deck:", error);
            req.session.message = { type: "error", message: "Kan deck niet aanmaken" };
        }
        res.redirect("/deckbuilder");
    });

    // Genereer random deck
    router.post("/deck/random", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const user = req.session.user!;
            const allCards: Card[] = await loadAssets();
            
            if (allCards.length < 20) {
                req.session.message = { type: "error", message: "Niet genoeg kaarten beschikbaar" };
                return res.redirect("/deckbuilder");
            }

            const randomCards = allCards
                .sort(() => 0.5 - Math.random())
                .slice(0, 20)
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
        } catch (error) {
            console.error("Fout bij genereren random deck:", error);
            req.session.message = { type: "error", message: "Kan random deck niet genereren" };
        }
        res.redirect("/deckbuilder");
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
                return res.status(404).json({ success: false, message: "Deck niet gevonden" });
            }
            
            res.json({ success: true, message: "Deck verwijderd" });
        } catch (error) {
            console.error("Fout bij verwijderen deck:", error);
            res.status(500).json({ success: false, message: "Serverfout" });
        }
    });

    // Update deck
    router.put("/deck/:id", secureMiddleware, async (req: Request, res: Response) => {
        try {
            const deckId = new ObjectId(req.params.id);
            const { name, colors, cards } = req.body;

            if (cards.length > 20) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Maximaal 20 kaarten toegestaan" 
                });
            }

            const result = await deckCollection.updateOne(
                { _id: deckId, userId: req.session.user!._id },
                { $set: { 
                    name,
                    colors: Array.isArray(colors) ? colors : [colors],
                    cards 
                }}
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Deck niet gevonden" });
            }

            res.json({ success: true, message: "Deck bijgewerkt" });
        } catch (error) {
            console.error("Fout bij updaten deck:", error);
            res.status(500).json({ success: false, message: "Serverfout" });
        }
    });

    return router;
}
import readline from 'readline';
import { MongoClient } from 'mongodb';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Voer de naam van het deck in: ', (deckName) => {
    rl.question('Voer de kaarten in, gescheiden door komma\'s: ', (cardsInput) => {
        const cards = cardsInput.split(',').map(card => card.trim());
        console.log(`Deck naam is: ${deckName}`);
        console.log('Kaarten in het deck:', cards);
        rl.close();
    });
});
const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

async function saveDeckToDatabase(deckName: string, cards: string[]) {
    try {
        await client.connect();
        const database = client.db('mtg');
        const collection = database.collection('decks');
        const deck = { name: deckName, cards: cards, createdAt: new Date() };
        const result = await collection.insertOne(deck);

        console.log(`Deck opgeslagen met ID: ${result.insertedId}`);
    } catch (error) {
        console.error('Fout bij het opslaan van het deck:', error);
    } finally {
        await client.close();
    }
}

saveDeckToDatabase(deckName, cards);