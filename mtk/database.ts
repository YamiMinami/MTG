import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { User, Card, Deck } from "./interfaces";
import bcrypt from "bcrypt";
dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
export const userCollection = client.db("MagicTheGathering").collection<User>("users");
export const deckCollection = client.db("MagicTheGathering").collection<Deck>("decks");

const saltRounds : number = 10;

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

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

// Users

export async function createUser(username: string, rawPassword: string): Promise<void> {
  const usersCollection = () => client.db("MagicTheGathering").collection<User>("Users");
  const hashed = await bcrypt.hash(rawPassword, saltRounds);
  await usersCollection().insertOne({ username, password: hashed });
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const col = client.db("MagicTheGathering").collection<User>("Users");
  const user = await col.findOne({ username });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  return ok ? user : null;
}

// Als jullie controle voor jullie routers willen uitvoeren gr Trong

export async function userExists(username: string): Promise<boolean> {
  const usersCollection = () => client.db("MagicTheGathering").collection<User>("Users");
  return (await usersCollection().findOne({ username })) !== null;
}



