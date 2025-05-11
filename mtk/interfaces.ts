export interface Card {
    id: string;                   
    name: string;             
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'; 
    oracle_text?: string;         
    image_uris?: {
      png?: string;             
    };
  }

export interface Decks {
    id: string;                   
    name: string;             
    cards: Card[][];
                 
  }