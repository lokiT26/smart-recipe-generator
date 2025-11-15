// Define a type for the Recipe object to be used as a prop
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

// Define the types for the props our component will receive
type RecipeModalProps = {
  recipe: Recipe;
  onClose: () => void; // A function that takes no arguments and returns nothing
};

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  // We stop propagation on the modal content click so that clicking inside the modal doesn't close it
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // Backdrop: a semi-transparent overlay that covers the whole screen
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Clicking on the backdrop will close the modal
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={handleModalContentClick} // Prevent clicks inside from closing the modal
      >
        <div className="p-6">
          {/* Header with Title and Close Button */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{recipe.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-3xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Recipe Details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6 border-b pb-4">
            <span><strong>Time:</strong> {recipe.cookingTime} mins</span>
            <span><strong>Difficulty:</strong> {recipe.difficulty}</span>
            <span><strong>Calories:</strong> {recipe.nutrition.calories} kcal</span>
            <span><strong>Protein:</strong> {recipe.nutrition.protein}</span>
          </div>

          {/* Main Content: Ingredients and Instructions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients List */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="text-gray-800">
                    <span className="font-semibold">{ing.quantity}</span> {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Instructions</h3>
              <ol className="list-decimal list-inside space-y-3">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="text-gray-800">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}