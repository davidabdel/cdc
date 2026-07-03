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

CRITICAL RULES FOR POOL SITING (Site Plans / Architectural Plans):
7. TERMINOLOGY: A "spa pool", "swim spa", "above-ground spa", "plunge pool" or "swim gym" IS a swimming pool. Every pool siting rule applies equally to spas. Never treat a spa as exempt from the building line rule.
8. For item 'pool_building_line' — THIS IS THE MOST COMMON ERROR SOURCE. Follow this procedure strictly:
   a. First identify the PRIMARY ROAD BOUNDARY (the front boundary) of the lot. Evidence to look for: the named street, road pavement, footpath, kerb, driveway crossover, parked cars on the street, front doors of neighbouring dwellings. Your notes MUST state which boundary you identified as the front and what evidence supports it.
   b. The BUILDING LINE is the line of the dwelling wall that is closest to and faces the primary road.
   c. If ANY part of the pool/spa sits between the dwelling's front wall and the primary road boundary (i.e. in the front yard, forward of the building line), the item is NON_COMPLIANT. The note MUST begin with: "DA REQUIRED: The pool/spa is located forward of the building line. This development cannot be approved as a CDC."
   d. Only return COMPLIANT if the pool/spa is clearly and entirely behind the front building line AND you have identified the front boundary per (a).
   e. If you cannot determine the plan orientation, street location or building line with certainty, return NEEDS_CONSULTATION with the note "Manual check required: front boundary / building line could not be confidently determined from the plans."
   f. DO NOT assume the pool is in the rear yard. Aerial-photo site plans frequently show pools/spas proposed in FRONT yards. A setback dimension (e.g. "4.65m") does not tell you whether that boundary is the front or rear — verify against the road location.
9. For item 'pool_secondary_road' (corner lots): the pool setback from the secondary road must be >= the dwelling's setback from that road. If closer, NON_COMPLIANT with a note beginning "DA REQUIRED:".
10. For item 'pool_heritage': in a heritage conservation area the pool/spa must be behind the REAR building line and no closer to side boundaries than the dwelling. If not, NON_COMPLIANT with a note beginning "DA REQUIRED:".

For each checklist item: determine COMPLIANT, NON_COMPLIANT, NEEDS_CONSULTATION, or NOT_APPLICABLE. Provide evidence-based notes citing page/drawing numbers. Do not guess: if the documents do not contain enough evidence to decide an item, return NEEDS_CONSULTATION rather than COMPLIANT.

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
        temperature: 0,
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
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-pro'}:generateContent?key=${apiKey}`,
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
