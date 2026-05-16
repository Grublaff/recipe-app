export interface Recipe {
  id: number;
  name: string;
  description: string;
  cookingTime: number;
  categories: string[];
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  servings?: number;
  difficulty?: string;
}
