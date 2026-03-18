/**
 * Equipment Condition Assessment based on NFPA 70B Standards
 * Evaluates equipment across three dimensions:
 * 1. Physical Condition - inherent state of equipment
 * 2. Criticality - importance to safety and operations
 * 3. Environment - operating conditions exposure
 */

export interface EquipmentData {
  name: string;
  equipment_type: string;
  
  // Safety Limits
  design_pressure_psi?: number;
  max_operating_pressure_psi?: number;
  design_temperature_c?: number;
  max_operating_temperature_c?: number;
  safety_relief_setpoint_psi?: number;
  
  // Usage Metrics
  current_operating_pressure_psi?: number;
  current_operating_temperature_c?: number;
  capacity_utilization_percent: number;
  operating_hours_per_day: number;
  years_in_service: number;
  
  // Maintenance Data
  last_maintenance_date?: string;
  maintenance_frequency_days: number;
  last_inspection_date?: string;
  inspection_frequency_days: number;
  maintenance_compliance_percent: number;
  outstanding_work_orders: number;
  
  // Physical Condition Assessment
  physical_condition: 1 | 2 | 3;
  has_visible_damage: boolean;
  has_corrosion: boolean;
  has_leaks: boolean;
  
  // Criticality Assessment
  criticality_level: 1 | 2 | 3;
  is_safety_critical: boolean;
  redundancy_available: boolean;
  
  // Environment Assessment
  environment_condition: 1 | 2 | 3;
  exposed_to_corrosive: boolean;
  exposed_to_vibration: boolean;
  exposed_to_extreme_temp: boolean;
  
  notes?: string;
}

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
 */
function calculatePhysicalScore(data: EquipmentData): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  // Base physical condition (1=best, 3=worst)
  switch (data.physical_condition) {
    case 1:
      // Like-new condition
      break;
    case 2:
      score -= 25;
      issues.push('Physical condition shows wear indicators');
      break;
    case 3:
      score -= 50;
      issues.push('Physical condition requires immediate attention');
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
  
  // Age factor (deduct up to 10 points for older equipment)
  if (data.years_in_service > 20) {
    score -= 10;
    issues.push('Equipment age exceeds 20 years');
  } else if (data.years_in_service > 10) {
    score -= 5;
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
 */
export function calculateEquipmentCondition(data: EquipmentData): ConditionResult {
  // Calculate individual scores
  const physical = calculatePhysicalScore(data);
  const maintenance = calculateMaintenanceScore(data);
  const operational = calculateOperationalScore(data);
  const environment = calculateEnvironmentScore(data);
  const criticality = calculateCriticalityFactor(data);
  
  // Weight the scores (physical and maintenance are most important)
  const weightedScore = (
    physical.score * 0.30 +
    maintenance.score * 0.30 +
    operational.score * 0.20 +
    environment.score * 0.20
  );
  
  // Apply criticality factor (reduces score for critical equipment)
  const adjustedScore = Math.round(weightedScore / criticality.factor);
  const finalScore = Math.max(0, Math.min(100, adjustedScore));
  
  // Determine governing factor (lowest scoring area)
  const scores = [
    { name: 'Physical Condition', score: physical.score },
    { name: 'Maintenance Compliance', score: maintenance.score },
    { name: 'Operational Stress', score: operational.score },
    { name: 'Environmental Factors', score: environment.score },
  ];
  const governing = scores.reduce((min, curr) => curr.score < min.score ? curr : min);
  
  // Collect all recommendations
  const recommendations: string[] = [
    ...physical.issues,
    ...maintenance.issues,
    ...operational.issues,
    ...environment.issues,
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
    physical_score: physical.score,
    criticality_score: Math.round(100 / criticality.factor),
    environment_score: environment.score,
    maintenance_score: maintenance.score,
    operational_score: operational.score,
  };
}

/**
 * Get default equipment data with reasonable values
 */
export function getDefaultEquipmentData(name: string, equipmentType: string): EquipmentData {
  return {
    name,
    equipment_type: equipmentType,
    capacity_utilization_percent: 60,
    operating_hours_per_day: 8,
    years_in_service: 0,
    maintenance_frequency_days: 90,
    inspection_frequency_days: 365,
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
