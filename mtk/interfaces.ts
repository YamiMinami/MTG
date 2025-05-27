import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    avatar?: string;
    username?: string;
}

export interface FlashMessage {
    type: "error" | "success" | "info"
    message: string;
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

  export interface user {
    id: string;
    name: string;
    deck: Decks[];
  }

export interface Decks {
    id: number;                   
    name: string;             
    cards: string[][];
                 
  }