import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { User } from "./interfaces";
import bcrypt from "bcrypt";
dotenv.config();
import { Card, Deck } from "./interfaces";

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
async function createInitialUser() {
    const count = await userCollection.countDocuments();
    console.log(`👥 Gebruikers in DB: ${count}`);

    if (count > 0) {
        console.log("🛑 Admin user bestaat al, overslaan");
        return;
    }

    let email: string | undefined = process.env.ADMIN_EMAIL;
    let password: string | undefined = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }

    console.log(`➕ Admin user wordt toegevoegd met email: ${email}`);

    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN",
    });

    console.log("✅ Admin user toegevoegd");
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await userCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function connect() {
    try {
        console.log("🔌 Verbinden met MongoDB...");
        await client.connect();
        console.log("✅ Verbonden met MongoDB");

        console.log("👤 Initialiseren van admin user...");
        await createInitialUser();
        console.log("✅ Admin user gecheckt / aangemaakt");

        process.on("SIGINT", async () => {
            await client.close();
            console.log("Disconnected from MongoDB");
            process.exit(0);
        });
    } catch (err) {
        console.error("❌ MongoDB connectie fout:", err);
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