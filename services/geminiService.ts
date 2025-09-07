import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CraftedElement } from "../types";

const getAi = (apiKey: string) => new GoogleGenAI({ apiKey });

const extractJson = (text: string): any => {
    // First, try to find a JSON markdown block
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.warn("Found JSON markdown block but failed to parse:", match[1], e);
        }
    }
    
    // If no markdown block, or if parsing failed, try to parse the whole string
    try {
        const cleanedText = text.trim();
        if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
             return JSON.parse(cleanedText);
        }
    } catch (e) {
        // This is expected if the text is not JSON, so no log needed
    }

    console.warn("Could not extract valid JSON from text:", text);
    return null;
};


export const generateInitialInfo = async (apiKey: string, imageB64: string, mimeType: string): Promise<{ title: string; description: string; }> => {
    const ai = getAi(apiKey);
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: imageB64, mimeType } },
                { text: 'Generate a short, 2-3 word title and a brief, one-sentence description for this image. Return the response as a JSON object with "title" and "description" keys.' }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        }
    });

    const data = JSON.parse(response.text);
    return { title: data.title, description: data.description };
};

export const combineElements = async (apiKey: string, element1: CraftedElement, element2: CraftedElement): Promise<{ title: string; description: string; imageB64: string; mimeType: string }> => {
    const ai = getAi(apiKey);
    const model = 'gemini-2.5-flash-image-preview';

    // Enhanced prompt for natural, cohesive image fusion
    const prompt = `Create a completely NEW, original image that naturally combines the essence of both concepts below. This should NOT be a collage, overlay, or simple combination of the two images. Instead, imagine what would exist if these two concepts were naturally fused together in reality.

Important guidelines:
- DO NOT simply overlay, superimpose, or paste one image onto another
- DO NOT create a split-screen or side-by-side combination  
- CREATE a single, unified scene where both concepts naturally coexist
- The result should look like a real, coherent photograph or artwork
- Blend the visual styles, colors, and elements harmoniously
- Make it look natural and believable, not edited or artificial
- Focus on creating something entirely new that embodies both concepts
- Use seamless integration where elements flow together naturally

Concept 1 ("${element1.title}"): ${element1.description}
Concept 2 ("${element2.title}"): ${element2.description}

Generate an image that represents what would naturally result from combining these concepts. Think creatively about how they would merge in the real world - for example, if combining "fire" and "water", you might create steam, hot springs, or a volcanic geyser. After creating the image, provide a JSON response with "title" and "description" for the new creation.`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            // Keep images first to provide visual context before the instructions.
            parts: [
                { inlineData: { data: element1.imageB64, mimeType: element1.mimeType } },
                { inlineData: { data: element2.imageB64, mimeType: element2.mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let title = "Untitled";
    let description = "No description.";
    let newImageB64 = "";
    let newMimeType = "image/png";

    if (!response.candidates?.[0]?.content?.parts) {
        console.error("Invalid API response structure", response);
        throw new Error("Invalid API response: No content parts found.");
    }

    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            const jsonData = extractJson(part.text);
            if (jsonData) {
                title = jsonData.title || title;
                description = jsonData.description || description;
            }
        } else if (part.inlineData) {
            newImageB64 = part.inlineData.data;
            newMimeType = part.inlineData.mimeType;
        }
    }

    if (!newImageB64) {
        console.error("API did not return an image. Full response:", JSON.stringify(response, null, 2));
        throw new Error("API did not return a new image.");
    }

    return { title, description, imageB64: newImageB64, mimeType: newMimeType };
};