import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Card } from "./interfaces";
import { connect, initAssets, loadAssets } from "./database";
import session from "./session";
import { flashMiddleware } from "./middleware/flashMiddleware";
import homeRouter from "./routers/homeRouter";
import loginRouter from "./routers/loginRouter";

dotenv.config();

const app: Express = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.use(flashMiddleware);

async function MTGApp() {
  await connect();
  await initAssets();
  const cards: Card[] = await loadAssets();

  app.locals.cards = cards;

  app.use("/", loginRouter);

  app.use("/", homeRouter);

  app.listen(app.get("port"), () => {
    console.log(`Server started on http://localhost:${app.get("port")}`);
  });
}

MTGApp().catch((err) => {
  console.error("Er is iets misgelopen:", err);
  process.exit(1);
});
