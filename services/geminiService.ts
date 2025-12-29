import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Verifies a screenshot using Gemini Vision capabilities.
 */
export const verifyScreenshot = async (
  base64Image: string,
  type: 'ORDER' | 'REVIEW',
  productName: string,
  platform: string
): Promise<VerificationResult> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    let prompt = "";
    
    if (type === 'ORDER') {
      prompt = `
        Analyze this image. It is supposed to be a screenshot of an order confirmation from ${platform}.
        
        Strictly verify the following:
        1. Does the image look like an order confirmation page or receipt?
        2. Is the product "${productName}" (or something very similar) visible in the item list?
        3. Is there an order number or confirmation status visible?
        
        Return a JSON object with 'valid' (boolean) and 'reason' (string explaining why).
      `;
    } else {
      prompt = `
        Analyze this image. It is supposed to be a screenshot of a published product review on ${platform}.
        
        Strictly verify the following:
        1. Does the image look like a customer review section?
        2. Is the review associated with the product "${productName}"?
        3. Is there a visible review text or star rating?
        
        Return a JSON object with 'valid' (boolean) and 'reason' (string explaining why).
      `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, API handles standard types
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            detectedText: { type: Type.STRING, description: "A brief summary of what text was actually found." }
          },
          required: ["valid", "reason"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as VerificationResult;
    return result;

  } catch (error) {
    console.error("Gemini verification failed:", error);
    return {
      valid: false,
      reason: "AI Verification service is temporarily unavailable or could not process the image. Please try uploading a clearer image."
    };
  }
};