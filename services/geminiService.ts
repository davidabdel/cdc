import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { ChecklistCategory, FileUpload, AnalysisResponse, ComplianceStatus } from '../types';

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!ai) {
    if (!apiKey) {
      console.error("API Key is missing. Please check your environment variables.");
      throw new Error("API Key is missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const initializeChat = async (): Promise<Chat> => {
  const instance = getAIInstance();
  chatSession = instance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
      throw new Error("Failed to initialize chat session.");
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI. Please ensure your API key is valid.";
  }
};

export const analyzeChecklistWithDocuments = async (
  files: FileUpload[],
  currentChecklist: ChecklistCategory[]
): Promise<AnalysisResponse | null> => {
  const instance = getAIInstance();

  // Prepare the file parts for the API
  const fileParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.data.split(',')[1] // Remove the data URL prefix (e.g., "data:image/png;base64,")
    }
  }));

  // Create a simplified version of the checklist for the AI to understand the structure
  const checklistStructure = currentChecklist.map(cat => ({
    category: cat.title,
    items: cat.items.map(item => ({
      id: item.id,
      requirement: item.text,
      details: item.subtext
    }))
  }));

  const prompt = `
    You are an expert NSW CDC Certifier. 
    I have uploaded architectural plans, Section 10.7 certificates, Title Searches or other project documents.
    
    Your task is twofold:
    1. Extract Project Metadata: Find the Owner's Name, Property Address, and Lot/DP details (usually on the Title Search or Section 10.7).
    2. Review Compliance: Cross-reference the documents against the following Checklist Structure.
    
    CRITICAL RULES FOR SECTION 10.7 CERTIFICATES:
    1. For item 'sec_10_7_complying_dev': Look specifically for the phrase "may be carried out" in relation to Complying Development under codes like Housing Code, Low Rise Housing Diversity Code, etc. 
       - If the document says it "may be carried out", mark as COMPLIANT. 
       - If it says "may not be carried out", mark as NON_COMPLIANT.
    
    2. For item 'sec_10_7_bushfire': Look specifically for the phrase "None of the land is bushfire prone land" or "NO" next to Bushfire Prone Land.
       - If the land is NOT bushfire prone, mark as COMPLIANT.
       - If the land IS bushfire prone, mark as NEEDS_CONSULTATION (or NON_COMPLIANT if strict).
    
    For each item in the checklist:
    1. Search the documents for evidence (e.g., setbacks shown on plans, zoning on certificate).
    2. Determine the status: COMPLIANT, NON_COMPLIANT, NEEDS_CONSULTATION (if ambiguous or missing info), or NOT_APPLICABLE.
    3. Provide a clear "note" citing the specific evidence found.
    
    Formatting Rules for "notes":
    - If multiple pieces of evidence exist or you need to explain reasoning, use a multi-line format with bullet points (e.g., "- Evidence A\n- Evidence B").
    - Keep the lines concise so they are easy to read.
    - Reference specific page numbers or drawing numbers where possible (e.g. "Plan A01").
    
    Checklist Structure to Fill:
    ${JSON.stringify(checklistStructure, null, 2)}
    
    Return the data as a JSON Object containing "metadata" and "results".
  `;

  try {
    const response = await instance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...fileParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                ownerName: { type: Type.STRING, description: "Name of the property owner(s)" },
                address: { type: Type.STRING, description: "Full property address" },
                lotDp: { type: Type.STRING, description: "Lot and DP/SP number (e.g. Lot 1 DP 123456)" }
              },
              required: ["ownerName", "address", "lotDp"]
            },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  status: { type: Type.STRING, enum: Object.values(ComplianceStatus) },
                  notes: { type: Type.STRING }
                },
                required: ["id", "status", "notes"]
              }
            }
          },
          required: ["metadata", "results"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AnalysisResponse;
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Document Analysis Error:", error);
    throw new Error("Failed to analyze documents. Please check file formats (PDF/Image) and try again.");
  }
};