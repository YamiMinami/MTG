export interface Card {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "mythic";
  color_identity?: {
    0?: string[];
  };
  oracle_text?: string;
  image_uris?: {
    png?: string;
  };
}
