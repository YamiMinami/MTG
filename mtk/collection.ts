// collection.ts
import express, { Request, Response, Router } from "express";
import { Card } from "./interfaces";
import { loadAssets } from "./database";
import { secureMiddleware } from "./middleware/secureMiddleware";

export function collectionRouter(): Router {
    const router = express.Router();

    router.get("/collection", secureMiddleware, async (req: Request, res: Response) => {
        try {
            // Type casting voor query parameters
            const manaFilter = typeof req.query.mana === 'string' ? req.query.mana : "None";
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : "";
            const page = parseInt(typeof req.query.page === 'string' ? req.query.page : "1") || 1;
            
            const perPage = 10;
            const validColors = ['W', 'U', 'B', 'R', 'G'];
            
            let cards = await loadAssets();

            // Filter logica met type checks
            let filteredCards = cards.filter(card => {
                // Mana filter
                const manaMatch = manaFilter === "None" || 
                    (manaFilter.length > 0 && 
                     validColors.includes(manaFilter[0].toUpperCase()) &&
                     card.color_identity?.includes(manaFilter[0].toUpperCase()));
                
                // Search filter
                const searchTerm = searchQuery.toLowerCase();
                const typeLine = card.type_line?.toLowerCase() || "";
                const oracleText = card.oracle_text?.toLowerCase() || "";
                
                const searchMatch = !searchQuery ||
                    card.name.toLowerCase().includes(searchTerm) ||
                    typeLine.includes(searchTerm) ||
                    oracleText.includes(searchTerm);
                
                return manaMatch && searchMatch;
            });

            // Paginering
            const totalPages = Math.ceil(filteredCards.length / perPage);
            const pagedCards = filteredCards.slice((page - 1) * perPage, page * perPage);

            res.render("collection", {
                cards: pagedCards,
                currentPage: page,
                totalPages,
                manaFilter,
                searchQuery
            });

        } catch (error) {
            console.error("Collection error:", error);
            res.status(500).send("Server error");
        }
    });

    return router;
}