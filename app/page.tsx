'use client';

import { useState, useEffect, useRef } from 'react';

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
  ownedIngredients?: number;
  missingIngredients?: number;
  missingIngredientNames?: string[];
};

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<number>(0); // 0 means 'any'
  
  // A ref to access the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initially load all recipes
    const loadInitialRecipes = async () => {
       const response = await fetch('/api/find-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: '' }), // Empty search returns all
      });
      const allRecipes = await response.json();
      setDisplayedRecipes(allRecipes);
    }
    loadInitialRecipes();
  }, []);

  const handleSearch = async (ingredients: string) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/find-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients,
          dietaryFilter,
          timeFilter
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const matchedRecipes = await response.json();
      setDisplayedRecipes(matchedRecipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setDisplayedRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsIdentifying(true);

    // Convert image file to a base64 string
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
        const response = await fetch('/api/identify-ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String }),
        });
        if (!response.ok) throw new Error('Image identification failed');
        const data = await response.json();
        const identifiedIngredients = data.ingredients.join(', ');
        
        // Populate the input field and trigger the search
        setUserInput(identifiedIngredients);
        if (identifiedIngredients) {
          await handleSearch(identifiedIngredients);
        }

      } catch (error) {
        console.error("Failed to identify ingredients:", error);
        // You could add an error message for the user here
      } finally {
        setIsIdentifying(false);
      }
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      setIsIdentifying(false);
    }
  };

  const isLoading = isSearching || isIdentifying;

  return (
    <main className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Smart Recipe Generator
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Upload a photo of your ingredients or type them below.
        </p>

        {/* Input & Action Area */}
        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., tomato, onion, chicken"
              className="flex-grow border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <button
              onClick={() => handleSearch(userInput)}
              disabled={isLoading}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 whitespace-nowrap"
            >
              {isSearching ? 'Searching...' : 'Find Recipes'}
            </button>
          </div>
          <div className="flex items-center justify-center mt-4">
             <div className="w-full border-t border-gray-300"></div>
             <span className="px-2 text-gray-500 bg-gray-50 -mt-3">OR</span>
             <div className="w-full border-t border-gray-300"></div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isIdentifying ? 'Identifying...' : 'Upload an Image'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <div>
            <label htmlFor="diet" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
            <select
              id="diet"
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value="all">All</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="low-carb">Low-Carb</option>
            </select>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Max Cooking Time (mins)</label>
            <select
              id="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value={0}>Any</option>
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>
        </div>

        {/* Recipe Display Area remains the same... */}
        <div>
          {isLoading && !isSearching ? (
             <p className="text-center text-gray-600">Identifying ingredients from your image...</p>
          ) : isSearching ? (
             <p className="text-center text-gray-600">Finding the best recipes for you...</p>
          ) : displayedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe) => (
                <div key={recipe.id} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-green-700">{recipe.name}</h2>
                    <p className="text-gray-600 mt-2">
                      <strong>Time:</strong> {recipe.cookingTime} mins | <strong>Difficulty:</strong> {recipe.difficulty}
                    </p>
                    
                    {/* Match Information Display */}
                    {recipe.ownedIngredients !== undefined && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-2 text-sm">
                        <p className="font-bold text-green-800">
                          You have {recipe.ownedIngredients} / {recipe.ownedIngredients + (recipe.missingIngredients || 0)} ingredients.
                        </p>
                        {recipe.missingIngredientNames && recipe.missingIngredientNames.length > 0 && (
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Missing:</span> {recipe.missingIngredientNames.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
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