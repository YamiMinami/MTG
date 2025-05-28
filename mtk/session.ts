import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import dotenv from "dotenv";

dotenv.config(); 

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
  uri:      process.env.MONGODB_URI!,
  collection: "sessions",
  databaseName: "Aniverse",
});

declare module "express-session" {
  interface SessionData {
    username?:     string;
    role?:         string;
    errorMessage?: string;
  }
}

export default session({
  secret:            process.env.SESSION_SECRET ?? "super-secret",
  store:             mongoStore,
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
   },
});
