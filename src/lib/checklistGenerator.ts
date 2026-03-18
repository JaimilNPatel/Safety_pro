/**
 * Dynamic Checklist Generator
 * Generates site-specific, chemical-specific, and equipment-specific checklists
 * based on inspection data
 */

import type { Chemical, InspectionChemical } from './riskCalculations';
import type { EquipmentData, ConditionResult } from './equipmentCondition';

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source_type: 'site' | 'chemical' | 'equipment' | 'general';
  source_reference: string;
  checked: boolean;
}

interface SiteInfo {
  name: string;
  site_type: string;
  location: string;
}

// Chemical-specific hazard checklists based on reactivity groups
const CHEMICAL_HAZARD_CHECKS: Record<string, { items: string[]; priority: 'critical' | 'high' | 'medium' }> = {
  'Flammable': {
    items: [
      'Verify explosion-proof electrical equipment in storage area',
      'Check grounding and bonding connections',
      'Confirm proper ventilation for vapor control',
      'Verify fire suppression system is functional',
      'Check static discharge precautions in place',
    ],
    priority: 'critical',
  },
  'Oxidizer': {
    items: [
      'Verify segregation from flammables and organics',
      'Check for contamination in storage containers',
      'Confirm proper labeling and placards',
      'Verify spill containment for oxidizing materials',
    ],
    priority: 'high',
  },
  'Corrosive': {
    items: [
      'Verify secondary containment is intact',
      'Check compatible materials in piping and storage',
      'Confirm neutralizing agents available',
      'Verify proper PPE for corrosive handling',
      'Check emergency shower and eyewash proximity',
    ],
    priority: 'high',
  },
  'Toxic': {
    items: [
      'Verify atmospheric monitoring equipment functional',
      'Check respiratory protection availability',
      'Confirm emergency evacuation routes clear',
      'Verify IDLH signage posted',
      'Check antidote/treatment supplies if applicable',
    ],
    priority: 'critical',
  },
  'Reactive': {
    items: [
      'Verify temperature control systems operational',
      'Check for incompatible chemical storage nearby',
      'Confirm pressure relief systems functional',
      'Verify quench/kill systems available',
      'Check runaway reaction procedures posted',
    ],
    priority: 'critical',
  },
  'Water-Reactive': {
    items: [
      'Verify dry storage conditions',
      'Check moisture detection/control systems',
      'Confirm water sources isolated from storage',
      'Verify special fire suppression (dry chemical/sand) available',
      'Check humidity monitoring in storage area',
    ],
    priority: 'critical',
  },
  'Pyrophoric': {
    items: [
      'Verify inert atmosphere in storage/handling',
      'Check for air ingress in transfer systems',
      'Confirm proper disposal procedures in place',
      'Verify immediate access to fire blankets/sand',
    ],
    priority: 'critical',
  },
};

// Site type specific checklists
const SITE_TYPE_CHECKS: Record<string, { category: string; items: string[] }[]> = {
  'Chemical Plant': [
    {
      category: 'Process Safety',
      items: [
        'Verify process safety information (PSI) is current',
        'Check hazard analysis documentation updated',
        'Confirm management of change (MOC) process followed',
        'Verify pre-startup safety review completed for modifications',
      ],
    },
    {
      category: 'Emergency Systems',
      items: [
        'Test emergency shutdown systems (ESD)',
        'Verify gas detection system calibration',
        'Check emergency flare system operational',
        'Confirm emergency response equipment accessible',
      ],
    },
  ],
  'Refinery': [
    {
      category: 'Hydrocarbon Safety',
      items: [
        'Check LEL monitoring in process areas',
        'Verify hot work permit system compliance',
        'Confirm safe work practices for tank operations',
        'Check vapor recovery system operational',
      ],
    },
    {
      category: 'Fire Prevention',
      items: [
        'Verify foam fire suppression system tested',
        'Check firewater system pressure adequate',
        'Confirm fire brigade equipment inspection current',
        'Verify fireproofing on critical structures',
      ],
    },
  ],
  'Pharmaceutical': [
    {
      category: 'GMP Compliance',
      items: [
        'Verify environmental controls (temp, humidity) in spec',
        'Check contamination prevention measures',
        'Confirm cleaning validation documentation current',
        'Verify equipment calibration certificates valid',
      ],
    },
    {
      category: 'Chemical Handling',
      items: [
        'Check solvent storage and handling procedures',
        'Verify potent compound containment measures',
        'Confirm waste segregation procedures followed',
      ],
    },
  ],
  'Storage Facility': [
    {
      category: 'Storage Integrity',
      items: [
        'Verify tank inspection reports current',
        'Check secondary containment capacity adequate',
        'Confirm inventory reconciliation performed',
        'Verify segregation of incompatible materials',
      ],
    },
    {
      category: 'Loading/Unloading',
      items: [
        'Check vapor control during transfers',
        'Verify spill response equipment at loading points',
        'Confirm driver/operator training documentation',
      ],
    },
  ],
  'Manufacturing': [
    {
      category: 'Machine Safety',
      items: [
        'Verify machine guarding intact and functional',
        'Check lockout/tagout (LOTO) compliance',
        'Confirm ergonomic assessments current',
        'Verify electrical panel access clear',
      ],
    },
  ],
  'Research Lab': [
    {
      category: 'Lab Safety',
      items: [
        'Verify fume hood face velocity in range',
        'Check chemical hygiene plan current',
        'Confirm lab specific emergency procedures posted',
        'Verify personal protective equipment adequate',
      ],
    },
  ],
};

// Equipment-specific checks based on type and condition
function getEquipmentChecks(
  equipment: EquipmentData,
  conditionResult: ConditionResult
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const baseId = `equip_${equipment.name.replace(/\s+/g, '_').toLowerCase()}`;
  
  // Add checks based on equipment type
  const typeChecks: Record<string, string[]> = {
    'Reactor': [
      'Verify agitator seal integrity',
      'Check reactor vessel thickness readings',
      'Confirm relief device setpoints',
      'Verify temperature and pressure interlocks',
    ],
    'Distillation Column': [
      'Check tray or packing condition',
      'Verify reboiler and condenser function',
      'Confirm level control calibration',
      'Check for fouling or corrosion indicators',
    ],
    'Heat Exchanger': [
      'Verify tube bundle condition (if accessible)',
      'Check for shell-side leaks',
      'Confirm thermal performance within spec',
      'Verify cleaning schedule compliance',
    ],
    'Storage Tank': [
      'Check tank shell condition and thickness',
      'Verify foundation and anchor bolts',
      'Confirm level instrumentation calibration',
      'Check vent and overfill protection',
    ],
    'Pump': [
      'Verify seal condition and leakage',
      'Check vibration levels',
      'Confirm motor and coupling alignment',
      'Verify suction and discharge pressure',
    ],
    'Compressor': [
      'Check oil level and condition',
      'Verify vibration and temperature',
      'Confirm relief valve function',
      'Check intercooler performance',
    ],
    'Safety Valve': [
      'Verify setpoint and capacity tags',
      'Check for signs of lift or leakage',
      'Confirm test/inspection records current',
      'Verify inlet/outlet piping unobstructed',
    ],
    'Control System': [
      'Verify I/O signal integrity',
      'Check UPS and backup power',
      'Confirm alarm setpoints appropriate',
      'Verify cybersecurity controls active',
    ],
  };
  
  const equipTypeChecks = typeChecks[equipment.equipment_type] || [];
  equipTypeChecks.forEach((item, idx) => {
    items.push({
      id: `${baseId}_type_${idx}`,
      category: `${equipment.equipment_type} Inspection`,
      item: `${equipment.name}: ${item}`,
      priority: equipment.is_safety_critical ? 'high' : 'medium',
      source_type: 'equipment',
      source_reference: equipment.name,
      checked: false,
    });
  });
  
  // Add checks based on condition issues
  if (conditionResult.overall_condition === 'poor' || conditionResult.overall_condition === 'critical') {
    items.push({
      id: `${baseId}_condition_urgent`,
      category: 'Urgent Equipment Actions',
      item: `${equipment.name}: Schedule immediate detailed inspection - condition is ${conditionResult.overall_condition}`,
      priority: 'critical',
      source_type: 'equipment',
      source_reference: equipment.name,
      checked: false,
    });
  }
  
  // Add checks for specific issues identified
  conditionResult.recommendations.forEach((rec, idx) => {
    if (rec.includes('overdue') || rec.includes('leak') || rec.includes('damage')) {
      items.push({
        id: `${baseId}_issue_${idx}`,
        category: 'Equipment Issues',
        item: `${equipment.name}: Address - ${rec}`,
        priority: rec.includes('severely') || rec.includes('leak') ? 'critical' : 'high',
        source_type: 'equipment',
        source_reference: equipment.name,
        checked: false,
      });
    }
  });
  
  return items;
}

/**
 * Generate chemical-specific checklist items
 */
function generateChemicalChecklist(chemicals: InspectionChemical[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const addedGroups = new Set<string>();
  
  chemicals.forEach((chem) => {
    const group = chem.chemical.reactivity_group;
    
    // Add group-specific checks (only once per group)
    if (!addedGroups.has(group) && CHEMICAL_HAZARD_CHECKS[group]) {
      const groupChecks = CHEMICAL_HAZARD_CHECKS[group];
      groupChecks.items.forEach((item, idx) => {
        items.push({
          id: `chem_group_${group.replace(/\s+/g, '_')}_${idx}`,
          category: `${group} Chemical Safety`,
          item,
          priority: groupChecks.priority,
          source_type: 'chemical',
          source_reference: group,
          checked: false,
        });
      });
      addedGroups.add(group);
    }
    
    // Add chemical-specific quantity checks
    if (chem.quantity_kg > 1000) {
      items.push({
        id: `chem_qty_${chem.chemical.id}`,
        category: 'Bulk Chemical Storage',
        item: `${chem.chemical.name}: Verify bulk storage integrity (${chem.quantity_kg} kg on site)`,
        priority: 'high',
        source_type: 'chemical',
        source_reference: chem.chemical.name,
        checked: false,
      });
    }
    
    // Check for temperature-sensitive storage
    if (chem.storage_temp_c < 0 || chem.storage_temp_c > 40) {
      items.push({
        id: `chem_temp_${chem.chemical.id}`,
        category: 'Temperature Control',
        item: `${chem.chemical.name}: Verify temperature control at ${chem.storage_temp_c}°C`,
        priority: 'high',
        source_type: 'chemical',
        source_reference: chem.chemical.name,
        checked: false,
      });
    }
    
    // Check for pressure storage
    if (chem.pressure_atm > 1.5) {
      items.push({
        id: `chem_press_${chem.chemical.id}`,
        category: 'Pressure Systems',
        item: `${chem.chemical.name}: Verify pressure vessel integrity (${chem.pressure_atm} atm)`,
        priority: 'high',
        source_type: 'chemical',
        source_reference: chem.chemical.name,
        checked: false,
      });
    }
  });
  
  return items;
}

/**
 * Generate site-specific checklist items
 */
function generateSiteChecklist(site: SiteInfo): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const siteTypeChecks = SITE_TYPE_CHECKS[site.site_type] || [];
  
  siteTypeChecks.forEach((categoryCheck) => {
    categoryCheck.items.forEach((item, idx) => {
      items.push({
        id: `site_${site.site_type.replace(/\s+/g, '_')}_${categoryCheck.category.replace(/\s+/g, '_')}_${idx}`,
        category: categoryCheck.category,
        item,
        priority: 'medium',
        source_type: 'site',
        source_reference: site.name,
        checked: false,
      });
    });
  });
  
  // Add general site items
  items.push(
    {
      id: 'site_general_1',
      category: 'General Site Safety',
      item: 'Verify emergency contact information posted and current',
      priority: 'medium',
      source_type: 'site',
      source_reference: site.name,
      checked: false,
    },
    {
      id: 'site_general_2',
      category: 'General Site Safety',
      item: 'Check site-specific emergency procedures accessible',
      priority: 'medium',
      source_type: 'site',
      source_reference: site.name,
      checked: false,
    },
    {
      id: 'site_general_3',
      category: 'General Site Safety',
      item: 'Verify visitor/contractor safety orientation process',
      priority: 'low',
      source_type: 'site',
      source_reference: site.name,
      checked: false,
    }
  );
  
  return items;
}

/**
 * Generate the general safety checklist (for all inspections)
 */
function generateGeneralChecklist(): ChecklistItem[] {
  return [
    {
      id: 'gen_1',
      category: 'Emergency Preparedness',
      item: 'Verify emergency assembly points marked and accessible',
      priority: 'medium',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_2',
      category: 'Emergency Preparedness',
      item: 'Check first aid kit contents and expiration dates',
      priority: 'medium',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_3',
      category: 'Emergency Preparedness',
      item: 'Confirm emergency communication systems functional',
      priority: 'high',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_4',
      category: 'Documentation',
      item: 'Verify training records current for all personnel',
      priority: 'medium',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_5',
      category: 'Documentation',
      item: 'Check safety data sheets accessible for all chemicals',
      priority: 'high',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_6',
      category: 'Housekeeping',
      item: 'Verify walkways and exits clear of obstructions',
      priority: 'medium',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
    {
      id: 'gen_7',
      category: 'Housekeeping',
      item: 'Check spill response equipment available and stocked',
      priority: 'high',
      source_type: 'general',
      source_reference: 'Standard',
      checked: false,
    },
  ];
}

/**
 * Main function to generate complete inspection checklist
 */
export function generateInspectionChecklist(
  site: SiteInfo,
  chemicals: InspectionChemical[],
  equipmentList: { equipment: EquipmentData; condition: ConditionResult }[]
): ChecklistItem[] {
  const allItems: ChecklistItem[] = [];
  
  // Add general safety items
  allItems.push(...generateGeneralChecklist());
  
  // Add site-specific items
  allItems.push(...generateSiteChecklist(site));
  
  // Add chemical-specific items
  if (chemicals.length > 0) {
    allItems.push(...generateChemicalChecklist(chemicals));
  }
  
  // Add equipment-specific items
  equipmentList.forEach(({ equipment, condition }) => {
    allItems.push(...getEquipmentChecks(equipment, condition));
  });
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return allItems;
}

/**
 * Get priority badge variant
 */
export function getPriorityVariant(priority: ChecklistItem['priority']): 'destructive' | 'default' | 'secondary' | 'outline' {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
  }
}

/**
 * Group checklist items by category
 */
export function groupChecklistByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);
}
