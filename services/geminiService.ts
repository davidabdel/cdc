import { ChecklistCategory, FileUpload, AnalysisResponse, ChatMessage } from '../types';

let chatHistory: ChatMessage[] = [];

export const initializeChat = async (): Promise<void> => {
  chatHistory = [
    { role: 'model', text: 'Hello! I am your CDC Compliance Assistant. Ask me about pool setbacks, zoning rules, or specific regulations.', timestamp: new Date() }
  ];
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (chatHistory.length === 0) {
    await initializeChat();
  }
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Maintain history locally to send with next request
    chatHistory.push({ role: 'user', text: message, timestamp: new Date() });
    chatHistory.push({ role: 'model', text: data.text, timestamp: new Date() });
    
    return data.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat API Error:", error);
    return "An error occurred while communicating with the AI. Please try again.";
  }
};

export const analyzeChecklistWithDocuments = async (
  files: FileUpload[],
  currentChecklist: ChecklistCategory[]
): Promise<AnalysisResponse | null> => {
  // Filter out any files that might be problematic (e.g., empty data)
  const validFiles = files.filter(f => {
    const parts = f.data.split(',');
    return parts.length === 2 && parts[1].length > 0;
  });

  if (validFiles.length === 0) {
    throw new Error("No valid files to analyze. Please upload valid PDFs or Images.");
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: validFiles, currentChecklist })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || \`API returned \${response.status}\`);
    }

    return data as AnalysisResponse;
  } catch (error: any) {
    console.error("Document Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze documents. Please check file formats (PDF/Image) and try again.");
  }
};