import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormData, FurnitureListResponse, AnalysisResult } from "../types";

let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      console.error("CRITICAL: API_KEY is missing in environment variables.");
      throw new Error("API Configuration Error: 请在部署设置中添加 API_KEY 环境变量。");
    }

    aiClient = new GoogleGenAI({ apiKey: apiKey });
  }
  return aiClient;
};

// Image Generation Service (Text to Image)
export const generateDesignImage = async (data: FormData): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Professional interior design architectural render.
      Style: ${data.style}.
      Layout: ${data.layout}.
      Room Size: ${data.area} square meters.
      Lighting/Orientation: Natural light coming from the ${data.orientation}.
      Atmosphere: Photorealistic, high quality, 8k resolution, cozy, modern furniture placement, detailed textures.
      View: Wide angle shot showing the main living area.
    `;

    console.log("Generating image with prompt:", prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    console.warn("No image data found in response.");
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Furniture List Generation Service (Smart Budget & Comparison)
export const generateFurnitureList = async (data: FormData): Promise<FurnitureListResponse> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are an expert interior cost estimator.
      Generate a furniture shopping list for: ${data.style} style, ${data.area} sqm.
      
      Goal: Smart Budgeting. Provide a price range (Min/Max) for each item to help with price comparison.
      
      Output JSON with:
      1. List of items.
      2. For each item:
         - priceMin: Low end market price (CNY)
         - priceMax: High end market price (CNY)
         - estimatedPrice: Average price (CNY)
         - searchQuery: Specific search term to find this item online (e.g. "北欧极简布艺沙发 米白色")
      3. Total costs calculated.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        totalEstimatedCost: { type: Type.NUMBER, description: "Sum of average prices" },
        totalMinCost: { type: Type.NUMBER, description: "Sum of min prices" },
        totalMaxCost: { type: Type.NUMBER, description: "Sum of max prices" },
        currency: { type: Type.STRING, description: "CNY" },
        designAdvice: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              material: { type: Type.STRING },
              dimensions: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER },
              priceMin: { type: Type.NUMBER, description: "Lower bound price" },
              priceMax: { type: Type.NUMBER, description: "Upper bound price" },
              searchQuery: { type: Type.STRING, description: "Optimized search keyword" },
              buyingTip: { type: Type.STRING }
            },
            required: ["category", "name", "description", "material", "dimensions", "estimatedPrice", "priceMin", "priceMax", "searchQuery", "buyingTip"]
          }
        }
      },
      required: ["totalEstimatedCost", "totalMinCost", "totalMaxCost", "currency", "items", "designAdvice"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned");
    return JSON.parse(jsonText) as FurnitureListResponse;
  } catch (error) {
    console.error("Error generating list:", error);
    throw error;
  }
};

// AR Renovation Image Service
export const generateRenovatedImage = async (base64Image: string, style: string, focusArea: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    
    // Extract base64 data and mime type
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/png';
    let data = base64Image;
    if (matches) { mimeType = matches[1]; data = matches[2]; }

    const prompt = `
      Renovate this room interior.
      Target Style: ${style}.
      Focus Area: ${focusArea}.
      Instructions: 
      1. Keep structural elements.
      2. Redecorate ${focusArea} to match ${style}.
      3. High quality photorealistic render.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "4:3" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating renovated image:", error);
    throw error;
  }
};

// AR Room Analysis & Element Recognition Service
export const analyzeRoomStyle = async (base64Image: string, style: string, focusArea: string): Promise<AnalysisResult> => {
  try {
    const ai = getAiClient();
    
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/png';
    let data = base64Image;
    if (matches) { mimeType = matches[1]; data = matches[2]; }

    const prompt = `
      Analyze this room image for a renovation project to ${style} style.
      
      Tasks:
      1. **Element Recognition**: Identify 3-5 existing furniture/decor items in the image. For each, state what it is, its current look, and how to change it.
      2. **Suggestions**: 3 renovation steps.
      3. **Colors**: 4 color palette.
      
      Return JSON.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        detectedObjects: {
            type: Type.ARRAY,
            description: "List of identified items in the room",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g. Sofa, Curtain" },
                    currentStyle: { type: Type.STRING, description: "Current condition/style" },
                    suggestion: { type: Type.STRING, description: "How to replace/renovate it" },
                    confidence: { type: Type.NUMBER, description: "0.1 to 1.0" }
                },
                required: ["name", "currentStyle", "suggestion", "confidence"]
            }
        },
        colorPalette: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    usage: { type: Type.STRING }
                },
                required: ["name", "hex", "usage"]
            }
        }
      },
      required: ["suggestions", "colorPalette", "detectedObjects"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
            { inlineData: { data, mimeType } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis text");
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing room:", error);
    // Fallback structure
    return {
        suggestions: ["Improve lighting", "Change wall color", "Update furniture"],
        detectedObjects: [
            { name: "Furniture", currentStyle: "Old", suggestion: "Replace", confidence: 0.8 }
        ],
        colorPalette: [
            { name: "White", hex: "#FFFFFF", usage: "Wall" },
            { name: "Grey", hex: "#CCCCCC", usage: "Floor" },
            { name: "Blue", hex: "#0000FF", usage: "Accent" },
            { name: "Wood", hex: "#8B4513", usage: "Furniture" }
        ]
    };
  }
};