import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
import { Card } from "./interfaces";

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

export async function connect() {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      process.on("SIGINT", async () => {
        await client.close();
        console.log("Disconnected from MongoDB");
        process.exit(0);
      });
    } catch (err) {
      console.error("Mongo connection error:", err);
      throw err;
    }
  }

  export async function initAssets() {
    const db = client.db("MagicTheGathering");
    const col = db.collection<Card>("Cards");
  
    const count = await col.countDocuments();
    if (count > 0) {
      console.log(`${count} kaarten al in MongoDB`);
      return;
    }
  
    const res  = await fetch(
      "https://raw.githubusercontent.com/s117507/WebOntwikkeling_Project/main/250Cards.json"
    );
    const data: Card[] = await res.json();
  
    await col.insertMany(data);
    console.log(`Inserted ${data.length} assets into MongoDB`);
  }
  
  export async function loadAssets(): Promise<Card[]> {
    const db  = client.db("MagicTheGathering");
    const col = db.collection<Card>("Cards");
    return col.find().toArray();
  }