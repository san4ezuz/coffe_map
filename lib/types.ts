export type PlaceCategory = "coffee" | "food" | "service";

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  distanceM: number;
  tags: string[];
  description: string;
  hours: string;
  openUntil: string;
  isOpenNow: boolean;
  instagram?: string;
  whatsapp?: string;
  phone?: string;
  googleMapsUrl?: string;
  ownerNote?: { quote: string; author: string };
  photos?: string[];
  coverFocalX?: number;
  coverFocalY?: number;
}
