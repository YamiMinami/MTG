import { ObjectId } from "mongodb";
declare module 'express-session' {
  export interface SessionData {
    user?: User;
    message?: FlashMessage;
    drawnCards?: Record<string, string[]>;  // <deckName, [cardId,…]>
  }
}

export interface User {
  _id?: ObjectId;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
  avatar?: string;
  username?: string;
}

export interface FlashMessage {
  type: "error" | "success" | "info";
  message: string;
}

export interface Card {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "mythic";
  flavor_text?: string;
  oracle_text?: string;
  color_identity?: string;
  image_uris?: {
    png?: string;
  };
  type_line?: string;
}
export interface Deck {
  _id?: ObjectId;
  name: string;
  colors: string[];
  cards: string[];
  userId: ObjectId;
  createdAt: Date;
  image?: string;
  background?: string;
}
