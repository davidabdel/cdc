export const maxDuration = 60;

const COMPLIANCE_STATUS_VALUES = ['PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'NEEDS_CONSULTATION'];

export default async function handler(req, res) {
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

    const checklistStructure = currentChecklist.map((cat) => ({
      category: cat.title,
      items: cat.items.map((item) => ({
        id: item.id,
        requirement: item.text,
        details: item.subtext
      }))
    }));

    const fileParts = files.map((file) => {
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
1. Extract Project Metadata: Find the Owner's Name, Property Address, and Lot/DP details.
2. Review Compliance: Cross-reference the documents against the following Checklist Structure.

CRITICAL RULES FOR SECTION 10.7 CERTIFICATES:
1. For item 'sec_10_7_complying_dev': Look for "may be carried out" = COMPLIANT. "may not be carried out" = NON_COMPLIANT.
2. For item 'sec_10_7_bushfire': "None of the land is bushfire prone land" = COMPLIANT. Land IS bushfire prone = NEEDS_CONSULTATION.
3. For item 'sec_10_7_landslide': If susceptible and in EPI or Warringah LEP Area C/E = NON_COMPLIANT. If DCP only = COMPLIANT with note "Required: Geotech report".
4. For item 'sec_sutherland_c4': If Zone C4 Sutherland: check Natural Landform Map, min 700sqm, max 450sqm floor area, 7.2m height, 30% coverage, 45% landscape, cut/fill 600mm. If not C4 = NOT_APPLICABLE.
5. For item 'section_10_7' Acid Sulfate Soils: Class 3/4 = COMPLIANT + "Cannot dig deeper than 1m". Class 5 = COMPLIANT. Class 1/2 = NON_COMPLIANT. No class = NEEDS_CONSULTATION. None found = COMPLIANT.
6. For item '88b': Extract full description of each restriction. Format: "Item [Number]: [Description]".

For each checklist item: determine COMPLIANT, NON_COMPLIANT, NEEDS_CONSULTATION, or NOT_APPLICABLE. Provide evidence-based notes citing page/drawing numbers.

Checklist Structure:
${JSON.stringify(checklistStructure, null, 2)}

Return JSON with "metadata" and "results".`;

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
                ownerName: { type: 'STRING' },
                address: { type: 'STRING' },
                lotDp: { type: 'STRING' }
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

    if (!text) {
      return res.status(500).json({ error: 'No content returned from Gemini', detail: JSON.stringify(geminiData).substring(0, 500) });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Document Analysis Error:', error);
    return res.status(500).json({ error: (error && error.message) || 'An error occurred during document analysis.' });
  }
}
