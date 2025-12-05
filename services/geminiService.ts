/// <reference types="vite/client" />


export interface SpotGuideData {
  summary: string;
  history: string;
  builder: string;
  purpose: string;
  fun_fact: string;
}

export const generateSpotGuide = async (placeName: string, locationContext: string): Promise<SpotGuideData | null> => {
  try {
    // Dynamic import to prevent top-level load errors if the environment doesn't support the SDK statically
    let GoogleGenAI, Type;
    try {
        const module = await import("@google/genai");
        GoogleGenAI = module.GoogleGenAI;
        Type = module.Type;
    } catch (importError) {
        console.error("Failed to import @google/genai SDK:", importError);
        return null;
    }

    // Safe API Key Access
    let apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
        console.error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert travel historian and guide.
      Provide a detailed guide for the tourist spot: "${placeName}" located near "${locationContext}".
      
      Return a JSON object with these exact fields:
      - summary: A captivating summary of the place (max 40 words).
      - history: A concise history of the location (approx 60 words).
      - builder: Who built it and when? (If natural or unknown, state that).
      - purpose: Why was it built or created? (The original purpose).
      - fun_fact: One unique or surprising fact about it.
      
      Ensure the tone is engaging, educational, and professionally formatted.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            history: { type: Type.STRING },
            builder: { type: Type.STRING },
            purpose: { type: Type.STRING },
            fun_fact: { type: Type.STRING },
          },
          required: ["summary", "history", "builder", "purpose", "fun_fact"],
        },
      },
    });

    if (response.text) {
        const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as SpotGuideData;
    }
    return null;

  } catch (error) {
    console.error("Gemini Guide Error:", error);
    // Return null to allow UI to handle the error state gracefully
    return null;
  }
};