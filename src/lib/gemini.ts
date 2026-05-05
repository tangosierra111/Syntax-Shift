import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function convertCode(
  sourceCode: string,
  sourceLang: string,
  targetLang: string
) {
  if (!sourceCode.trim()) return "";

  const prompt = `Convert the following ${sourceLang} code to ${targetLang}. 
Only provide the resulting code without any explanations, markdown markers, or backticks unless they are part of the code itself.
If the conversion is impossible or the input is not code, return an error message starting with "ERROR: ".

Source Code:
${sourceCode}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for high precision in coding tasks
      },
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to convert code. Please check your API key and input.");
  }
}

export async function explainCode(code: string, lang: string) {
  const prompt = `Explain this ${lang} code briefly and clearly in bullet points.

Code:
${code}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate explanation.";
  }
}
