// Chemical incompatibility matrix
// Groups that should NOT be stored together
export const incompatibilityMatrix: Record<string, string[]> = {
  'strong_acid': ['strong_base', 'oxidizer', 'strong_oxidizer', 'alcohol', 'amine', 'halogenated'],
  'strong_base': ['strong_acid', 'acid', 'organic_acid', 'halogen', 'oxidizer'],
  'strong_oxidizer': ['alcohol', 'aldehyde', 'amine', 'ether', 'ketone', 'sulfur', 'alkane', 'aromatic', 'organic_acid'],
  'oxidizer': ['alcohol', 'aldehyde', 'amine', 'ether', 'ketone', 'sulfur', 'alkane', 'aromatic'],
  'halogen': ['amine', 'strong_base', 'alcohol', 'aldehyde', 'aromatic'],
  'amine': ['strong_acid', 'strong_oxidizer', 'oxidizer', 'halogen', 'aldehyde', 'epoxide'],
  'alcohol': ['strong_acid', 'strong_oxidizer', 'oxidizer', 'halogen', 'nitro'],
  'aldehyde': ['strong_oxidizer', 'oxidizer', 'halogen', 'amine', 'strong_base'],
  'ketone': ['strong_oxidizer', 'oxidizer', 'strong_base'],
  'ether': ['strong_oxidizer', 'oxidizer', 'strong_acid'],
  'epoxide': ['strong_acid', 'strong_base', 'amine'],
  'nitrile': ['strong_acid', 'strong_base'],
  'nitro': ['strong_acid', 'alcohol', 'amine'],
  'sulfur': ['strong_oxidizer', 'oxidizer', 'strong_acid'],
  'aromatic': ['strong_oxidizer', 'oxidizer'],
  'alkane': ['strong_oxidizer', 'oxidizer'],
  'halogenated': ['strong_acid', 'strong_base', 'amine'],
  'acid': ['strong_base', 'amine'],
  'organic_acid': ['strong_base', 'strong_oxidizer'],
  'base': ['strong_acid', 'acid'],
  'ester': ['strong_oxidizer', 'strong_base'],
  'amide': ['strong_acid', 'strong_oxidizer'],
};

export interface Chemical {
  id: string;
  name: string;
  cas_number: string;
  flash_point: number | null;
  boiling_point: number | null;
  idlh_ppm: number | null;
  reactivity_group: string;
  material_factor: number | null;
  heat_of_combustion: number | null;
}

export interface InspectionChemical {
  id?: string;
  chemical: Chemical;
  quantity_kg: number;
  storage_temp_c: number;
  pressure_atm: number;
}

export interface RiskFinding {
  finding_type: string;
  severity: 'critical' | 'high' | 'pass';
  title: string;
  description: string;
  recommendation: string;
  score?: number;
}

// Check for chemical incompatibilities
export function detectIncompatibilities(chemicals: InspectionChemical[]): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const groups = chemicals.map(c => ({
    name: c.chemical.name,
    group: c.chemical.reactivity_group,
  }));

  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const group1 = groups[i].group;
      const group2 = groups[j].group;
      
      const incompatible1 = incompatibilityMatrix[group1] || [];
      const incompatible2 = incompatibilityMatrix[group2] || [];
      
      if (incompatible1.includes(group2) || incompatible2.includes(group1)) {
        findings.push({
          finding_type: 'incompatibility',
          severity: 'high',
          title: 'Chemical Incompatibility Detected',
          description: `${groups[i].name} (${group1}) and ${groups[j].name} (${group2}) should not be stored in close proximity.`,
          recommendation: 'Separate storage areas by at least 20 feet or use physical barriers. Ensure spill containment prevents mixing.',
        });
      }
    }
  }

  if (findings.length === 0) {
    findings.push({
      finding_type: 'incompatibility',
      severity: 'pass',
      title: 'Chemical Compatibility',
      description: 'No incompatible chemical combinations detected.',
      recommendation: 'Continue to maintain proper chemical segregation practices.',
    });
  }

  return findings;
}

// Toxic Load Analysis based on IDLH thresholds
// Simplified: if total toxic load exceeds threshold, flag as risk
export function analyzeToxicLoad(chemicals: InspectionChemical[], facilityVolume: number = 10000): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  for (const chem of chemicals) {
    if (!chem.chemical.idlh_ppm) continue;
    
    // Simplified calculation: quantity relative to IDLH
    // Higher quantity and lower IDLH = higher risk
    const toxicityFactor = chem.quantity_kg / (chem.chemical.idlh_ppm * 0.01);
    
    if (toxicityFactor > 50) {
      findings.push({
        finding_type: 'toxic_load',
        severity: 'critical',
        title: 'Critical Toxic Load',
        description: `${chem.chemical.name} inventory (${chem.quantity_kg} kg) significantly exceeds IDLH threshold (${chem.chemical.idlh_ppm} ppm) for facility size.`,
        recommendation: 'Implement continuous gas detection system, emergency ventilation, and enhanced PPE requirements. Review containment measures.',
        score: toxicityFactor,
      });
    } else if (toxicityFactor > 20) {
      findings.push({
        finding_type: 'toxic_load',
        severity: 'high',
        title: 'Elevated Toxic Load',
        description: `${chem.chemical.name} inventory may pose inhalation risk if released. IDLH: ${chem.chemical.idlh_ppm} ppm.`,
        recommendation: 'Ensure proper ventilation and gas detection. Consider reducing inventory or improving containment.',
        score: toxicityFactor,
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      finding_type: 'toxic_load',
      severity: 'pass',
      title: 'Toxic Load Analysis',
      description: 'Chemical inventories are within acceptable limits for facility size.',
      recommendation: 'Maintain current inventory management practices.',
    });
  }

  return findings;
}

// Dow Fire & Explosion Index (F&EI) - Simplified version
// Based on material factor and process conditions
export function calculateDowFEI(chemicals: InspectionChemical[]): RiskFinding {
  if (chemicals.length === 0) {
    return {
      finding_type: 'dow_fei',
      severity: 'pass',
      title: 'Dow F&EI Score',
      description: 'No flammable materials to assess.',
      recommendation: 'No action required.',
      score: 0,
    };
  }

  // Calculate base material factor (MF) - use highest
  let maxMaterialFactor = 1;
  let dominantChemical = chemicals[0].chemical.name;
  
  for (const chem of chemicals) {
    const mf = chem.chemical.material_factor || 1;
    if (mf > maxMaterialFactor) {
      maxMaterialFactor = mf;
      dominantChemical = chem.chemical.name;
    }
  }

  // General Process Hazards Factor (F1)
  // Simplified: based on temperature and pressure
  let f1 = 1.0;
  
  for (const chem of chemicals) {
    // High temperature penalty
    if (chem.storage_temp_c > 60) f1 += 0.25;
    if (chem.storage_temp_c > 100) f1 += 0.25;
    
    // Pressure penalty
    if (chem.pressure_atm > 1) f1 += 0.3;
    if (chem.pressure_atm > 5) f1 += 0.5;
    
    // Flash point penalty
    if (chem.chemical.flash_point !== null) {
      if (chem.chemical.flash_point < chem.storage_temp_c) {
        f1 += 0.5; // Material can flash at storage temp
      }
    }
  }

  // Special Process Hazards Factor (F2)
  let f2 = 1.0;
  const totalQuantity = chemicals.reduce((sum, c) => sum + c.quantity_kg, 0);
  
  // Quantity penalties
  if (totalQuantity > 1000) f2 += 0.25;
  if (totalQuantity > 5000) f2 += 0.25;
  if (totalQuantity > 10000) f2 += 0.5;

  // Calculate F&EI
  const processUnitHazardFactor = f1 * f2;
  const fei = maxMaterialFactor * processUnitHazardFactor;

  let severity: 'critical' | 'high' | 'pass';
  let description: string;
  let recommendation: string;

  if (fei > 159) {
    severity = 'critical';
    description = `Severe fire/explosion hazard. Dominant risk from ${dominantChemical}. F&EI indicates extreme loss potential.`;
    recommendation = 'Immediate review required. Implement explosion-proof equipment, blast walls, and enhanced fire suppression. Consider process redesign.';
  } else if (fei > 127) {
    severity = 'high';
    description = `Serious fire/explosion hazard. Moderate to high loss potential from ${dominantChemical}.`;
    recommendation = 'Review firewater system capacity. Ensure explosion venting. Implement hot work permits and ignition source control.';
  } else if (fei > 96) {
    severity = 'high';
    description = `Moderate fire/explosion hazard from ${dominantChemical}. Intermediate loss potential.`;
    recommendation = 'Verify fire suppression adequacy. Review emergency response procedures.';
  } else {
    severity = 'pass';
    description = `Light fire/explosion hazard. F&EI indicates acceptable risk level.`;
    recommendation = 'Maintain standard fire safety practices.';
  }

  return {
    finding_type: 'dow_fei',
    severity,
    title: `Dow F&EI Score: ${Math.round(fei)}`,
    description,
    recommendation,
    score: fei,
  };
}

// Stoessel Criticality Classes for Reactive Hazards
// Based on reaction runaway potential
export function assessStoesselCriticality(chemicals: InspectionChemical[]): RiskFinding {
  // Check for reactive chemical combinations
  const reactiveGroups = ['epoxide', 'strong_oxidizer', 'oxidizer', 'nitrile', 'nitro', 'aldehyde'];
  const hasReactive = chemicals.some(c => reactiveGroups.includes(c.chemical.reactivity_group));
  
  if (!hasReactive) {
    return {
      finding_type: 'stoessel',
      severity: 'pass',
      title: 'Reactive Hazard (Stoessel)',
      description: 'No highly reactive chemicals identified. Low runaway reaction risk.',
      recommendation: 'Maintain standard temperature monitoring.',
    };
  }

  // Check temperature margins
  let highRisk = false;
  let criticalChemical = '';
  
  for (const chem of chemicals) {
    if (chem.chemical.boiling_point && chem.storage_temp_c > chem.chemical.boiling_point * 0.7) {
      highRisk = true;
      criticalChemical = chem.chemical.name;
    }
    
    // Epoxides and strong oxidizers at elevated temps are critical
    if (['epoxide', 'strong_oxidizer'].includes(chem.chemical.reactivity_group) && chem.storage_temp_c > 40) {
      highRisk = true;
      criticalChemical = chem.chemical.name;
    }
  }

  if (highRisk) {
    return {
      finding_type: 'stoessel',
      severity: 'high',
      title: 'Reactive Hazard (Stoessel)',
      description: `Elevated runaway reaction risk for ${criticalChemical}. Temperature margin is insufficient.`,
      recommendation: 'Implement redundant temperature monitoring, emergency cooling, and pressure relief. Review Maximum Temperature of Synthesis Reaction (MTSR).',
    };
  }

  return {
    finding_type: 'stoessel',
    severity: 'pass',
    title: 'Reactive Hazard (Stoessel)',
    description: 'Reactive chemicals present but temperature margins are adequate.',
    recommendation: 'Ensure continuous temperature monitoring and maintain cooling capacity.',
  };
}

// Run all risk screenings
export function runRiskScreening(chemicals: InspectionChemical[]): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  // Toxic Load Analysis
  findings.push(...analyzeToxicLoad(chemicals));
  
  // Chemical Incompatibility
  findings.push(...detectIncompatibilities(chemicals));
  
  // Dow F&EI
  findings.push(calculateDowFEI(chemicals));
  
  // Stoessel Criticality
  findings.push(assessStoesselCriticality(chemicals));
  
  // Sort by severity (critical first, then high, then pass)
  const severityOrder = { critical: 0, high: 1, pass: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return findings;
}
