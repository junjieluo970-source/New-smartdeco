import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormData, FurnitureListResponse, ArAnalysisResponse, FocusArea } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Image Generation Service (Text to Image)
export const generateDesignImage = async (data: FormData): Promise<string | null> => {
  try {
    const prompt = `
      Professional interior design architectural render.
      Style: ${data.style}.
      Layout: ${data.layout}.
      Room Size: ${data.area} square meters.
      Lighting/Orientation: Natural light coming from the ${data.orientation}.
      Atmosphere: Photorealistic, high quality, 8k resolution, cozy, modern furniture placement, detailed textures.
      View: Wide angle shot showing the main living area.
    `;

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

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Furniture List Generation Service
export const generateFurnitureList = async (data: FormData): Promise<FurnitureListResponse> => {
  try {
    const prompt = `
      You are a professional interior decorator specializing in budget-friendly renovations.
      Generate a furniture shopping list for a home with the following specs:
      - Layout: ${data.layout}
      - Area: ${data.area} sqm
      - Orientation: ${data.orientation}
      - Style: ${data.style}
      
      Goal: Provide the CHEAPEST yet stylish furniture options that fit this specific style.
      Output: A structured JSON object containing a list of essential items, their estimated low-end market price in CNY (Chinese Yuan), and a brief buying tip.
      Also include a brief design advice summary.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        totalEstimatedCost: { type: Type.NUMBER, description: "Total sum of all estimated prices" },
        currency: { type: Type.STRING, description: "Currency code, e.g., CNY" },
        designAdvice: { type: Type.STRING, description: "A short paragraph of design advice for this specific room configuration." },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Category like Sofa, Table, Lamp" },
              name: { type: Type.STRING, description: "Generic name of the item" },
              description: { type: Type.STRING, description: "Description of color/material fitting the style" },
              estimatedPrice: { type: Type.NUMBER, description: "Estimated price in CNY" },
              buyingTip: { type: Type.STRING, description: "Tip on how to find this item cheaply" }
            },
            required: ["category", "name", "description", "estimatedPrice", "buyingTip"]
          }
        }
      },
      required: ["totalEstimatedCost", "currency", "items", "designAdvice"]
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
    if (!jsonText) {
      throw new Error("No text returned from API");
    }

    return JSON.parse(jsonText) as FurnitureListResponse;
  } catch (error) {
    console.error("Error generating list:", error);
    throw error;
  }
};

// --- AR / Image Makeover Services ---

// 1. Generate Renovated Image (Image Editing)
export const generateRenovatedImage = async (base64Image: string, style: string, focusArea: FocusArea): Promise<string | null> => {
  try {
    // Remove header if present for processing
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    let prompt = `Redecorate this room in ${style} style. Make it look photorealistic.`;
    
    switch (focusArea) {
      case 'Walls & Floor':
        prompt += ` Keep the furniture layout and items exactly as they are, but change the wall paint/wallpaper and flooring to match ${style}.`;
        break;
      case 'Furniture':
        prompt += ` Keep the room structure (walls, windows, floor) exactly as they are, but replace the furniture with ${style} style furniture.`;
        break;
      case 'Soft Decor':
        prompt += ` Keep the hard furniture and structure. Only change soft decorations like curtains, rugs, cushions, and art to match ${style}.`;
        break;
      default: // Overall Room
        prompt += ` Keep the structural elements (walls, windows, floor shape) but update the furniture, colors, and decor to match the ${style} aesthetic perfectly.`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating AR image:", error);
    throw error;
  }
};

// 2. Analyze Room and Provide Advice (Multimodal)
export const analyzeRoomStyle = async (base64Image: string, targetStyle: string, focusArea: FocusArea): Promise<ArAnalysisResponse> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-4 specific renovation suggestions based on the focus area"
        },
        colorPalette: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                name: { type: Type.STRING, description: "Name of the color (e.g., Sage Green, Warm Beige)" },
                hex: { type: Type.STRING, description: "Hex color code (e.g., #F5F5DC)" },
                usage: { type: Type.STRING, description: "Suggested usage (e.g., Main Walls, Sofa Accent, Curtains)" }
             },
             required: ["name", "hex", "usage"]
          },
          description: "List of 4-5 curated colors that form a cohesive palette for the requested style."
        }
      },
      required: ["suggestions", "colorPalette"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Analyze this room photo. I want to renovate the ${focusArea} into ${targetStyle} style. Provide specific advice on what to change in the ${focusArea}. Also provide a professional color palette with hex codes and usage instructions. Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    return JSON.parse(text) as ArAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing room:", error);
    throw error;
  }
};
