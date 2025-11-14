'use client'; // This directive is required for using React hooks

import { useState, useEffect } from 'react';
import recipesData from '@/data/recipes.json';

// Define a type for a single recipe
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

export default function Home() {
  // State to hold the user's text input
  const [userInput, setUserInput] = useState('');
  // State to hold the recipes we want to display
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(false);

  // useEffect hook to load all recipes when the component first loads
  useEffect(() => {
    setDisplayedRecipes(recipesData as Recipe[]);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/find-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: userInput }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const matchedRecipes = await response.json();
      setDisplayedRecipes(matchedRecipes);

    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      // Optionally, set an error state to show a message to the user
      setDisplayedRecipes([]); // Clear recipes on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Smart Recipe Generator
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Enter your ingredients, separated by commas.
        </p>

        {/* Search Form */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., tomato, onion, chicken"
            className="flex-grow border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Searching...' : 'Find Recipes'}
          </button>
        </div>

        {/* Recipe Display Area */}
        <div>
          {isLoading ? (
            <p className="text-center text-gray-600">Finding the best recipes for you...</p>
          ) : displayedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe) => (
                <div key={recipe.id} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold text-green-700">{recipe.name}</h2>
                  <p className="text-gray-600 mt-2">
                    <strong>Time:</strong> {recipe.cookingTime} mins | <strong>Difficulty:</strong> {recipe.difficulty}
                  </p>
                  <div className="mt-2">
                    <h3 className="font-bold">Ingredients:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {recipe.ingredients.slice(0, 4).map((ing) => (
                        <li key={ing.name}>{ing.name}</li>
                      ))}
                      {recipe.ingredients.length > 4 && <li className="text-gray-400">...and more</li>}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No recipes found. Try different ingredients!</p>
          )}
        </div>
      </div>
    </main>
  );
}