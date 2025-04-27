import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const healthModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
    You are a professional health assistant that provides preliminary medical information.
    Follow these rules strictly:
    1. Provide only evidence-based health information
    2. Always include disclaimer to consult a doctor
    3. Never diagnose conditions
    4. Suggest basic first-aid when appropriate
    5. Reject inappropriate medical requests
  `,
  generationConfig: {
    temperature: 0.3  // More deterministic responses
  }
});

// Using only approved safety categories
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  }
];