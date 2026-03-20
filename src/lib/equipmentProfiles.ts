/**
 * Equipment-Type-Specific Assessment Profiles
 *
 * Each equipment type has unique failure modes, critical parameters,
 * inspection focus areas, and scoring weight adjustments based on
 * industry standards (API, ASME, NFPA, IEEE).
 *
 * References:
 * - Reactors: API 510, ASME BPVC Sec VIII
 * - Pumps: API 610, API 682 (seals)
 * - Heat Exchangers: API 660, TEMA Standards
 * - Storage Tanks: API 653, API 650
 * - Compressors: API 617/618
 * - Distillation Columns: API 510, ASME Sec VIII
 * - Control Systems: IEC 61511 (SIS), ISA 84
 * - Safety Valves: API 520/521, ASME Sec I/VIII
 */

export interface TypeSpecificCheck {
  field: keyof EquipmentData;
  condition: 'gt' | 'lt' | 'eq' | 'true';
  threshold?: number;
  deduction: number;
  message: string;
  category: 'physical' | 'operational' | 'maintenance' | 'environment';
}

export interface EquipmentProfile {
  type: string;
  /** Display label */
  label: string;
  /** Key failure modes specific to this equipment */
  failureModes: string[];
  /** Type-specific checklist items for inspections */
  inspectionChecklist: string[];
  /** Which form fields are most relevant (shown prominently) */
  primaryFields: string[];
  /** Fields that are not applicable and should be hidden */
  hiddenFields: string[];
  /** Adjusted scoring weights [physical, maintenance, operational, environment] — must sum to 1.0 */
  scoringWeights: { physical: number; maintenance: number; operational: number; environment: number };
  /** Expected service life in years (affects age scoring) */
  expectedLifeYears: number;
  /** Default maintenance frequency in days */
  defaultMaintenanceDays: number;
  /** Default inspection frequency in days */
  defaultInspectionDays: number;
  /** Type-specific physical condition descriptors */
  conditionDescriptors: [string, string, string]; // [good, warning, critical]
  /** Extra type-specific checks applied during scoring */
  typeSpecificChecks: TypeSpecificCheck[];
}

// This will be imported from equipmentCondition after it's defined
// but we need this for TypeScript - it's defined in equipmentCondition.ts
export interface EquipmentData {
  name: string;
  equipment_type: string;
  design_pressure_psi?: number;
  max_operating_pressure_psi?: number;
  design_temperature_c?: number;
  max_operating_temperature_c?: number;
  safety_relief_setpoint_psi?: number;
  current_operating_pressure_psi?: number;
  current_operating_temperature_c?: number;
  capacity_utilization_percent: number;
  operating_hours_per_day: number;
  years_in_service: number;
  last_maintenance_date?: string;
  maintenance_frequency_days: number;
  last_inspection_date?: string;
  inspection_frequency_days: number;
  maintenance_compliance_percent: number;
  outstanding_work_orders: number;
  physical_condition: 1 | 2 | 3 | 4 | 5;
  has_visible_damage: boolean;
  has_corrosion: boolean;
  has_leaks: boolean;
  criticality_level: 1 | 2 | 3;
  is_safety_critical: boolean;
  redundancy_available: boolean;
  environment_condition: 1 | 2 | 3;
  exposed_to_corrosive: boolean;
  exposed_to_vibration: boolean;
  exposed_to_extreme_temp: boolean;
  
  // Equipment-specific assessment fields
  // Reactor
  wall_thickness_nominal_mm?: number;
  wall_thickness_measured_mm?: number;
  wall_thickness_min_required_mm?: number;
  corrosion_rate_mm_per_year?: number;
  thermal_cycling?: 'None' | 'Rare' | 'Moderate' | 'Frequent';
  
  // Distillation Column
  column_normal_pressure_drop_mbar?: number;
  column_current_pressure_drop_mbar?: number;
  fouling_level?: 'None' | 'Light' | 'Moderate' | 'Heavy';
  
  // Heat Exchanger
  approach_temp_normal_c?: number;
  approach_temp_current_c?: number;
  tube_plugged_count?: number;
  tube_total_count?: number;
  
  // Storage Tank
  settlement_mm?: number;
  floor_plate_corrosion?: boolean;
  
  // Pump
  vibration_level_mm_per_sec?: number;  // 0-2.5: Normal, 2.5-7: Elevated, 7-18: High, >18: Critical
  seal_condition?: 'Good' | 'Leaking' | 'Failed';
  
  // Compressor
  lube_oil_condition?: 'Good' | 'Degraded' | 'Contaminated';
  
  // Control System
  firmware_last_updated_date?: string;
  calibration_drift_detected?: boolean;
  
  // Safety Valve
  last_pop_test_date?: string;
  pop_test_result?: 'Pass' | 'Fail' | 'Not tested';
  set_pressure_tolerance_percent?: number;
  
  notes?: string;
}

export const EQUIPMENT_PROFILES: Record<string, EquipmentProfile> = {
  Reactor: {
    type: 'Reactor',
    label: 'Chemical Reactor',
    failureModes: [
      'Runaway reaction / thermal excursion',
      'Vessel wall thinning / corrosion under insulation',
      'Agitator seal failure',
      'Nozzle cracking from thermal cycling',
      'Catalyst deactivation / fouling',
    ],
    inspectionChecklist: [
      'Check vessel wall thickness (UT readings)',
      'Inspect agitator shaft seal and bearings',
      'Verify relief device operability',
      'Check jacket/coil integrity for leaks',
      'Inspect nozzle welds for cracking',
      'Verify temperature control system calibration',
      'Check baffles and internals condition',
    ],
    primaryFields: [
      'design_pressure_psi',
      'max_operating_pressure_psi',
      'current_operating_pressure_psi',
      'design_temperature_c',
      'max_operating_temperature_c',
      'current_operating_temperature_c',
      'safety_relief_setpoint_psi',
      'wall_thickness_nominal_mm',
      'wall_thickness_measured_mm',
      'thermal_cycling',
    ],
    hiddenFields: [],
    scoringWeights: { physical: 0.35, maintenance: 0.25, operational: 0.25, environment: 0.15 },
    expectedLifeYears: 25,
    defaultMaintenanceDays: 180,
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'Vessel walls, internals, and seals in good condition',
      'Wall thinning detected or seal wear progressing',
      'Significant corrosion, cracking, or seal failure',
    ],
    typeSpecificChecks: [
      {
        field: 'current_operating_pressure_psi',
        condition: 'gt',
        threshold: 0.9,
        deduction: 15,
        message: 'Reactor operating above 90% of max pressure — runaway risk',
        category: 'operational',
      },
      {
        field: 'current_operating_temperature_c',
        condition: 'gt',
        threshold: 0.9,
        deduction: 15,
        message: 'Reactor temperature near limit — thermal excursion risk',
        category: 'operational',
      },
      {
        field: 'thermal_cycling',
        condition: 'eq',
        threshold: 'Frequent',
        deduction: 15,
        message: 'Frequent thermal cycling accelerates nozzle/weld fatigue',
        category: 'physical',
      },
    ],
  },

  Pump: {
    type: 'Pump',
    label: 'Centrifugal / Positive Displacement Pump',
    failureModes: [
      'Mechanical seal failure / leakage',
      'Bearing wear and overheating',
      'Impeller erosion / cavitation damage',
      'Shaft misalignment',
      'Coupling failure',
    ],
    inspectionChecklist: [
      'Check mechanical seal for leaks',
      'Measure bearing temperature and vibration',
      'Inspect coupling alignment',
      'Check suction strainer / filter condition',
      'Verify lube oil level and condition',
      'Listen for cavitation noise',
      'Check baseplate and anchor bolts',
    ],
    primaryFields: [
      'current_operating_pressure_psi',
      'max_operating_pressure_psi',
      'capacity_utilization_percent',
      'operating_hours_per_day',
      'vibration_level_mm_per_sec',
      'seal_condition',
    ],
    hiddenFields: [
      'design_temperature_c',
      'max_operating_temperature_c',
      'safety_relief_setpoint_psi',
      'design_pressure_psi',
    ],
    scoringWeights: { physical: 0.30, maintenance: 0.35, operational: 0.25, environment: 0.10 },
    expectedLifeYears: 15,
    defaultMaintenanceDays: 90,
    defaultInspectionDays: 180,
    conditionDescriptors: [
      'Seals intact, bearings smooth, no vibration issues',
      'Increased vibration or minor seal weeping detected',
      'Seal failure, excessive vibration, or bearing damage',
    ],
    typeSpecificChecks: [
      {
        field: 'vibration_level_mm_per_sec',
        condition: 'gt',
        threshold: 18,
        deduction: 40,
        message: 'Critical vibration level (>18 mm/s) — bearing/rotor failure risk',
        category: 'physical',
      },
      {
        field: 'vibration_level_mm_per_sec',
        condition: 'gt',
        threshold: 7,
        deduction: 20,
        message: 'High vibration (7-18 mm/s) — bearing accelerating wear',
        category: 'physical',
      },
      {
        field: 'seal_condition',
        condition: 'eq',
        threshold: 'Leaking',
        deduction: 15,
        message: 'Seal condition shows leakage — replacement needed soon',
        category: 'physical',
      },
      {
        field: 'seal_condition',
        condition: 'eq',
        threshold: 'Failed',
        deduction: 35,
        message: 'Seal failed — pump must be taken out of service',
        category: 'physical',
      },
      {
        field: 'exposed_to_vibration',
        condition: 'true',
        deduction: 15,
        message: 'High vibration accelerates pump bearing/seal wear',
        category: 'physical',
      },
      {
        field: 'operating_hours_per_day',
        condition: 'gt',
        threshold: 20,
        deduction: 10,
        message: 'Near-continuous pump operation — accelerated wear expected',
        category: 'operational',
      },
      {
        field: 'capacity_utilization_percent',
        condition: 'gt',
        threshold: 90,
        deduction: 10,
        message: 'Pump operating near shutoff/runout — efficiency and reliability concerns',
        category: 'operational',
      },
    ],
  },

  'Heat Exchanger': {
    type: 'Heat Exchanger',
    label: 'Shell & Tube / Plate Heat Exchanger',
    failureModes: [
      'Tube fouling / scaling reducing efficiency',
      'Tube-to-tubesheet joint failure',
      'Shell-side corrosion',
      'Tube bundle vibration damage',
      'Gasket failure (plate type)',
    ],
    inspectionChecklist: [
      'Check pressure drop across exchanger (fouling indicator)',
      'Inspect tube ends at tubesheet',
      'Hydrotest shell and tube sides',
      'Check for cross-contamination between fluids',
      'Inspect baffles for erosion damage',
      'Verify thermal performance (approach temperature)',
      'Check expansion joint condition',
    ],
    primaryFields: [
      'design_pressure_psi',
      'max_operating_pressure_psi',
      'design_temperature_c',
      'max_operating_temperature_c',
      'current_operating_temperature_c',
      'approach_temp_normal_c',
      'approach_temp_current_c',
      'tube_plugged_count',
      'tube_total_count',
    ],
    hiddenFields: ['safety_relief_setpoint_psi', 'capacity_utilization_percent', 'operating_hours_per_day'],
    scoringWeights: { physical: 0.30, maintenance: 0.30, operational: 0.20, environment: 0.20 },
    expectedLifeYears: 20,
    defaultMaintenanceDays: 365,
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'Clean tubes, good heat transfer, no leaks',
      'Fouling detected, reduced efficiency, minor leaks',
      'Severe fouling, tube failure, or cross-contamination',
    ],
    typeSpecificChecks: [
      {
        field: 'approach_temp_current_c',
        condition: 'gt',
        threshold: 1.3, // 30% increase from normal (threshold used as multiplier)
        deduction: 15,
        message: 'Approach temperature increased >30% — fouling indicator',
        category: 'operational',
      },
      {
        field: 'approach_temp_current_c',
        condition: 'gt',
        threshold: 1.6, // 60% increase
        deduction: 25,
        message: 'Approach temperature increased >60% — severe fouling, clean tubes',
        category: 'operational',
      },
      {
        field: 'tube_plugged_count',
        condition: 'gt',
        threshold: 0.05, // >5% of tubes (uses ratio logic)
        deduction: 8,
        message: '>5% tubes plugged — fouling reduces heat transfer',
        category: 'operational',
      },
      {
        field: 'tube_plugged_count',
        condition: 'gt',
        threshold: 0.15, // >15%
        deduction: 18,
        message: '>15% tubes plugged — significant performance loss',
        category: 'operational',
      },
      {
        field: 'has_corrosion',
        condition: 'true',
        deduction: 20,
        message: 'Corrosion in heat exchanger risks tube perforation and cross-contamination',
        category: 'physical',
      },
      {
        field: 'exposed_to_extreme_temp',
        condition: 'true',
        deduction: 10,
        message: 'Thermal cycling stress on tube joints and expansion bellows',
        category: 'environment',
      },
    ],
  },

  'Storage Tank': {
    type: 'Storage Tank',
    label: 'Atmospheric / Pressurized Storage Tank',
    failureModes: [
      'Bottom plate corrosion (soil-side)',
      'Shell course thinning',
      'Floating roof seal failure',
      'Foundation settlement / tilting',
      'Tank breathing / venting failure',
    ],
    inspectionChecklist: [
      'Inspect tank floor plates (underside if possible)',
      'Measure shell thickness at liquid levels',
      'Check roof condition and seals (floating roof)',
      'Inspect vents and breathers',
      'Check foundation for settlement or cracking',
      'Verify cathodic protection system',
      'Inspect secondary containment / dike',
    ],
    primaryFields: [
      'design_pressure_psi',
      'capacity_utilization_percent',
      'settlement_mm',
      'floor_plate_corrosion',
      'years_in_service',
    ],
    hiddenFields: [
      'current_operating_temperature_c',
      'max_operating_temperature_c',
      'safety_relief_setpoint_psi',
      'current_operating_pressure_psi',
      'design_temperature_c',
      'operating_hours_per_day',
    ],
    scoringWeights: { physical: 0.35, maintenance: 0.25, operational: 0.20, environment: 0.20 },
    expectedLifeYears: 30,
    defaultMaintenanceDays: 365,
    defaultInspectionDays: 1825, // API 653: ~5 years external
    conditionDescriptors: [
      'Shell and floor intact, coating good, no settlement',
      'Localized corrosion, minor coating breakdown',
      'Significant floor/shell thinning, settlement, or leak',
    ],
    typeSpecificChecks: [
      {
        field: 'settlement_mm',
        condition: 'gt',
        threshold: 25,
        deduction: 15,
        message: 'Tank settlement >25mm — foundation issue, risk of distortion',
        category: 'physical',
      },
      {
        field: 'settlement_mm',
        condition: 'gt',
        threshold: 50,
        deduction: 25,
        message: 'Tank settlement >50mm — significant foundation risk',
        category: 'physical',
      },
      {
        field: 'floor_plate_corrosion',
        condition: 'true',
        deduction: 20,
        message: 'Floor plate corrosion observed — risk of perforation and environmental release',
        category: 'physical',
      },
      {
        field: 'has_corrosion',
        condition: 'true',
        deduction: 20,
        message: 'Tank corrosion — risk of floor/shell perforation and environmental release',
        category: 'physical',
      },
      {
        field: 'exposed_to_corrosive',
        condition: 'true',
        deduction: 15,
        message: 'Corrosive environment accelerates tank wall degradation',
        category: 'environment',
      },
      {
        field: 'years_in_service',
        condition: 'gt',
        threshold: 25,
        deduction: 10,
        message: 'Tank age exceeds 25 years — increased floor corrosion risk per API 653',
        category: 'physical',
      },
    ],
  },

  Compressor: {
    type: 'Compressor',
    label: 'Centrifugal / Reciprocating Compressor',
    failureModes: [
      'Surge / stall condition (centrifugal)',
      'Valve failure (reciprocating)',
      'Bearing failure / lubrication breakdown',
      'Piston ring / packing wear (reciprocating)',
      'Intercooler fouling',
    ],
    inspectionChecklist: [
      'Check vibration levels at all bearings',
      'Inspect lube oil and seal oil systems',
      'Check valve condition (reciprocating)',
      'Verify anti-surge control calibration (centrifugal)',
      'Inspect intercooler / aftercooler performance',
      'Check piston rod runout and packing leaks (recip)',
      'Verify coupling alignment',
    ],
    primaryFields: [
      'design_pressure_psi',
      'max_operating_pressure_psi',
      'current_operating_pressure_psi',
      'design_temperature_c',
      'operating_hours_per_day',
      'vibration_level_mm_per_sec',
      'lube_oil_condition',
    ],
    hiddenFields: ['safety_relief_setpoint_psi', 'capacity_utilization_percent'],
    scoringWeights: { physical: 0.25, maintenance: 0.35, operational: 0.25, environment: 0.15 },
    expectedLifeYears: 20,
    defaultMaintenanceDays: 90,
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'Low vibration, valves good, oil clean',
      'Rising vibration trend, minor valve leaks',
      'High vibration, valve failure, or oil contamination',
    ],
    typeSpecificChecks: [
      {
        field: 'vibration_level_mm_per_sec',
        condition: 'gt',
        threshold: 18,
        deduction: 40,
        message: 'Critical vibration level (>18 mm/s) — bearing/rotor failure',
        category: 'physical',
      },
      {
        field: 'vibration_level_mm_per_sec',
        condition: 'gt',
        threshold: 7,
        deduction: 20,
        message: 'High vibration (7-18 mm/s) — accelerated bearing wear',
        category: 'physical',
      },
      {
        field: 'lube_oil_condition',
        condition: 'eq',
        threshold: 'Degraded',
        deduction: 10,
        message: 'Lube oil condition degraded — bearing failure risk',
        category: 'maintenance',
      },
      {
        field: 'lube_oil_condition',
        condition: 'eq',
        threshold: 'Contaminated',
        deduction: 25,
        message: 'Lube oil contaminated — must be changed, bearing damage risk',
        category: 'maintenance',
      },
      {
        field: 'exposed_to_vibration',
        condition: 'true',
        deduction: 20,
        message: 'Compressor vibration exceeding baseline — bearing or rotor issue',
        category: 'physical',
      },
      {
        field: 'operating_hours_per_day',
        condition: 'gt',
        threshold: 22,
        deduction: 10,
        message: 'Near-continuous compressor operation without standby',
        category: 'operational',
      },
    ],
  },

  'Distillation Column': {
    type: 'Distillation Column',
    label: 'Distillation / Fractionation Column',
    failureModes: [
      'Tray/packing damage or fouling',
      'Reboiler tube failure',
      'Condenser fouling',
      'Column shell corrosion (especially at liquid levels)',
      'Overhead system corrosion (HCl, H2S)',
    ],
    inspectionChecklist: [
      'Inspect trays/packing during turnaround',
      'Check shell thickness at feed zone and liquid levels',
      'Inspect reboiler and condenser performance',
      'Check overhead piping for corrosion',
      'Verify relief device operation',
      'Inspect manway gaskets and nozzle flanges',
      'Review column differential pressure trends',
    ],
    primaryFields: [
      'design_pressure_psi',
      'max_operating_pressure_psi',
      'design_temperature_c',
      'max_operating_temperature_c',
      'current_operating_temperature_c',
      'safety_relief_setpoint_psi',
      'column_normal_pressure_drop_mbar',
      'column_current_pressure_drop_mbar',
      'fouling_level',
    ],
    hiddenFields: [],
    scoringWeights: { physical: 0.30, maintenance: 0.30, operational: 0.25, environment: 0.15 },
    expectedLifeYears: 25,
    defaultMaintenanceDays: 730, // turnaround cycle
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'Trays intact, shell good, normal dP across column',
      'Increasing dP, tray damage suspected, minor corrosion',
      'Severe tray damage, shell thinning, or flooding',
    ],
    typeSpecificChecks: [
      {
        field: 'column_current_pressure_drop_mbar',
        condition: 'gt',
        threshold: 1.5, // 50% increase (threshold used as multiplier)
        deduction: 15,
        message: 'Column ΔP increased >50% from normal — flooding/fouling indicator',
        category: 'operational',
      },
      {
        field: 'column_current_pressure_drop_mbar',
        condition: 'gt',
        threshold: 2.0, // 100% increase
        deduction: 25,
        message: 'Column ΔP increased >100% from normal — severe fouling, clean tubes',
        category: 'operational',
      },
      {
        field: 'fouling_level',
        condition: 'eq',
        threshold: 'Light',
        deduction: 4,
        message: 'Light fouling detected — monitor for degradation',
        category: 'physical',
      },
      {
        field: 'fouling_level',
        condition: 'eq',
        threshold: 'Moderate',
        deduction: 10,
        message: 'Moderate fouling — internal cleaning recommended',
        category: 'physical',
      },
      {
        field: 'fouling_level',
        condition: 'eq',
        threshold: 'Heavy',
        deduction: 20,
        message: 'Heavy fouling — major cleaning or turnaround needed',
        category: 'physical',
      },
      {
        field: 'has_corrosion',
        condition: 'true',
        deduction: 20,
        message: 'Column corrosion at feed/liquid zones — wall thinning risk',
        category: 'physical',
      },
      {
        field: 'exposed_to_corrosive',
        condition: 'true',
        deduction: 15,
        message: 'Corrosive overhead conditions accelerate column degradation',
        category: 'environment',
      },
    ],
  },

  'Control System': {
    type: 'Control System',
    label: 'DCS / PLC / Safety Instrumented System',
    failureModes: [
      'Sensor drift / calibration error',
      'Controller card failure',
      'Communication network dropout',
      'Software/firmware bug',
      'Power supply failure',
    ],
    inspectionChecklist: [
      'Verify sensor calibration dates and drift',
      'Test safety interlock functionality (proof test)',
      'Check UPS and backup power systems',
      'Review alarm logs for recurring issues',
      'Verify cybersecurity patch status',
      'Test emergency shutdown function',
      'Check cabinet temperature and cooling',
    ],
    primaryFields: [
      'operating_hours_per_day',
      'years_in_service',
      'firmware_last_updated_date',
      'calibration_drift_detected',
      'last_maintenance_date',
    ],
    hiddenFields: [
      'design_pressure_psi',
      'max_operating_pressure_psi',
      'current_operating_pressure_psi',
      'design_temperature_c',
      'max_operating_temperature_c',
      'current_operating_temperature_c',
      'safety_relief_setpoint_psi',
      'capacity_utilization_percent',
      'has_leaks',
      'has_corrosion',
      'has_visible_damage',
    ],
    scoringWeights: { physical: 0.15, maintenance: 0.35, operational: 0.40, environment: 0.10 },
    expectedLifeYears: 15,
    defaultMaintenanceDays: 180,
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'All sensors calibrated, interlocks tested, firmware current',
      'Calibration overdue on some loops, minor alarm issues',
      'Interlock test failures, sensor drift, or card faults',
    ],
    typeSpecificChecks: [
      {
        field: 'firmware_last_updated_date',
        condition: 'gt',
        threshold: 730, // >2 years
        deduction: 15,
        message: 'Firmware/software not updated >2 years — security/stability risk',
        category: 'operational',
      },
      {
        field: 'firmware_last_updated_date',
        condition: 'gt',
        threshold: 1825, // >5 years
        deduction: 25,
        message: 'Firmware/software outdated >5 years — obsolescence risk',
        category: 'operational',
      },
      {
        field: 'calibration_drift_detected',
        condition: 'true',
        deduction: 12,
        message: 'Calibration drift detected on control loops — recalibration needed',
        category: 'operational',
      },
      {
        field: 'years_in_service',
        condition: 'gt',
        threshold: 10,
        deduction: 15,
        message: 'Control system age >10 years — obsolescence and parts availability concern per IEC 61511',
        category: 'physical',
      },
      {
        field: 'exposed_to_extreme_temp',
        condition: 'true',
        deduction: 15,
        message: 'Electronics exposed to temperature extremes — accelerated failure rate',
        category: 'environment',
      },
    ],
  },

  'Safety Valve': {
    type: 'Safety Valve',
    label: 'Pressure Safety / Relief Valve',
    failureModes: [
      'Set pressure drift (opening too high or low)',
      'Seat leakage / simmering',
      'Spring fatigue',
      'Discharge piping blockage',
      'Corrosion / fouling preventing lift',
    ],
    inspectionChecklist: [
      'Verify set pressure on test bench',
      'Check for seat leakage (acoustic or visual)',
      'Inspect spring and internals for corrosion',
      'Verify discharge path is clear and unobstructed',
      'Check inlet piping pressure drop',
      'Verify nameplate data matches P&ID',
      'Confirm test certification is current',
    ],
    primaryFields: [
      'safety_relief_setpoint_psi',
      'design_pressure_psi',
      'last_pop_test_date',
      'pop_test_result',
      'set_pressure_tolerance_percent',
    ],
    hiddenFields: [
      'current_operating_temperature_c',
      'max_operating_temperature_c',
      'capacity_utilization_percent',
      'operating_hours_per_day',
      'design_temperature_c',
      'current_operating_pressure_psi',
      'max_operating_pressure_psi',
    ],
    scoringWeights: { physical: 0.20, maintenance: 0.40, operational: 0.35, environment: 0.05 },
    expectedLifeYears: 10,
    defaultMaintenanceDays: 365,
    defaultInspectionDays: 365, // API 576
    conditionDescriptors: [
      'Valve tested within tolerance, no seat leakage',
      'Minor seat leakage or approaching test due date',
      'Set pressure out of range, stuck, or discharge blocked',
    ],
    typeSpecificChecks: [
      {
        field: 'pop_test_result',
        condition: 'eq',
        threshold: 'Fail',
        deduction: 40,
        message: 'Last pop test FAILED — valve must be reworked before service',
        category: 'maintenance',
      },
      {
        field: 'pop_test_result',
        condition: 'eq',
        threshold: 'Not tested',
        deduction: 25,
        message: 'Valve pop test not performed — cannot confirm relief function',
        category: 'maintenance',
      },
      {
        field: 'set_pressure_tolerance_percent',
        condition: 'gt',
        threshold: 3,
        deduction: 15,
        message: 'Set pressure deviation >3% of nameplate — recalibration required',
        category: 'operational',
      },
      {
        field: 'last_pop_test_date',
        condition: 'gt',
        threshold: 365, // >1 year
        deduction: 10,
        message: 'Pop test overdue >12 months — API 576 requires annual testing',
        category: 'maintenance',
      },
      {
        field: 'has_corrosion',
        condition: 'true',
        deduction: 25,
        message: 'Corrosion on safety valve — risk of failure to open on demand',
        category: 'physical',
      },
      {
        field: 'exposed_to_corrosive',
        condition: 'true',
        deduction: 15,
        message: 'Corrosive service degrades valve internals per API 520',
        category: 'environment',
      },
    ],
  },

  Other: {
    type: 'Other',
    label: 'General Equipment',
    failureModes: [
      'Mechanical wear',
      'Corrosion / degradation',
      'Electrical failure',
      'Structural fatigue',
    ],
    inspectionChecklist: ['Visual inspection for damage', 'Check operating parameters', 'Verify maintenance records', 'Test safety devices'],
    primaryFields: [],
    hiddenFields: [],
    scoringWeights: { physical: 0.30, maintenance: 0.30, operational: 0.20, environment: 0.20 },
    expectedLifeYears: 20,
    defaultMaintenanceDays: 90,
    defaultInspectionDays: 365,
    conditionDescriptors: [
      'Good operating condition',
      'Some wear or degradation noted',
      'Significant issues requiring attention',
    ],
    typeSpecificChecks: [],
  },
};

/**
 * Get profile for an equipment type, falling back to 'Other'
 */
export function getEquipmentProfile(equipmentType: string): EquipmentProfile {
  return EQUIPMENT_PROFILES[equipmentType] || EQUIPMENT_PROFILES['Other'];
}

/**
 * Check if a field should be hidden for a given equipment type
 */
export function isFieldHidden(equipmentType: string, fieldName: string): boolean {
  const profile = getEquipmentProfile(equipmentType);
  return profile.hiddenFields.includes(fieldName);
}

/**
 * Check if a field is a primary (prominent) field for a given equipment type
 */
export function isFieldPrimary(equipmentType: string, fieldName: string): boolean {
  const profile = getEquipmentProfile(equipmentType);
  return profile.primaryFields.includes(fieldName);
}
