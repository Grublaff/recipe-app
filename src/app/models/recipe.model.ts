export interface Recipe {
  id: number;
  name: string;
  description: string;
  cookingTime: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
} 