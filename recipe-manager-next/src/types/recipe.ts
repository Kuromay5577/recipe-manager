export interface Recipe {
  id: number;
  title: string;
  yield: string;
  baseServings: number;
  cookingTime: number;
  categories: string[];
  seasons: string[];
  events: string[];
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  sourceUrl: string;
  notes: string;
  createdAt: number;
  caloriesPerServing: number | null;
  currentServings?: number;
}

export interface RecipeDatabase {
  recipes: Recipe[];
  exportDate?: string;
  version?: string;
  appName?: string;
}
