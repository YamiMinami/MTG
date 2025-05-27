import { Router, Request, Response } from "express";
import { requireLogin } from "../middleware/secureMiddleware";
import { Card } from "../interfaces";

const router = Router();

router.get("/first-time-user", (req: Request, res: Response) => {
  res.render("first-time-user");
});

router.use(requireLogin);

router.get("/home", (req: Request, res: Response) => {
  res.render("home");
});

router.get("/detail", (req: Request, res: Response) => {
  res.render("detail");
});

router.get("/drawcard", (req: Request, res: Response) => {
  res.render("drawcard");
});

router.get("/deckbuilder", (req: Request, res: Response) => {
  res.render("deckbuilder");
});

router.get("/collection", (req: Request, res: Response) => {
  const cards: Card[] = req.app.locals.cards;
  const perPage = 10;
  const page = parseInt(req.query.page as string) || 1;
  const manaFilter = req.query.mana as string;
  const validColors = ["W", "U", "B", "R", "G"];

  let filtered = cards;
  if (manaFilter && manaFilter !== "None") {
    const letter = manaFilter[0].toUpperCase();
    if (validColors.includes(letter)) {
      filtered = cards.filter((c) =>
        c.color_identity?.includes(letter)
      );
    }
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageCards = filtered.slice((page - 1) * perPage, page * perPage);

  res.render("collection", {
    cards: pageCards,
    currentPage: page,
    totalPages,
    manaFilter,
  });
});

router.get("/detail/:id", (req: Request, res: Response) => {
  const cards: Card[] = req.app.locals.cards;
  const card = cards.find((c) => c.id === req.params.id);
  if (!card) {
    return res.status(404).send("Card not found");
  }
  res.render("detail", { card });
});

export default router;
