import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCityQuiz = async (city) => {
  const model = "gemini-2.5-flash";
  const prompt = `Generate a fun, engaging trivia quiz about ${city} with 5 questions. Provide relatedTopic and funFact.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            relatedTopic: { type: Type.STRING },
            funFact: { type: Type.STRING },
          },
          required: ["text", "options", "correctIndex", "relatedTopic", "funFact"],
        },
      },
    },
  });
  const rawData = JSON.parse(response.text || "[]");
  return rawData.map((q, index) => ({ ...q, id: `q-${index}` }));
};

export const generateTravelSuggestions = async (city, quizContext, hotelLocation) => {
  const model = "gemini-2.5-flash";
  const startPoint = hotelLocation ? hotelLocation : "City Center";
  const prompt = `Identify 6 places to visit in ${city} near ${startPoint} related to ${quizContext.join(", ")}. Return JSON array with title, description, category, distanceText, travelTimeText, googleMapsLink.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { tools: [{ googleMaps: {} }] },
  });
  let parsedData = [];
  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
    else parsedData = JSON.parse(text);
  } catch (e) { return []; }
  return parsedData.map((s, index) => ({
    ...s,
    id: `s-${index}`,
    distanceText: s.distanceText || "Unknown",
    travelTimeText: s.travelTimeText || "Unknown",
    googleMapsLink: s.googleMapsLink || "",
  }));
};

export const optimizeItineraryRoute = async (city, hotelLocation, items) => {
  return items.map(i => i.id); // Placeholder for complex logic in script
};

export const generateLocationImage = async (locationName, city) => {
  return null; 
};
