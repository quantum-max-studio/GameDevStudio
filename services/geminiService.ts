import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

// Initialize Gemini Client
// Note: API_KEY is expected to be in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const TEXT_MODEL = "gemini-2.5-flash";
const CODE_MODEL = "gemini-3-pro-preview"; // Better for reasoning/coding
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Generates code based on game development context.
 */
export const streamCodeGeneration = async (
  history: ChatMessage[],
  newMessage: string,
  currentCode: string
): Promise<AsyncGenerator<string, void, unknown>> => {
  
  // Filter history for API format
  const historyForApi = history
    .filter(msg => msg.role !== MessageRole.SYSTEM && !msg.isLoading)
    .map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const systemInstruction = `You are an expert Game Development AI Assistant (GameGen Code).
  Your goal is to help the user write scripts, shaders, and game logic.
  You are integrated into a Game IDE.
  
  Current Editor Content:
  \`\`\`
  ${currentCode.substring(0, 5000)}... (truncated if too long)
  \`\`\`
  
  When asked to write code, provide the full code block.
  Focus on clean, performant code suitable for game engines like Godot, Unity, or generic WebGL/Canvas.
  If the user asks to "fix" or "change" the code, assume they mean the Current Editor Content.
  `;

  const chat = ai.chats.create({
    model: CODE_MODEL,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Lower temperature for more precise code
    },
    history: historyForApi,
  });

  const streamResult = await chat.sendMessageStream({ message: newMessage });

  async function* generator() {
    for await (const chunk of streamResult) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
  }

  return generator();
};

/**
 * Generates game assets (Images) or descriptions for other types.
 */
export const generateAssetHelp = async (
  newMessage: string
): Promise<{ text: string; imageUrl?: string }> => {
  
  // Check if the user wants an image generated
  const isImageRequest = /sprite|texture|image|background|icon|ui|character|concept/i.test(newMessage);

  if (isImageRequest) {
      try {
          const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: {
                parts: [{ text: `Generate a high quality game asset: ${newMessage}. solid background if not specified otherwise.` }]
            },
            config: {
                // imageConfig is optional for flash-image but we use the model specifically designed for it
            }
          });

          let imageUrl = undefined;
          let textResponse = "Here is your generated asset.";

          if (response.candidates && response.candidates[0].content.parts) {
              for (const part of response.candidates[0].content.parts) {
                 if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                 } else if (part.text) {
                    textResponse = part.text;
                 }
              }
          }
          return { text: textResponse, imageUrl };

      } catch (error) {
          console.error("Image generation failed", error);
          return { text: "I tried to generate an image but encountered an error. Please try again." };
      }
  } else {
      // Normal text chat for Asset Advisor
      const response = await ai.models.generateContent({
          model: TEXT_MODEL,
          contents: newMessage,
          config: {
              systemInstruction: "You are an expert Game Asset Consultant. Help the user plan their game's art style, sound design, and 3D pipeline. You cannot generate 3D models or Audio files directly yet, but you can describe them or generate 2D concept art/textures."
          }
      });
      return { text: response.text || "I couldn't process that request." };
  }
};
