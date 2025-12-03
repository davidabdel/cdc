import { ChecklistCategory, ComplianceStatus } from './types';

export const INITIAL_DATA: ChecklistCategory[] = [
  {
    id: 'docs',
    title: 'Documentation & Planning Certificates',
    items: [
      {
        id: 'sec_10_7_complying_dev',
        text: 'Section 10.7 - Complying Development Permitted',
        subtext: 'Must state: "Complying Development... may be carried out" under Housing Code/Low Rise Housing Diversity Code etc.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'sec_10_7_bushfire',
        text: 'Section 10.7 - Bushfire Check',
        subtext: 'Must state: "None of the land is bushfire prone land".',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'section_10_7',
        text: 'Section 10.7 - General Flags',
        subtext: 'Check for other flags: Acid Sulfate Soils, Heritage, Biodiversity, etc.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'title_search',
        text: 'Title Search',
        subtext: 'Check for ownership and encumbrances.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: '88b',
        text: '88b Restrictions',
        subtext: 'Check instrument for covenants or easements.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'dp_plan',
        text: 'Deposited Plan (DP)',
        subtext: 'Verify dimensions and boundaries.',
        status: ComplianceStatus.PENDING,
        notes: ''
      }
    ]
  },
  {
    id: 'zoning',
    title: 'Lot Specifications & Zoning',
    items: [
      {
        id: 'lot_size_normal',
        text: 'Normal Lot Dimensions',
        subtext: 'Min 6m wide & 200m².',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'lot_size_rural',
        text: 'Rural Lot Dimensions',
        subtext: 'Min 4000m².',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'battle_axe',
        text: 'Battle Axe Lots',
        subtext: 'Min 12m x 12m area. Access laneway min 3m wide.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'zoning_check',
        text: 'Zoning Compliance',
        subtext: 'Normal: R1, R2, R3, R4, RU5. Rural: RU1, RU2, RU3, RU4, RU6, R5.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'strata',
        text: 'Strata Check',
        subtext: 'External CDC not permitted for Strata lots (e.g., townhouses).',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'vacant_lot',
        text: 'Vacant Lot Pre-requisite',
        subtext: 'Requires copy of dwelling approval (CDC or DA) if lot is vacant.',
        status: ComplianceStatus.PENDING,
        notes: ''
      }
    ]
  },
  {
    id: 'flood',
    title: 'Flooding & Environmental',
    items: [
      {
        id: 'flood_info',
        text: 'Council Flood Information',
        subtext: 'Obtain flood information from council.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'floor_levels',
        text: 'Flood Engineer Cert (Floor Levels)',
        subtext: 'Confirm compliance with 3.5 specifying minimum floor levels.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'flood_zones',
        text: 'Flood Engineer Cert (Zones)',
        subtext: 'Certify NOT in: flood storage, floodway, flow path, high hazard, or high risk area.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'flood_impact',
        text: 'Flood Engineer Cert (Impact)',
        subtext: 'Confirm development does not result in increased flooding elsewhere.',
        status: ComplianceStatus.PENDING,
        notes: ''
      }
    ]
  },
  {
    id: 'arch',
    title: 'Architectural Plans & Pool Siting',
    items: [
      {
        id: 'pool_building_line',
        text: 'Pool Location (Building Line)',
        subtext: 'Swimming pool must be located behind the building line of the dwelling house.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'pool_secondary_road',
        text: 'Pool Setback (Secondary Road)',
        subtext: 'Minimum setback for a pool from a secondary road is the setback of the dwelling house from the secondary road.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'pool_water_line',
        text: 'Pool Water Line Setback',
        subtext: 'Water line must have a setback of at least 1m from a side or rear boundary.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'coping_height',
        text: 'Coping Dimensions',
        subtext: 'Coping must not be >1.4m above ground level. If >600mm above ground, max width is 300mm.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'decking_height',
        text: 'Decking Height',
        subtext: 'Decking around a swimming pool must not be more than 600mm above ground level (existing).',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'pool_heritage',
        text: 'Heritage Area Pool Siting',
        subtext: 'In heritage areas: Must be behind rear building line and no closer to side boundaries than the dwelling.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'excavation',
        text: 'Excavation Limits',
        subtext: 'Maximum 1m excavation within 1m of boundary for retaining walls, pools, etc.',
        status: ComplianceStatus.PENDING,
        notes: ''
      }
    ]
  },
  {
    id: 'landscaping',
    title: 'Landscaping & Site',
    items: [
      {
        id: 'pos',
        text: 'Private Open Space (POS)',
        subtext: 'Maintain POS compliance (e.g., 24m² & 3m wide if lot >10m wide).',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'landscaped_area',
        text: 'Minimum Landscaped Area',
        subtext: 'Maintain minimum landscaped area to comply with clause.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'easement',
        text: 'Easements',
        subtext: 'No works permitted in an easement.',
        status: ComplianceStatus.PENDING,
        notes: ''
      },
      {
        id: 'trees',
        text: 'Protected Trees',
        subtext: 'Requires council permit for removal OR development must maintain 3m from base of protected trees.',
        status: ComplianceStatus.PENDING,
        notes: ''
      }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `You are an expert NSW Building Certifier and Town Planner specializing in Complying Development Certificates (CDC).
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
- If the property is identified as potentially containing Acid Sulfate Soils:
  - Class 3 or Class 4: MARK AS COMPLIANT (PASS), but add a note: "Restriction: Cannot dig deeper than 1m".
  - Class 5: MARK AS COMPLIANT (PASS).
  - Class 1 or Class 2: MARK AS NON_COMPLIANT (FAIL).
  - If NO Class is specified: MARK AS NEEDS_CONSULTATION (CHECK) and note "Pass subject to manual check".
- If NOT identified as containing Acid Sulfate Soils: MARK AS COMPLIANT.

Answer questions based strictly on these rules. If a user asks something outside this scope, answer generally but advise consulting a professional surveyor or certifier. Be concise and professional.`;