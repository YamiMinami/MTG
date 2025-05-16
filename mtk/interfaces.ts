export interface Card {
    id: string;                   
    name: string;             
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'; 
    flavor_text?: string;
    oracle_text?: string;         
    image_uris?: {
      png?: string;             
    };
  }