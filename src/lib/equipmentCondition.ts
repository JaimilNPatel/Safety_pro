/**
 * Equipment Condition Assessment based on NFPA 70B Standards
 * Evaluates equipment across three dimensions:
 * 1. Physical Condition - inherent state of equipment
 * 2. Criticality - importance to safety and operations
 * 3. Environment - operating conditions exposure
 *
 * Now supports equipment-type-specific scoring weights, failure modes,
 * and assessment criteria.
 */

import { getEquipmentProfile, type EquipmentProfile, type EquipmentData } from './equipmentProfiles';

export interface ConditionResult {
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  condition_score: number; // 0-100
  governing_factor: string;
  recommendations: string[];
  physical_score: number;
  criticality_score: number;
  environment_score: number;
  maintenance_score: number;
  operational_score: number;
}

/**
 * Calculate the days since a date, or return a default if no date provided
 */
function daysSinceDate(dateStr?: string, defaultDays = 999): number {
  if (!dateStr) return defaultDays;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate physical condition score (0-100)
 * Based on NFPA 70B physical assessment criteria
 * Uses equipment-type-specific condition descriptors
 */
function calculatePhysicalScore(data: EquipmentData, profile: EquipmentProfile): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  // Base physical condition (1=best, 5=worst)
  switch (data.physical_condition) {
    case 1:
      // Like-new condition
      break;
    case 2:
      score -= 16;
      issues.push('Physical condition shows wear indicators');
      break;
    case 3:
      score -= 35;
      issues.push('Physical condition shows moderate degradation');
      break;
    case 4:
      score -= 62;
      issues.push('Physical condition shows significant issues');
      break;
    case 5:
      score -= 88;
      issues.push('Physical condition critical — immediate attention required');
      break;
  }
  
  // Damage indicators
  if (data.has_visible_damage) {
    score -= 15;
    issues.push('Visible damage detected');
  }
  if (data.has_corrosion) {
    score -= 15;
    issues.push('Corrosion present');
  }
  if (data.has_leaks) {
    score -= 20;
    issues.push('Active leaks detected');
  }
  
  // Age factor using equipment-type-specific expected life
  const expectedLife = profile.expectedLifeYears;
  if (data.years_in_service > expectedLife) {
    score -= 10;
    issues.push(`Equipment age exceeds expected life of ${expectedLife} years`);
  } else if (data.years_in_service > expectedLife * 0.75) {
    score -= 5;
    issues.push('Equipment approaching end of expected service life');
  }
  
  return { score: Math.max(0, score), issues };
}

/**
 * Calculate maintenance compliance score (0-100)
 */
function calculateMaintenanceScore(data: EquipmentData): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  // Days since last maintenance
  const daysSinceMaintenance = daysSinceDate(data.last_maintenance_date);
  const maintenanceOverdue = daysSinceMaintenance > data.maintenance_frequency_days;
  const maintenanceRatio = daysSinceMaintenance / data.maintenance_frequency_days;
  
  if (maintenanceOverdue) {
    if (maintenanceRatio > 2) {
      score -= 40;
      issues.push(`Maintenance severely overdue (${Math.round(maintenanceRatio)}x schedule)`);
    } else {
      score -= 20;
      issues.push('Scheduled maintenance overdue');
    }
  }
  
  // Days since last inspection
  const daysSinceInspection = daysSinceDate(data.last_inspection_date);
  if (daysSinceInspection > data.inspection_frequency_days) {
    score -= 15;
    issues.push('Inspection overdue');
  }
  
  // Maintenance compliance percentage
  if (data.maintenance_compliance_percent < 80) {
    score -= 20;
    issues.push(`Low maintenance compliance (${data.maintenance_compliance_percent}%)`);
  } else if (data.maintenance_compliance_percent < 90) {
    score -= 10;
    issues.push('Maintenance compliance below target');
  }
  
  // Outstanding work orders
  if (data.outstanding_work_orders > 5) {
    score -= 15;
    issues.push(`${data.outstanding_work_orders} outstanding work orders`);
  } else if (data.outstanding_work_orders > 2) {
    score -= 8;
    issues.push('Multiple outstanding work orders');
  }
  
  return { score: Math.max(0, score), issues };
}

/**
 * Calculate operational stress score (0-100)
 * Based on how close to limits the equipment operates
 */
function calculateOperationalScore(data: EquipmentData): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  // Pressure utilization
  if (data.current_operating_pressure_psi && data.max_operating_pressure_psi) {
    const pressureRatio = data.current_operating_pressure_psi / data.max_operating_pressure_psi;
    if (pressureRatio > 0.95) {
      score -= 25;
      issues.push('Operating very close to pressure limits (>95%)');
    } else if (pressureRatio > 0.85) {
      score -= 10;
      issues.push('Operating near pressure limits (>85%)');
    }
  }
  
  // Temperature utilization
  if (data.current_operating_temperature_c && data.max_operating_temperature_c) {
    const tempRatio = data.current_operating_temperature_c / data.max_operating_temperature_c;
    if (tempRatio > 0.95) {
      score -= 25;
      issues.push('Operating very close to temperature limits (>95%)');
    } else if (tempRatio > 0.85) {
      score -= 10;
      issues.push('Operating near temperature limits (>85%)');
    }
  }
  
  // Capacity utilization
  if (data.capacity_utilization_percent > 95) {
    score -= 15;
    issues.push('Near maximum capacity utilization');
  } else if (data.capacity_utilization_percent > 85) {
    score -= 5;
  }
  
  // Operating hours stress
  if (data.operating_hours_per_day >= 24) {
    score -= 10;
    issues.push('Continuous 24-hour operation');
  } else if (data.operating_hours_per_day >= 16) {
    score -= 5;
  }
  
  return { score: Math.max(0, score), issues };
}

/**
 * Apply type-specific checks from equipment profile
 * These are additional deductions based on equipment type
 */
function applyTypeSpecificChecks(data: EquipmentData, profile: EquipmentProfile): { deductions: { [key: string]: number }; issues: string[] } {
  const deductions: { [key: string]: number } = {};
  const issues: string[] = [];
  
  for (const check of profile.typeSpecificChecks) {
    let shouldApply = false;
    
    const fieldValue = data[check.field];
    
    switch (check.condition) {
      case 'gt':
        // Handle numeric comparisons with special logic for ratios, dates, and field-based thresholds
        if (typeof fieldValue === 'number' && typeof check.threshold === 'number') {
          // Check if it's a ratio check (decimal < 1 threshold) like approach temp or pressure drop
          if ((check.field.includes('approach_temp') || check.field.includes('pressure_drop')) && check.threshold > 1 && check.threshold < 3) {
            // It's a multiplier/ratio check - compare current to normal
            if (check.field.includes('approach_temp')) {
              const normalTemp = data.approach_temp_normal_c;
              if (typeof normalTemp === 'number' && normalTemp > 0) {
                shouldApply = (fieldValue / normalTemp) > check.threshold;
              }
            } else if (check.field.includes('pressure_drop')) {
              const normalDP = data.column_normal_pressure_drop_mbar;
              if (typeof normalDP === 'number' && normalDP > 0) {
                shouldApply = (fieldValue / normalDP) > check.threshold;
              }
            }
          } else if (check.field.includes('operating_') && check.threshold < 1) {
            // It's a pressure/temperature ratio check
            const maxField = 'max_' + check.field;
            const maxValue = data[maxField as keyof EquipmentData];
            shouldApply = typeof maxValue === 'number' ? (fieldValue / maxValue) > check.threshold : false;
          } else {
            // Direct numeric comparison
            shouldApply = fieldValue > check.threshold;
          }
        } else if (typeof fieldValue === 'string' && typeof check.threshold === 'number') {
          // Handle date string comparisons (days since date)
          if (check.field.includes('_date')) {
            const daysSince = daysSinceDate(fieldValue);
            shouldApply = daysSince > check.threshold;
          }
        }
        break;
      case 'lt':
        if (typeof fieldValue === 'number' && typeof check.threshold === 'number') {
          shouldApply = fieldValue < check.threshold;
        }
        break;
      case 'eq':
        // Handle string equality comparisons (seal condition, fouling level, etc.)
        shouldApply = fieldValue === check.threshold;
        break;
      case 'true':
        shouldApply = fieldValue === true;
        break;
    }
    
    if (shouldApply) {
      deductions[check.category] = (deductions[check.category] || 0) + check.deduction;
      issues.push(check.message);
    }
  }
  
  return { deductions, issues };
}

/**
 * Calculate criticality factor

 * Higher criticality = more conservative condition assessment
 */
function calculateCriticalityFactor(data: EquipmentData): { factor: number; notes: string[] } {
  let factor = 1.0;
  const notes: string[] = [];
  
  // Base criticality level
  switch (data.criticality_level) {
    case 1:
      factor = 1.2; // Most critical - highest standards
      notes.push('High criticality equipment');
      break;
    case 2:
      factor = 1.0; // Standard
      break;
    case 3:
      factor = 0.8; // Less critical - more tolerance
      break;
  }
  
  if (data.is_safety_critical) {
    factor += 0.2;
    notes.push('Safety-critical designation');
  }
  
  if (!data.redundancy_available) {
    factor += 0.1;
    notes.push('No redundancy available');
  }
  
  return { factor, notes };
}

/**
 * Calculate environment impact score
 */
function calculateEnvironmentScore(data: EquipmentData): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  // Base environment condition
  switch (data.environment_condition) {
    case 1:
      // Clean, controlled environment
      break;
    case 2:
      score -= 10;
      issues.push('Moderate environmental exposure');
      break;
    case 3:
      score -= 25;
      issues.push('Harsh environmental conditions');
      break;
  }
  
  // Specific exposures
  if (data.exposed_to_corrosive) {
    score -= 15;
    issues.push('Exposed to corrosive environment');
  }
  if (data.exposed_to_vibration) {
    score -= 10;
    issues.push('Significant vibration exposure');
  }
  if (data.exposed_to_extreme_temp) {
    score -= 10;
    issues.push('Extreme temperature exposure');
  }
  
  return { score: Math.max(0, score), issues };
}

/**
 * Main function to calculate overall equipment condition
 * Uses equipment-type-specific scoring weights and checks
 */
export function calculateEquipmentCondition(data: EquipmentData): ConditionResult {
  // Get equipment profile for type-specific configuration
  const profile = getEquipmentProfile(data.equipment_type);
  
  // Calculate individual scores
  const physical = calculatePhysicalScore(data, profile);
  const maintenance = calculateMaintenanceScore(data);
  const operational = calculateOperationalScore(data);
  const environment = calculateEnvironmentScore(data);
  const criticality = calculateCriticalityFactor(data);
  
  // Apply type-specific checks and get deductions by category
  const typeSpecificChecks = applyTypeSpecificChecks(data, profile);
  
  let physicalScore = physical.score - (typeSpecificChecks.deductions['physical'] || 0);
  let maintenanceScore = maintenance.score - (typeSpecificChecks.deductions['maintenance'] || 0);
  let operationalScore = operational.score - (typeSpecificChecks.deductions['operational'] || 0);
  let environmentScore = environment.score - (typeSpecificChecks.deductions['environment'] || 0);
  
  // Ensure scores stay in valid range
  physicalScore = Math.max(0, Math.min(100, physicalScore));
  maintenanceScore = Math.max(0, Math.min(100, maintenanceScore));
  operationalScore = Math.max(0, Math.min(100, operationalScore));
  environmentScore = Math.max(0, Math.min(100, environmentScore));
  
  // Weight the scores using equipment-type-specific weights
  const weightedScore = (
    physicalScore * profile.scoringWeights.physical +
    maintenanceScore * profile.scoringWeights.maintenance +
    operationalScore * profile.scoringWeights.operational +
    environmentScore * profile.scoringWeights.environment
  );
  
  // Apply criticality factor (reduces score for critical equipment)
  const adjustedScore = Math.round(weightedScore / criticality.factor);
  const finalScore = Math.max(0, Math.min(100, adjustedScore));
  
  // Determine governing factor (lowest scoring area)
  const scores = [
    { name: 'Physical Condition', score: physicalScore },
    { name: 'Maintenance Compliance', score: maintenanceScore },
    { name: 'Operational Stress', score: operationalScore },
    { name: 'Environmental Factors', score: environmentScore },
  ];
  const governing = scores.reduce((min, curr) => curr.score < min.score ? curr : min);
  
  // Collect all recommendations
  const recommendations: string[] = [
    ...physical.issues,
    ...maintenance.issues,
    ...operational.issues,
    ...environment.issues,
    ...typeSpecificChecks.issues,
    ...criticality.notes,
  ];
  
  // Determine overall condition category
  let overall_condition: ConditionResult['overall_condition'];
  if (finalScore >= 90) {
    overall_condition = 'excellent';
  } else if (finalScore >= 75) {
    overall_condition = 'good';
  } else if (finalScore >= 55) {
    overall_condition = 'fair';
  } else if (finalScore >= 35) {
    overall_condition = 'poor';
  } else {
    overall_condition = 'critical';
  }
  
  return {
    overall_condition,
    condition_score: finalScore,
    governing_factor: governing.name,
    recommendations,
    physical_score: physicalScore,
    criticality_score: Math.round(100 / criticality.factor),
    environment_score: environmentScore,
    maintenance_score: maintenanceScore,
    operational_score: operationalScore,
  };
}

/**
 * Get default equipment data with reasonable values
 * Uses equipment-type-specific defaults from profile
 */
export function getDefaultEquipmentData(name: string, equipmentType: string): EquipmentData {
  const profile = getEquipmentProfile(equipmentType);
  
  return {
    name,
    equipment_type: equipmentType,
    capacity_utilization_percent: 60,
    operating_hours_per_day: 8,
    years_in_service: 0,
    maintenance_frequency_days: profile.defaultMaintenanceDays,
    inspection_frequency_days: profile.defaultInspectionDays,
    maintenance_compliance_percent: 100,
    outstanding_work_orders: 0,
    physical_condition: 1,
    has_visible_damage: false,
    has_corrosion: false,
    has_leaks: false,
    criticality_level: 2,
    is_safety_critical: false,
    redundancy_available: true,
    environment_condition: 1,
    exposed_to_corrosive: false,
    exposed_to_vibration: false,
    exposed_to_extreme_temp: false,
  };
}

/**
 * Get condition badge color class
 */
export function getConditionColorClass(condition: ConditionResult['overall_condition']): string {
  switch (condition) {
    case 'excellent':
      return 'bg-success text-success-foreground';
    case 'good':
      return 'bg-primary text-primary-foreground';
    case 'fair':
      return 'bg-warning text-warning-foreground';
    case 'poor':
      return 'bg-destructive/80 text-destructive-foreground';
    case 'critical':
      return 'bg-critical text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
