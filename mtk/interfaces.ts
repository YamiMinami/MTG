export interface Card {
    id: string;                   
    name: string;             
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'; 
    "color_identity": string[],
    oracle_text?: string;         
    image_uris?: {
      png?: string;             
    };
  }
  