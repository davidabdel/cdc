export const maxDuration = 60;

const COMPLIANCE_STATUS_VALUES = ['PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'NEEDS_CONSULTATION'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { files, currentChecklist } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Files are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key is missing. Please check Vercel environment variables.' });
    }

    const checklistStructure = currentChecklist.map((cat: any) => ({
      category: cat.title,
      items: cat.items.map((item: any) => ({
        id: item.id,
        requirement: item.text,
        details: item.subtext
      }))
    }));

    const fileParts = files.map((file: any) => {
      const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
      return {
        inline_data: {
          mime_type: file.type,
          data: base64Data
        }
      };
    });

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

    3. For item 'sec_10_7_landslide' (Landslide/Landslip Risk):
       - Look for "Landslide" or "Landslip" in Section 10.7.
       - If identified as susceptible to landslide risk:
         - Check if it is identified in an EPI (Environmental Planning Instrument like LEP, SEPP).
         - For Warringah LEP 2011, check if it's in "Area C" or "Area E" on the Landslip Risk Map.
         - If in an EPI or Warringah Area C/E, mark as NON_COMPLIANT.
         - If identified ONLY in a DCP (Development Control Plan) and NOT in an EPI, mark as COMPLIANT but add a CRITICAL NOTE: "Required: Geotech report from a Geotech engineer providing recommendations, which must be considered by the structural engineer."
       - If NOT identified as susceptible to landslide/landslip risk, mark as COMPLIANT.

    4. For item 'sec_sutherland_c4' (Sutherland C4 Zone):
       - If the land is identified as Zone C4 in Sutherland Shire:
         - Check for "Natural Landform Map" or "Clause 6.8" restrictions in Section 10.7. If present, mark as NON_COMPLIANT.
         - Verify Lot Size >= 700sqm.
         - Summarize standards: Max 450sqm floor area, 7.2m height, 30% coverage, 45% landscape area.
         - Mention that cut/fill is limited to 600mm.
       - If NOT in Sutherland C4, mark as NOT_APPLICABLE.

    5. For item 'section_10_7' (General Flags) - Acid Sulfate Soils:
       - Look for "Acid Sulfate Soils" or similar text.
       - If Class 3 or Class 4: Mark as COMPLIANT, but MUST add note: "Restriction: Cannot dig deeper than 1m".
       - If Class 5: Mark as COMPLIANT.
       - If Class 1 or Class 2: Mark as NON_COMPLIANT.
       - If identified as containing Acid Sulfate Soils but NO Class is specified: Mark as NEEDS_CONSULTATION and note "Pass subject to manual check".
       - If NOT identified as containing Acid Sulfate Soils: Mark as COMPLIANT (unless other flags exist).

    6. For item '88b' (88b Restrictions):
       - If the 88b instrument lists restrictions (e.g. "Restrictions on the Use of Land"), you MUST extract the text/description of each relevant restriction.
       - Do NOT just list the item numbers (e.g. "Items 12, 14").
       - Format as: "Item [Number]: [Brief Description of Restriction]".
       - Example: "Item 12: No fence to be erected within the easement area."
       - If there are many, summarize the key ones relevant to development (easements, building zones, etc.).

    For each item in the checklist:
    1. Search the documents for evidence (e.g., setbacks shown on plans, zoning on certificate).
    2. Determine the status: COMPLIANT, NON_COMPLIANT, NEEDS_CONSULTATION (if ambiguous or missing info), or NOT_APPLICABLE.
    3. Provide a clear "note" citing the specific evidence found.

    Formatting Rules for "notes":
    - If multiple pieces of evidence exist or you need to explain reasoning, use a multi-line format with bullet points.
    - Keep the lines concise so they are easy to read.
    - Reference specific page numbers or drawing numbers where possible (e.g. "Plan A01").

    Checklist Structure to Fill:
    ${JSON.stringify(checklistStructure, null, 2)}

    Return the data as a JSON Object containing "metadata" and "results".
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            ...fileParts,
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            metadata: {
              type: 'OBJECT',
              properties: {
                ownerName: { type: 'STRING', description: 'Name of the property owner(s)' },
                address: { type: 'STRING', description: 'Full property address' },
                lotDp: { type: 'STRING', description: 'Lot and DP/SP number (e.g. Lot 1 DP 123456)' }
              },
              required: ['ownerName', 'address', 'lotDp']
            },
            results: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  status: { type: 'STRING', enum: COMPLIANCE_STATUS_VALUES },
                  notes: { type: 'STRING' }
                },
                required: ['id', 'status', 'notes']
              }
            }
          },
          required: ['metadata', 'results']
        }
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
    if (!text) {
      return res.status(500).json({ error: 'No content returned from Gemini', raw: geminiData });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error('Document Analysis Error:', error);
    return res.status(500).json({ error: error?.message || 'An error occurred during document analysis.' });
  }
}
