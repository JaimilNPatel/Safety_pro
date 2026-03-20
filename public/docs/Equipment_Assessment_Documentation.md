# SafetyPro Equipment Assessment Documentation

**Version:** 1.0  
**Date:** March 2026  
**Purpose:** Complete guide to equipment condition assessment, type-specific profiling, and risk scoring methodology

---

## Table of Contents

1. [Overview](#overview)
2. [Supported Equipment Types](#supported-equipment-types)
3. [Assessment Methodology](#assessment-methodology)
4. [Scoring System](#scoring-system)
5. [Type-Specific Profiles](#type-specific-profiles)
6. [Condition Evaluation](#condition-evaluation)
7. [Risk Recommendations](#risk-recommendations)
8. [Implementation Details](#implementation-details)

---

## Overview

The SafetyPro Equipment Assessment module provides a comprehensive evaluation framework for industrial equipment based on NFPA 70B standards and equipment-specific industry guidelines (API, ASME, TEMA, IEEE, IEC). The system evaluates equipment across five dimensions:

- **Physical Condition** - Structural integrity and visible degradation
- **Maintenance Compliance** - Adherence to scheduled maintenance and inspections
- **Operational Stress** - Operating parameters relative to design limits
- **Environmental Exposure** - Corrosive, vibration, and thermal stress conditions
- **Criticality Impact** - Safety and operational importance of the equipment

Each equipment type has unique failure modes, critical inspection points, and scoring weight adjustments based on industry standards and best practices.

---

## Supported Equipment Types

### 1. Chemical Reactor
**Service Life:** 25 years (typical)

**Application:** Batch or continuous chemical processes with catalysts, exothermic reactions, or multi-phase operations.

**Failure Modes:**
- Runaway reaction / thermal excursion
- Vessel wall thinning from corrosion under insulation (CUI)
- Agitator seal failure and bearing wear
- Nozzle cracking from thermal cycling stress
- Catalyst deactivation or fouling

**Critical Assessment Parameters:**
- Wall thickness (nominal vs. measured vs. minimum required)
- Corrosion rate (mm/year)
- Thermal cycling frequency
- Relief device operability
- Temperature control system accuracy
- Jacket/coil integrity

**Scoring Weights:**
- Physical: 35%
- Maintenance: 25%
- Operational: 25%
- Environment: 15%

**Key Inspection Items:**
- Wall thickness measurements via UT (ultrasonic testing)
- Agitator shaft seal and bearing condition
- Relief device testing and set pressure verification
- Jacket coil inspection for leaks and blockage
- Nozzle weld crack inspection
- Temperature sensor calibration
- Internal baffle and component inspection

---

### 2. Pump
**Service Life:** 15 years (typical)

**Application:** Centrifugal, reciprocating, or positive displacement pumps for process fluids.

**Failure Modes:**
- Mechanical seal failure and leakage
- Bearing wear and cage damage
- Impeller erosion (cavitation or sand)
- Misalignment and shaft deflection
- Coupling failure (gear or flexible element)

**Critical Assessment Parameters:**
- Vibration level (0-2.5 mm/s: normal, 2.5-7: elevated, 7-18: high, >18: critical)
- Seal condition (good/leaking/failed)
- Operating hours per day
- Capacity utilization percentage
- Design pressure and temperature

**Scoring Weights:**
- Physical: 25%
- Maintenance: 35%
- Operational: 25%
- Environment: 15%

**Key Inspection Items:**
- Vibration monitoring (ISO 20816 / API 670)
- Seal inspection for leaks
- Bearing temperature and noise assessment
- Alignment verification (laser or dial indicator)
- Coupling condition inspection
- Suction/discharge pressure and temperature trending
- Lube oil condition (if applicable)

---

### 3. Heat Exchanger
**Service Life:** 20 years (typical)

**Application:** Tubular, plate-fin, or spiral plate designs for thermal management.

**Failure Modes:**
- Tube fouling (scaling, sludge, biological growth)
- Joint failure (rolled tubes, soldered seams)
- Corrosion attack (general, pitting, galvanic)
- Vibration-induced damage
- Gasket or seal failure

**Critical Assessment Parameters:**
- Current vs. normal approach temperature (indicates fouling)
- Plugged tube count and total tube count
- Operating hours per day
- Capacity utilization
- Design pressure and temperature
- Relief valve setpoint

**Scoring Weights:**
- Physical: 30%
- Maintenance: 30%
- Operational: 20%
- Environment: 20%

**Key Inspection Items:**
- Shell-side inspection (access cover or eddy current scan)
- Tube-side chemical cleaning or mechanical cleaning assessment
- Pressure drop trending across shell and tubes
- Visual inspection of gasket sealing surfaces
- Thermal performance testing (actual vs. design duty)
- Vibration monitoring if in severe service
- Corrosion coupon analysis (if available)

---

### 4. Storage Tank
**Service Life:** 30 years (typical)

**Application:** Atmospheric or pressurized storage of process liquids, feedstocks, or products.

**Failure Modes:**
- Bottom corrosion and perforation
- Shell wall thinning
- Roof seal degradation and tank breathing leaks
- Foundation settlement causing shell stress
- Venting system failure

**Critical Assessment Parameters:**
- Settlement (mm) from baseline
- Floor plate corrosion presence
- Operating temperature and pressure
- Relief valve setpoint
- Capacity utilization
- Tank age

**Scoring Weights:**
- Physical: 35%
- Maintenance: 25%
- Operational: 15%
- Environment: 25%

**Key Inspection Items:**
- Internal inspection (gauging under-bottom for corrosion)
- Roof condition and seal integrity
- Foundation level survey and crack monitoring
- Shell thickness UT at multiple locations
- Weld seam inspection (X-ray or UT sampling)
- Breathing vent condition
- Dike or secondary containment integrity (if applicable)
- Annular plate and supporting structure

---

### 5. Compressor
**Service Life:** 20 years (typical)

**Application:** Reciprocating or centrifugal compressors for gas or vapor compression.

**Failure Modes:**
- Surge or stall conditions from process changes
- Valve failure (inlet, discharge, or unload)
- Bearing failure from contamination or lack of lubrication
- Packing wear and leakage
- Intercooler fouling reducing efficiency

**Critical Assessment Parameters:**
- Relief valve setpoint
- Capacity utilization percentage
- Lube oil condition
- Vibration level
- Operating hours per day
- Design pressure and temperature

**Scoring Weights:**
- Physical: 25%
- Maintenance: 35%
- Operational: 25%
- Environment: 15%

**Key Inspection Items:**
- Valve inspection and flow testing
- Bearing condition (temperature, noise, play)
- Packing gland leakage and wear assessment
- Intercooler tube inspection and cleaning
- Oil analysis (TAN, ISO particle count, ferrous wear metals)
- Vibration monitoring and balancing
- Relief device pop testing

---

### 6. Distillation Column
**Service Life:** 30 years (typical)

**Application:** Fractionation or distillation column for separation processes under pressure.

**Failure Modes:**
- Tray damage (weeping, downcomer leaks, mechanical damage)
- Reboiler tube failure or fouling
- Condenser fouling reducing capacity
- Shell corrosion and wall thinning
- Overhead corrosion from acid condensation

**Critical Assessment Parameters:**
- Current vs. normal pressure drop across trays
- Fouling level (none/light/moderate/heavy)
- Reboiler and condenser duty trending
- Design pressure and temperature
- Shell wall thickness measurements

**Scoring Weights:**
- Physical: 30%
- Maintenance: 25%
- Operational: 25%
- Environment: 20%

**Key Inspection Items:**
- Column internal inspection (camera or borescope)
- Tray stability and sump depth measurement
- Pressure drop trending across column
- Reboiler tube bundle condition
- Condenser fouling assessment
- Shell thickness UT sampling
- Corrosion coupon analysis
- Overhead piping internal inspection

---

### 7. Control System (Electrical/Instrumentation)
**Service Life:** 15 years (typical)

**Application:** Programmable logic controllers (PLC), distributed control systems (DCS), safety instrumented systems (SIS), or SCADA platforms.

**Failure Modes:**
- Sensor drift or calibration error
- Controller firmware obsolescence or bugs
- Network connectivity dropout
- Power supply unit (PSU) failure
- Environmental contamination (dust, humidity, temperature extremes)

**Critical Assessment Parameters:**
- Firmware last update date
- Calibration drift detected (yes/no)
- Age of system
- Operating temperature range
- Power redundancy status

**Scoring Weights:**
- Physical: 15%
- Maintenance: 40%
- Operational: 15%
- Environment: 30%

**Hidden Fields:** Design pressure/temp, safety relief, capacity %, operating hours, physical damage fields (not applicable to electrical systems)

**Key Inspection Items:**
- Firmware and software version audit vs. manufacturer recommendations
- Sensor calibration verification (analog input testing)
- Network connectivity and redundancy testing
- Control loop tuning performance audit
- Backup power system test (UPS, redundant PSU)
- Environmental monitoring (temperature, humidity, dust)
- Documentation and change control review

---

### 8. Safety Valve
**Service Life:** 10 years (typical, shorter than process equipment)

**Application:** Pressure relief device protecting equipment and systems from overpressure.

**Failure Modes:**
- Set pressure drift (creep from spring relaxation)
- Seat leakage causing weeping
- Spring fatigue from overpressure events
- Discharge blockage or backpressure rise
- Corrosion of spring or internal surfaces

**Critical Assessment Parameters:**
- Last pop test date and result
- Set pressure tolerance (%)
- Relief valve setpoint
- Discharge piping backpressure
- Age of valve

**Scoring Weights:**
- Physical: 25%
- Maintenance: 45%
- Operational: 10%
- Environment: 20%

**Hidden Fields:** All operational temps/pressures, capacity %, operating hours (valve does not "operate" in traditional sense)

**Key Inspection Items:**
- Pop test (bench testing for set pressure and cracking point)
- Visual inspection of valve body and bonnet for corrosion
- Seat and disc condition (bench inspection only)
- Spring condition and fatigue cracks
- Discharge piping inspection for blockage or corrosion
- Nameplate verification (set pressure, size, material)
- Maintenance records review (test frequency compliance)

---

### 9. Other Equipment
**Service Life:** 20 years (default fallback)

**Application:** Equipment types not specifically covered by dedicated profiles.

**Generic Failure Modes:**
- General degradation from age
- Inadequate maintenance
- Environmental stress (corrosion, vibration, temperature)
- Design or manufacturing defects
- Normal wear

**Scoring Weights:**
- Physical: 30%
- Maintenance: 30%
- Operational: 20%
- Environment: 20%

---

## Assessment Methodology

The SafetyPro equipment assessment follows a structured five-step process:

### Step 1: Data Collection
Gather information on the specific equipment using the Equipment Assessment Form:
- Equipment identity and type
- Design parameters (pressure, temperature, capacity)
- Operational parameters (current operating conditions, duty cycle)
- Maintenance history (last service, intervals, compliance %)
- Physical condition observations (damage, corrosion, leaks)
- Environmental exposure (temperature, humidity, corrosive agents)
- Criticality (safety-critical, redundancy status)

### Step 2: Profile Selection
Based on the equipment type, the system automatically retrieves the corresponding equipment profile with:
- Type-specific failure modes
- Industry-standard inspection checklists
- Scoring weight adjustments
- Expected service life reference
- Critical assessment parameters

### Step 3: Component Scoring
Five independent component scores are calculated (0-100 each):

#### 3.1 Physical Condition Score
- Base physical rating (visual inspection: 1–5 scale)
- Penalty deductions:
  - Visible damage: -15 points
  - Corrosion presence: -15 points
  - Active leaks: -20 points
  - Age exceeds expected life: -10 points
  - Age approaching end of life (>75% of expected): -5 points

#### 3.2 Maintenance Compliance Score
- Maintenance scheduling compliance:
  - On-time: 0 penalty
  - 1–1.5× overdue: -20 points
  - >1.5× overdue: -40 points
- Inspection scheduling compliance:
  - Overdue inspection: -15 points
- Maintenance compliance percentage:
  - <80%: -20 points
  - 80–90%: -10 points
- Outstanding work orders:
  - 2–5 orders: -8 points
  - >5 orders: -15 points

#### 3.3 Operational Stress Score
- Pressure stress:
  - >90% of design: -15 points
  - >95% of design: -25 points
- Temperature stress:
  - >90% of design: -15 points
  - >95% of design: -25 points
- Duty cycle stress:
  - Capacity >90%: -10 points
  - Operating >20 hrs/day: -10 points
- Base: 100 points

#### 3.4 Criticality Assessment Score
- From safety-critical status and redundancy
- Critical, no redundancy: lower base score
- Non-critical or redundant: higher base score used as context

#### 3.5 Environmental Exposure Score
- Corrosive exposure: -20 points
- Vibration exposure: -15 points
- Extreme temperature exposure: -15 points
- Base: 100 points

### Step 4: Type-Specific Checks
Equipment-type-specific rules apply additional deductions based on the profile. Examples:

**Reactor checks:**
- Pressure >90% of design → -15 to operational score
- Temperature >90% of design → -15 to operational score

**Pump checks:**
- High vibration (>7 mm/s) → -15 to physical score
- Operating >20 hrs/day → -10 to operational score
- >90% capacity → -10 to operational score

**Storage Tank checks:**
- Settlement detected → -20 to physical score
- Floor corrosion present → -25 to physical score
- Tank age >25 years → -10 to physical score
- Corrosive environment → -15 to environmental score

**Control System checks:**
- Age >10 years without firmware update → -15 to physical score
- Extreme temperature exposure → -15 to environmental score

**Safety Valve checks:**
- Corrosion present → -25 to physical score
- Corrosive service → -15 to environmental score
- Set pressure tolerance >5% → -10 to operational score

### Step 5: Final Scoring and Recommendations
**Overall Condition Score** (0–100):
$$\text{Condition Score} = (P_s \times W_p) + (M_s \times W_m) + (O_s \times W_o) + (E_s \times W_e)$$

Where:
- $P_s$ = Physical Condition Score
- $M_s$ = Maintenance Compliance Score
- $O_s$ = Operational Stress Score
- $E_s$ = Environmental Exposure Score
- $W_p, W_m, W_o, W_e$ = Type-specific weights (sum to 1.0)

**Condition Rating:**
- **90–100:** Excellent (like-new condition, optimal maintenance)
- **75–89:** Good (acceptable condition, routine maintenance)
- **60–74:** Fair (aging equipment, increased attention needed)
- **40–59:** Poor (significant issues, urgent maintenance required)
- **0–39:** Critical (severe degradation, immediate action required)

---

## Scoring System

### Scoring Weights by Equipment Type

| Equipment Type | Physical | Maintenance | Operational | Environment |
|---|---|---|---|---|
| Reactor | 35% | 25% | 25% | 15% |
| Pump | 25% | 35% | 25% | 15% |
| Heat Exchanger | 30% | 30% | 20% | 20% |
| Storage Tank | 35% | 25% | 15% | 25% |
| Compressor | 25% | 35% | 25% | 15% |
| Distillation Column | 30% | 25% | 25% | 20% |
| Control System | 15% | 40% | 15% | 30% |
| Safety Valve | 25% | 45% | 10% | 20% |
| Other | 30% | 30% | 20% | 20% |

**Rationale:**

- **Reactor & Storage Tank:** Higher physical weighting reflects structural integrity priority
- **Pump & Compressor:** Higher maintenance weighting reflects seal/bearing complexity
- **Control System:** Highest maintenance weighting (40%) reflects software updates and calibration needs; highest environment weighting (30%) reflects sensitivity to temperature/humidity extremes
- **Safety Valve:** Highest maintenance weighting (45%) reflects critical regulatory testing requirements; lowest operational weighting (10%) as valves don't "operate" continuously
- **Heat Exchanger & Distillation Column:** Balanced weights reflecting both mechanical integrity and fouling/performance degradation

### Penalty Deduction Ranges

| Severity | Deduction Range | Typical Issues |
|---|---|---|
| Minor | 5–10 points | Early wear indicators, minor leaks |
| Moderate | 10–20 points | Visible damage, moderate corrosion |
| Significant | 20–40 points | Multiple issues, equipment near limits |
| Critical | >40 points | Structural concern, immediate danger |

---

## Type-Specific Profiles

### Profile Structure

Each equipment profile contains:

```typescript
interface EquipmentProfile {
  type: string;                    // Unique identifier
  label: string;                   // Display name
  failureModes: string[];          // Industry failure modes
  inspectionChecklist: string[];   // Recommended inspection items
  primaryFields: string[];         // Most relevant form fields
  hiddenFields: string[];          // Fields not applicable
  scoringWeights: {                // Type-specific weights
    physical: number;
    maintenance: number;
    operational: number;
    environment: number;
  };
  expectedLifeYears: number;       // Design service life
  defaultMaintenanceDays: number;  // Recommended interval
  defaultInspectionDays: number;   // Recommended interval
  conditionDescriptors: [string, string, string]; // Good/Warning/Critical
  typeSpecificChecks: TypeSpecificCheck[]; // Extra rules
}
```

### Condition Descriptors

Type-specific condition assessment language:

**Reactor:**
- Good: "Vessel condition within acceptable limits; no evidence of internal corrosion or mechanical damage"
- Warning: "Localized corrosion noted; some evidence of deterioration; recommend UT wall thickness study"
- Critical: "Significant pit formation, wall thinning, or active leakage; vessel integrity compromised"

**Pump:**
- Good: "Seal and bearing condition normal; vibration within acceptable bands"
- Warning: "Increased vibration observed; minor seal leakage; recommend re-alignment or bearing inspection"
- Critical: "Severe vibration, seal failure, or bearing damage; pump removal required"

**Storage Tank:**
- Good: "Tank foundation stable; shell thickness acceptable; no corrosion concerns"
- Warning: "Minor settlement observed; localized corrosion; recommend enhanced inspection intervals"
- Critical: "Foundation settlement >10 mm detected; significant shell corrosion; vessel structural integrity at risk"

---

## Condition Evaluation

### Physical Condition Assessment (1–5 Scale)

**1 = Excellent/Like-New**
- No visible wear or damage
- All surfaces clean and protected
- Equipment appears factory-fresh
- Fully compliant with design standards

**2 = Good/Minor Wear**
- Light surface oxidation or minor scratches
- Normal wear from operation
- No functional concerns
- All safety systems intact

**3 = Fair/Moderate Degradation**
- Visible corrosion or surface loss
- Signs of wear on moving parts
- Minor operational issues manifesting
- Attention required but not urgent

**4 = Poor/Significant Degradation**
- Heavy corrosion or section loss
- Noticeable performance degradation
- Multiple areas of concern
- Immediate action planning needed

**5 = Critical/Severe Damage**
- Structural defects or perforation
- Functional impairment
- Safety implications
- Equipment removal or emergency repair required

### Environmental Condition Assessment (1–3 Scale)

**1 = Benign**
- Controlled indoor environment
- Room temperature and humidity
- No corrosive agents present
- Minimal vibration or stress

**2 = Moderate**
- Normal outdoor environment or industrial area
- Temperature fluctuations within 0–50°C
- Minor mist or humidity exposure
- Some ambient vibration from nearby equipment

**3 = Severe**
- Harsh chemical exposure (chlorine, ammonia, caustic)
- Extreme temperatures (<−20°C or >60°C)
- High humidity or marine environment
- Significant vibration from nearby machinery

---

## Risk Recommendations

The system generates actionable recommendations based on condition score and identified issues:

### Excellent (90–100)
- Continue planned maintenance schedule
- Annual assessments sufficient
- Equipment suitable for critical service

### Good (75–89)
- Execute scheduled maintenance on time
- Semi-annual assessments recommended
- Suitable for most critical applications with redundancy

### Fair (60–74)
- Increase maintenance frequency by 25%
- Quarterly assessments recommended
- Consider capacity deration or redundancy additions
- Plan for equipment replacement in next cycle

### Poor (40–59)
- Increase maintenance frequency by 50%
- Monthly assessments required
- Reduce operating stress (lower pressure, temperature, capacity)
- De-rate equipment from critical service
- Develop replacement schedule

### Critical (0–39)
- IMMEDIATE intervention required
- Daily monitoring essential
- Prepare emergency repair or replacement plan
- Remove from critical service immediately
- Isolate equipment if possible
- Safety assessment required before continued operation

---

## Implementation Details

### Data Structure

The Equipment Assessment Form captures the following data:

```typescript
interface EquipmentData {
  // Identity
  name: string;
  equipment_type: string;
  
  // Design Parameters
  design_pressure_psi?: number;
  design_temperature_c?: number;
  safety_relief_setpoint_psi?: number;
  
  // Operational Parameters
  max_operating_pressure_psi?: number;
  max_operating_temperature_c?: number;
  current_operating_pressure_psi?: number;
  current_operating_temperature_c?: number;
  capacity_utilization_percent: number;
  operating_hours_per_day: number;
  
  // Age & Service History
  years_in_service: number;
  last_maintenance_date?: string;
  maintenance_frequency_days: number;
  last_inspection_date?: string;
  inspection_frequency_days: number;
  maintenance_compliance_percent: number;
  outstanding_work_orders: number;
  
  // Physical Condition
  physical_condition: 1 | 2 | 3 | 4 | 5;
  has_visible_damage: boolean;
  has_corrosion: boolean;
  has_leaks: boolean;
  
  // Criticality & Redundancy
  criticality_level: 1 | 2 | 3;
  is_safety_critical: boolean;
  redundancy_available: boolean;
  
  // Environmental Exposure
  environment_condition: 1 | 2 | 3;
  exposed_to_corrosive: boolean;
  exposed_to_vibration: boolean;
  exposed_to_extreme_temp: boolean;
  
  // Type-Specific Fields (as applicable)
  wall_thickness_nominal_mm?: number;
  wall_thickness_measured_mm?: number;
  corrosion_rate_mm_per_year?: number;
  vibration_level_mm_per_sec?: number;
  approach_temp_normal_c?: number;
  approach_temp_current_c?: number;
  seal_condition?: 'Good' | 'Leaking' | 'Failed';
  settlement_mm?: number;
  // ... and more
}
```

### Output Structure

The assessment generates a comprehensive report:

```typescript
interface ConditionResult {
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  condition_score: number;  // 0–100
  governing_factor: string; // Which factor most impacts score
  
  // Component Scores
  physical_score: number;
  maintenance_score: number;
  operational_score: number;
  environment_score: number;
  criticality_score: number;
  
  // Recommendations
  recommendations: string[];
}
```

### Integration with SafetyPro

The Equipment Assessment module integrates with:

1. **Dashboard** - Summary cards showing equipment condition by type
2. **Inspection Workflows** - Checklists and trending
3. **Risk Assessments** - Equipment included in Dow Fire & Explosion Index calculations
4. **Compliance Reporting** - Automatic flagging of maintenance overdue or critical conditions
5. **Database** - Equipment profiles stored in Supabase for historical trending

---

## Standards & References

### Industry Standards

- **API 510** - Pressure Vessel Inspection Code: In-service inspection, rating, repair, and alteration
- **API 617** - Compressors (Centrifugal) for Petroleum, Chemical, and Gas Service
- **API 618** - Reciprocating Compressors for Petroleum, Chemical, and Gas Service
- **API 650** - Welded Tanks for Oil Storage
- **API 653** - Tank Inspection, Repair, Alteration, and Reconstruction
- **API 660** - Shell-and-Tube Heat Exchangers
- **API 682** - Centrifugal Pumps for Petroleum, Heavy Duty Chemical, and Refinery Service
- **ASME BPVC Section VIII** - Pressure Vessels
- **NFPA 70B** - Standard for Electrical Equipment Maintenance
- **TEMA** - Standards of the Tubular Exchanger Manufacturers Association
- **IEC 61511** - Functional Safety: Safety Instrumented Systems
- **ISO 20816** - Mechanical vibration — Measurement and evaluation of machine vibration

### References

- **Dow's Fire & Explosion Index Hazard Classification Guide** (7th ed., AIChE, 1994)
- **NFPA 704** - Standard System for the Identification of the Hazards of Materials
- **ANSI/ASME B11.19** - Machinery Safety: General Requirements and Risk Assessment
- **ISO 12922** - Lubricants, industrial oils, and related products — Classification and specifications

---

## Revision History

| Version | Date | Changes |
|---|---|---|
| 1.0 | March 2026 | Initial documentation; 9 equipment types, 5-factor scoring |

---

**For support or questions, contact SafetyPro technical documentation team.**
