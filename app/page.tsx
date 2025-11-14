import recipesData from '@/data/recipes.json';

// Define a type for a single recipe to get TypeScript benefits like autocomplete
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
  // Use the imported data directly. We cast it to our Recipe type array.
  const recipes: Recipe[] = recipesData;

  return (
    <main className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Smart Recipe Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
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
      </div>
    </main>
  );
}