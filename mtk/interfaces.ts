import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    avatar?: string;
    username?: string;
    decks?: Deck[];
}

export interface FlashMessage {
    type: "error" | "success" | "info"
    message: string;
}
export interface Deck {
  id?: string;
  name: string;
  cards: Card[];
}
export interface Card {
    id: string;                   
    name: string;             
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'; 
    flavor_text?: string;
    oracle_text?: string;
    color_identity?: string;       
    image_uris?: {
      png?: string;             
    };
  }