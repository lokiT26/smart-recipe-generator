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

    const { dietaryFilter, timeFilter } = body;

    const allRecipes: Recipe[] = recipesData;

    const scoredRecipes = allRecipes.map(recipe => {
        const recipeIngredientsLower = recipe.ingredients.map(ing => ing.name.toLowerCase());
        let ownedIngredientsCount = 0;
        let ownedIngredientNames: string[] = [];
        let missingIngredientNames: string[] = [];

        recipeIngredientsLower.forEach(recipeIng => {
            if (userIngredients.includes(recipeIng)) {
            ownedIngredientsCount++;
            ownedIngredientNames.push(recipeIng);
            }
        });
        
        // Now find the missing ones
        missingIngredientNames = recipeIngredientsLower.filter(recipeIng => !userIngredients.includes(recipeIng));

        const totalIngredients = recipe.ingredients.length;
        const matchPercentage = totalIngredients > 0 ? (ownedIngredientsCount / totalIngredients) * 100 : 0;
        const missingIngredientsCount = totalIngredients - ownedIngredientsCount;
        const finalScore = matchPercentage - (missingIngredientsCount * 10);

        return { 
            ...recipe, 
            score: finalScore, 
            ownedIngredients: ownedIngredientsCount, 
            missingIngredients: missingIngredientsCount,
            missingIngredientNames // Add this to the returned object
        };
    });

    const filteredAndSortedRecipes = scoredRecipes
    .filter(recipe => {
        // Keep recipes with at least one matching ingredient
        const hasMatches = recipe.ownedIngredients > 0;
        
        // Dietary filter logic
        const dietMatch = dietaryFilter === 'all' || recipe.dietary.includes(dietaryFilter);
        
        // Time filter logic
        const timeMatch = timeFilter === 0 || recipe.cookingTime <= timeFilter;

        return hasMatches && dietMatch && timeMatch;
    })
    .sort((a, b) => b.score - a.score);

    return NextResponse.json(filteredAndSortedRecipes);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}