import { NextResponse } from 'next/server';
import { getRecipes, createRecipe } from '@/lib/db';

export async function GET() {
    try {
        const recipes = await getRecipes();
        return NextResponse.json(recipes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Basic validation could go here
        const newRecipe = await createRecipe(body);
        return NextResponse.json(newRecipe, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
    }
}
