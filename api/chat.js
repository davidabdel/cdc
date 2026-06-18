const SYSTEM_INSTRUCTION = `You are an expert NSW Building Certifier and Town Planner specializing in Complying Development Certificates (CDC). Answer questions about CDC rules concisely and professionally. Key rules: pools behind building line, water line 1m from boundary, coping max 1.4m, decking max 600mm, no works in easements, min lot 200sqm (6m wide), permitted zones R1-R4/RU5, no strata CDC. Acid Sulfate Soils Class 3/4 = pass with 1m dig limit, Class 1/2 = fail. Landslide in EPI = fail, DCP only = pass with geotech report required.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key is missing. Please check Vercel environment variables.' });
    }

    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const requestBody = {
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      generationConfig: { temperature: 0.7 }
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = (geminiData && geminiData.error && geminiData.error.message) || `Gemini API error ${geminiRes.status}`;
      return res.status(500).json({ error: errMsg });
    }

    const text = geminiData &&
      geminiData.candidates &&
      geminiData.candidates[0] &&
      geminiData.candidates[0].content &&
      geminiData.candidates[0].content.parts &&
      geminiData.candidates[0].content.parts[0] &&
      geminiData.candidates[0].content.parts[0].text;

    return res.status(200).json({ text: text || "I'm sorry, I couldn't generate a response. Please try again." });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: (error && error.message) || 'An error occurred while communicating with the AI.' });
  }
}
