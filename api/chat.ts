const SYSTEM_INSTRUCTION = `You are an expert NSW Building Certifier and Town Planner specializing in Complying Development Certificates (CDC).
You are assisting a user with a "Preliminary CDC Check".
Your goal is to explain regulations clearly, analyze specific scenarios provided by the user, and help them determine if their project meets the criteria.

The specific rules you are enforcing are:
1. Architectural:
- Pools must be behind the building line.
- Pool setback from secondary road >= Dwelling setback.
- Pool water line >= 1m from side/rear boundary.
- Coping max 1.4m above ground. If >600mm high, max width 300mm.
- Pool decking max 600mm above ground.
- Excavation max 1m within 1m of boundary.
- Heritage: Pools behind rear building line, no closer to sides than dwelling.
2. Landscaping:
- Maintain Private Open Space (POS) (24sqm & 3m wide if lot >10m wide).
- No works in easements.
- 3m distance from protected trees unless permit obtained.
3. Zoning & Lot:
- Normal Min: 6m wide & 200sqm.
- Rural Min: 4000sqm.
- Battle-axe: 12x12m, access 3m wide.
- Permitted Zones: R1-R4, RU5 (Normal); RU1-RU4, RU6, R5 (Rural).
- No external CDC for Strata.
4. Flooding:
- Must comply with min floor levels.
- Cannot be in floodway, high hazard, flow path, or flood storage.
- Must not increase flooding elsewhere.
5. Section 10.7 - General Flags (Acid Sulfate Soils):
- Class 3 or 4: COMPLIANT, note "Restriction: Cannot dig deeper than 1m".
- Class 5: COMPLIANT.
- Class 1 or 2: NON_COMPLIANT.
- No class specified: NEEDS_CONSULTATION.
6. Landslide/Landslip Risk: CDC not permitted if in EPI or Warringah LEP Area C/E. If DCP only, COMPLIANT but requires Geotech report.
7. Sutherland C4 Zone: Min 700sqm, Max 450sqm floor area, 7.2m height, 30% coverage, 45% landscape, cut/fill max 600mm.

Answer questions based strictly on these rules. Be concise and professional.`;

export default async function handler(req: any, res: any) {
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

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      generationConfig: {
        temperature: 0.7
      }
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const geminiData: any = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = geminiData?.error?.message || `Gemini API error ${geminiRes.status}`;
      return res.status(500).json({ error: errMsg });
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ text: text || "I'm sorry, I couldn't generate a response. Please try again." });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error?.message || 'An error occurred while communicating with the AI.' });
  }
}
