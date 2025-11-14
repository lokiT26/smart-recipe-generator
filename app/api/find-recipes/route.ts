import { NextResponse } from 'next/server';
import recipesData from '@/data/recipes.json';

// Re-using the Recipe type definition is a good practice
type Recipe = {
  id: number;
  name: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  dietary: string[];
  nutrition: { calories: number; protein: string };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userIngredients: string[] = body.ingredients
      .split(',')
      .map((item: string) => item.trim().toLowerCase())
      .filter((item: string) => item); // remove any empty strings

    if (!userIngredients || userIngredients.length === 0) {
      // If input is empty, return all recipes
      return NextResponse.json(recipesData);
    }

    const allRecipes: Recipe[] = recipesData;

    const scoredRecipes = allRecipes.map(recipe => {
      let ownedIngredients = 0;
      recipe.ingredients.forEach(recipeIngredient => {
        if (userIngredients.includes(recipeIngredient.name.toLowerCase())) {
          ownedIngredients++;
        }
      });
      
      const totalIngredients = recipe.ingredients.length;
      const matchPercentage = (ownedIngredients / totalIngredients) * 100;
      const missingIngredients = totalIngredients - ownedIngredients;

      // The scoring formula: high match percentage is good, but penalize for missing items
      const finalScore = matchPercentage - (missingIngredients * 10);

      return { ...recipe, score: finalScore, ownedIngredients, missingIngredients };
    });

    // Filter out recipes that don't have any matching ingredients and sort by score
    const sortedRecipes = scoredRecipes
      .filter(recipe => recipe.ownedIngredients > 0)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedRecipes);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}