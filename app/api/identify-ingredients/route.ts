import { NextResponse } from 'next/server';

// Define a type for the concepts we expect back from Clarifai
type ClarifaiConcept = {
  id: string;
  name: string;
  value: number; // This is the confidence score
  app_id: string;
};

// These are the correct identifiers for the public "food-item-recognition" model
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageBase64: string = body.imageBase64;

    if (!imageBase64) {
      return NextResponse.json({ message: 'Image data is required' }, { status: 400 });
    }

    const API_URL = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`;

    const requestPayload = {
      inputs: [
        {
          data: {
            image: {
              base64: imageBase64,
            },
          },
        },
      ],
    };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    });
    
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      // Log the specific error from Clarifai
      console.error('Clarifai API Error:', data.outputs[0]?.status?.details || data);
      return NextResponse.json({ message: `Clarifai API Error: ${data.outputs[0]?.status?.details || 'Unknown Error'}` }, { status: apiResponse.status });
    }

    const concepts: ClarifaiConcept[] = data.outputs[0].data.concepts;

    if (!concepts) {
      return NextResponse.json({ ingredients: [] });
    }

    const ingredients = concepts
      .filter((concept) => concept.value > 0.90)
      .map((concept) => concept.name);

    return NextResponse.json({ ingredients });

  } catch (error: any) {
    console.error('Error in identify-ingredients route:', error.message);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}