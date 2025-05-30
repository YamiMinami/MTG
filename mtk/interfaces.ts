import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    avatar?: string;

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
