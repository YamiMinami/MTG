export interface Card {
    id: string;                   
    name: string;             
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'; 
    oracle_text?: string;         
    image_uris?: {
      png?: string;             
    };
  }

  export interface user {
    id: number;
    name: string;
    deck: Decks[];
  }

export interface Decks {
    id: number;                   
    name: string;             
    cards: string[][];
                 
  }