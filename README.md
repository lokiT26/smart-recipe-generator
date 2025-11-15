# Smart Recipe Generator

A web application that suggests recipes based on ingredients you have on hand, identified either by text input or by uploading a photo.

**Live Application URL:** [smart-recipe-generator-theta.vercel.app](https://smart-recipe-generator-theta.vercel.app/)

---

## Features

- **Image-Based Ingredient Recognition:** Upload a photo of your ingredients, and the app uses the Clarifai AI API to identify them.
- **Text-Based Input:** Manually type a comma-separated list of your available ingredients.
- **Intelligent Recipe Matching:** A scoring algorithm ranks recipes based on how many ingredients you have versus how many are missing.
- **Match Details:** Each recipe card clearly shows which ingredients you have and which you're missing.
- **Advanced Filtering:** Filter suggested recipes by dietary restrictions (Vegetarian, Gluten-Free, etc.) and maximum cooking time.
- **Responsive Design:** A clean, mobile-first user interface built with Tailwind CSS.

## Technical Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Service:** Clarifai API (Food Recognition Model)
- **Hosting:** Vercel

---

## My Approach (Brief Write-up)

My approach was to build a full-stack server-rendered application using Next.js, which allowed me to handle both the frontend UI and backend API logic within a single, cohesive project.

**Ingredient Recognition:** For the core computer vision feature, I integrated the Clarifai AI service. The user's image is converted to a base64 string on the client-side and sent to a dedicated Next.js API route. This backend route securely calls the Clarifai API with a Personal Access Token (PAT), processes the results to filter for high-confidence predictions (>90%), and returns a clean list of ingredients. This server-side approach protects my API key from being exposed in the browser.

**Recipe Matching:** The recipe matching logic is handled by another API route. It calculates a "match score" for every recipe in the database. The score prioritizes recipes with a higher percentage of available ingredients while also penalizing those with a large number of missing items (`score = matchPercentage - (missingCount * 10)`). This ensures the most relevant and achievable recipes are ranked highest. User-specified filters for diet and cooking time are then applied on the backend before the sorted list is sent back to the user for a fast, interactive experience.

---

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lokiT26/smart-recipe-generator.git
    cd smart-recipe-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add your Clarifai Personal Access Token:
    ```
    CLARIFAI_API_KEY=YOUR_CLARIFAI_PAT_HERE
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.