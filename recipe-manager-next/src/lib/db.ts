import fs from 'fs/promises';
import path from 'path';
import { Recipe, RecipeDatabase } from '@/types/recipe';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'recipes.json');

async function readDb(): Promise<RecipeDatabase> {
    try {
        const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty structure
        return { recipes: [] };
    }
}

async function writeDb(db: RecipeDatabase): Promise<void> {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function getRecipes(): Promise<Recipe[]> {
    const db = await readDb();
    return db.recipes.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
    const db = await readDb();
    return db.recipes.find((r) => r.id === id) || null;
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const db = await readDb();
    const newRecipe: Recipe = {
        ...recipe,
        id: Date.now(),
        createdAt: Date.now(),
    };
    db.recipes.push(newRecipe);
    await writeDb(db);
    return newRecipe;
}

export async function updateRecipe(id: number, updates: Partial<Recipe>): Promise<Recipe | null> {
    const db = await readDb();
    const index = db.recipes.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updatedRecipe = { ...db.recipes[index], ...updates };
    db.recipes[index] = updatedRecipe;
    await writeDb(db);
    return updatedRecipe;
}

export async function deleteRecipe(id: number): Promise<boolean> {
    const db = await readDb();
    const initialLength = db.recipes.length;
    db.recipes = db.recipes.filter((r) => r.id !== id);

    if (db.recipes.length === initialLength) return false;

    await writeDb(db);
    return true;
}
