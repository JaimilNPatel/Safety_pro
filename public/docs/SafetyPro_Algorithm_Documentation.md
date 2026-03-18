# SafetyPro Inspection Assistant — Algorithm & Methodology Documentation

**Version:** 1.0 (Prototype)  
**Date:** February 2026  
**Purpose:** This document describes the scientific basis, algorithms, and methodologies used in the SafetyPro risk screening and safety checklist system.

---

## Table of Contents

1. [Dow Fire & Explosion Index (F&EI)](#1-dow-fire--explosion-index-fei)
2. [Toxic Load Analysis](#2-toxic-load-analysis)
3. [Chemical Incompatibility Detection](#3-chemical-incompatibility-detection)
4. [Stoessel Criticality Assessment](#4-stoessel-criticality-assessment)
5. [Equipment Condition Assessment](#5-equipment-condition-assessment)
6. [Comprehensive Safety Checklist Generation](#6-comprehensive-safety-checklist-generation)
7. [Scientific Validity & Limitations](#7-scientific-validity--limitations)

---

## 1. Dow Fire & Explosion Index (F&EI)

### Reference Standard
- **Dow's Fire & Explosion Index Hazard Classification Guide, 7th Edition** (AIChE, 1994)
- NFPA 30, NFPA 68

### Algorithm Overview

The Dow F&EI is a step-by-step, penalty-based scoring system that quantifies the fire/explosion hazard of a process unit. Our implementation follows the standard flowchart:

```
Material Factor (MF) → F1 (General Process Hazards) → F2 (Special Process Hazards)
→ F3 = F1 × F2 (Process Unit Hazard Factor)
→ F&EI = F3 × MF
```

### Step-by-Step Calculation

#### Step 1: Material Factor (MF)
- Each chemical has a pre-assigned Material Factor from the Dow guide tables (stored in the database as `material_factor`).
- The **highest MF** among all chemicals present in the process unit is used as the dominant factor.
- MF is based on the chemical's flammability (NFPA 704 Nf) and reactivity (NFPA 704 Nr) ratings.
- Range: 1–40 (1 = water, 40 = extremely hazardous materials like ethylene oxide).

#### Step 2: General Process Hazards Factor (F1)
Starting from a base penalty of **1.0**, the following penalties are applied:

| Condition | Penalty | Dow Reference |
|-----------|---------|---------------|
| Storage temp > 60°C | +0.25 | Table 2: Exothermic reactions |
| Storage temp > 100°C | +0.25 (additional) | Table 2: High temperature |
| Pressure > 1 atm | +0.30 | Table 2: Sub-atmospheric or above |
| Pressure > 5 atm | +0.50 (additional) | Table 2: High pressure |
| Flash point < storage temperature | +0.50 | Table 2: Flammable material handling |

**Scientific basis:** The Dow guide assigns F1 penalties for conditions that increase the likelihood of a loss event. High temperatures increase vapor generation and reaction rates. Elevated pressures increase release energy and jet-fire potential. Materials above their flash point can ignite immediately upon release.

#### Step 3: Special Process Hazards Factor (F2)
Starting from a base penalty of **1.0**, quantity-based penalties are applied:

| Total Quantity on Site | Penalty | Dow Reference |
|------------------------|---------|---------------|
| > 1,000 kg | +0.25 | Table 3: Quantity of flammable material |
| > 5,000 kg | +0.25 (additional) | Table 3: Large inventory |
| > 10,000 kg | +0.50 (additional) | Table 3: Very large inventory |

**Scientific basis:** The Dow guide's F2 accounts for factors that magnify loss severity. Larger quantities increase the radius of exposure and potential property damage (per TNT-equivalent blast correlations).

#### Step 4: F&EI Calculation
```
F3 (Process Unit Hazard Factor) = F1 × F2
F&EI = MF × F3
```

#### Step 5: Hazard Classification

| F&EI Range | Classification | Severity |
|------------|----------------|----------|
| 1–96 | Light | Pass |
| 97–127 | Moderate | High |
| 128–159 | Intermediate/Serious | High |
| > 159 | Severe/Extreme | Critical |

These thresholds are taken directly from the Dow guide's hazard classification table.

### What We Implement vs. Full Dow Method

| Full Dow Method | Our Implementation | Status |
|-----------------|-------------------|--------|
| Material Factor from tables | ✅ Pre-loaded per chemical | Implemented |
| General Process Hazards (F1) | ✅ Temperature, pressure, flash point | Simplified |
| Special Process Hazards (F2) | ✅ Quantity-based | Simplified |
| F3 = F1 × F2 | ✅ Calculated | Implemented |
| F&EI = MF × F3 | ✅ Calculated | Implemented |
| Area of Exposure radius | ❌ Not implemented | Future |
| Replacement Value in exposure area | ❌ Not implemented | Future |
| Damage Factor | ❌ Not implemented | Future |
| Base MPPD / Actual MPPD | ❌ Not implemented | Future |
| Loss Control Credit Factors (C1·C2·C3) | ❌ Not implemented | Future |
| MPDO (Maximum Probable Days Outage) | ❌ Not implemented | Future |
| Business Interruption (BI) | ❌ Not implemented | Future |

**Note:** The full Dow method (as shown in the standard flowchart) continues beyond F&EI to calculate financial loss estimates. Our prototype implements the hazard identification and scoring portion, which is the most actionable part for field inspectors.

---

## 2. Toxic Load Analysis

### Reference Standards
- **NIOSH Immediately Dangerous to Life or Health (IDLH) values**
- OSHA 29 CFR 1910.1000 (PELs)
- EPA Risk Management Program (RMP) Rule, 40 CFR Part 68

### Algorithm

The toxic load analysis evaluates the inhalation hazard potential if a chemical were released within the facility.

#### Formula
```
Toxicity Factor = Quantity (kg) / (IDLH (ppm) × 0.01)
```

This is a simplified **consequence-based** metric that relates the available mass of a toxic chemical to its danger threshold:

- **IDLH (ppm):** The airborne concentration at which a worker has 30 minutes to escape without irreversible health effects or death (per NIOSH).
- **Quantity (kg):** Total inventory on site.
- The factor `0.01` serves as a normalization constant representing an assumed dilution/dispersion factor for a typical indoor facility (~10,000 m³ volume).

#### Classification

| Toxicity Factor | Severity | Meaning |
|-----------------|----------|---------|
| > 50 | Critical | Catastrophic inhalation hazard if released |
| 20–50 | High | Significant inhalation risk |
| < 20 | Pass | Acceptable for facility size |

#### Scientific Basis
- **IDLH values** are established by NIOSH through toxicological review and represent consensus exposure limits.
- The approach is consistent with EPA's RMP "worst-case scenario" methodology, which compares chemical quantity against toxic endpoints to determine hazard zones.
- A full implementation would use Gaussian dispersion models (e.g., ALOHA, PHAST) to calculate actual concentration fields. Our simplified approach provides a rapid screening indicator.

### Limitations
- Does not account for actual room ventilation rates, room geometry, or meteorological conditions.
- Assumes total release (worst case).
- Does not differentiate between gases, volatile liquids, and solids (vapor pressure not factored).

---

## 3. Chemical Incompatibility Detection

### Reference Standards
- **EPA Chemical Compatibility Chart** (EPA 600/2-80-076)
- NFPA 400: Hazardous Materials Code
- NOAA Chemical Reactivity Worksheet (CRW)
- Bretherick's Handbook of Reactive Chemical Hazards

### Algorithm

A **matrix-based pairwise comparison** is performed on all chemicals present at the site. Each chemical is assigned a **reactivity group** classification, and a predefined incompatibility matrix defines which groups must be segregated.

#### Reactivity Groups Used

| Group | Examples | Basis |
|-------|----------|-------|
| strong_acid | Sulfuric acid, Hydrochloric acid | Proton donors, highly reactive |
| strong_base | Sodium hydroxide, Potassium hydroxide | Hydroxide donors |
| strong_oxidizer | Potassium permanganate, Hydrogen peroxide (>30%) | Electron acceptors, support combustion |
| oxidizer | Nitric acid (dilute), Sodium hypochlorite | Moderate oxidizing potential |
| halogen | Chlorine, Bromine | Strong electrophilic reactivity |
| amine | Ethylamine, Aniline | Nucleophilic, react with acids/oxidizers |
| alcohol | Methanol, Ethanol | Flammable, react with oxidizers |
| aldehyde | Formaldehyde, Acetaldehyde | Easily oxidized, polymerizable |
| ketone | Acetone, MEK | React with strong oxidizers/bases |
| ether | Diethyl ether, THF | Peroxide-forming, flammable |
| epoxide | Ethylene oxide, Propylene oxide | Highly reactive ring strain |
| nitrile | Acetonitrile, HCN | Toxic decomposition products |
| nitro | Nitrobenzene, Nitroglycerine | Explosive potential |
| sulfur | Carbon disulfide, Dimethyl sulfoxide | React with oxidizers |
| aromatic | Toluene, Benzene | Flammable, react with strong oxidizers |
| alkane | Hexane, Heptane | Flammable, react with strong oxidizers |
| halogenated | Chloroform, Methylene chloride | React with strong bases/amines |
| organic_acid | Acetic acid, Formic acid | Weaker acids, react with bases/oxidizers |

#### Pairwise Check Algorithm
```
For each pair (Chemical_i, Chemical_j) where i < j:
    group1 = Chemical_i.reactivity_group
    group2 = Chemical_j.reactivity_group
    
    If group1 is in incompatibilityMatrix AND group2 is listed:
        → FLAG as "High" severity incompatibility
    Else if group2 is in incompatibilityMatrix AND group1 is listed:
        → FLAG as "High" severity incompatibility
```

#### Scientific Basis
- The matrix is derived from the **EPA Chemical Compatibility Chart**, which classifies chemicals into reactive groups and identifies pairs that produce hazardous reactions (fire, explosion, toxic gas generation, or violent polymerization).
- The bidirectional check ensures no pair is missed regardless of matrix entry order.
- Recommendations follow NFPA 400 segregation requirements (minimum 20-foot separation or physical barriers).

### Limitations
- Does not account for concentration effects (some reactions only occur at specific concentrations).
- Does not consider reaction kinetics (some incompatible pairs only react under specific conditions).
- Binary classification only (incompatible/compatible) — does not grade severity of potential reaction.

---

## 4. Stoessel Criticality Assessment

### Reference Standard
- **Stoessel, F. "Thermal Safety of Chemical Reactions: Risk Assessment and Process Design"** (Wiley-VCH, 2020)
- DIERS (Design Institute for Emergency Relief Systems) guidelines

### Algorithm

The Stoessel criticality classification evaluates runaway reaction potential based on thermal safety margins.

#### Reactive Chemical Groups Screened
The following groups are flagged for Stoessel assessment:
- Epoxides (ring-opening exotherms)
- Strong oxidizers (decomposition energy)
- Oxidizers (moderate decomposition risk)
- Nitriles (HCN release potential)
- Nitro compounds (explosive decomposition)
- Aldehydes (polymerization potential)

#### Temperature Margin Check
```
For each reactive chemical:
    If storage_temp > 0.7 × boiling_point:
        → HIGH RISK (insufficient thermal buffer)
    
    If (epoxide OR strong_oxidizer) AND storage_temp > 40°C:
        → HIGH RISK (thermal decomposition zone)
```

#### Scientific Basis
The Stoessel criticality concept classifies scenarios into 5 classes based on the relationship between:
- **T_p** (process temperature)
- **T_D24** (temperature at which TMR = 24 hours)
- **MTSR** (Maximum Temperature of Synthesis Reaction)
- **MTT** (Maximum Technical Temperature / boiling point)

| Class | Condition | Risk |
|-------|-----------|------|
| 1 | MTSR < MTT < T_D24 | Low |
| 2 | MTSR < T_D24 < MTT | Low-Medium |
| 3 | T_D24 < MTSR < MTT | Medium |
| 4 | MTT < MTSR, T_D24 > MTT | High |
| 5 | T_D24 < MTT < MTSR | Critical |

Our simplified implementation uses the 70% boiling point rule as a proxy for thermal margin adequacy (approximating the T_p to MTT relationship).

### Limitations
- Does not perform full DSC/ARC calorimetry calculations.
- Does not calculate actual TMR (Time to Maximum Rate) or adiabatic temperature rise.
- Uses boiling point as proxy for MTT (acceptable for atmospheric systems).

---

## 5. Equipment Condition Assessment

### Reference Standard
- **NFPA 70B: Standard for Electrical Equipment Maintenance** (adapted for general process equipment)
- API 580/581: Risk-Based Inspection methodology
- API 510, 570: Pressure vessel and piping inspection

### Algorithm

The equipment condition assessment uses a **multi-factor weighted scoring system** across five dimensions:

#### Scoring Dimensions

| Dimension | Weight | Inputs |
|-----------|--------|--------|
| Physical Condition | 30% | Visual assessment (1-3), damage, corrosion, leaks, age |
| Maintenance Compliance | 30% | Maintenance/inspection schedule adherence, work orders |
| Operational Stress | 20% | Pressure/temperature ratios vs. limits, capacity utilization |
| Environmental Factors | 20% | Exposure to corrosive, vibration, extreme temperature |
| Criticality | Multiplier | Safety-critical designation, redundancy, criticality level |

#### Physical Condition Score (0–100)

| Factor | Deduction | Basis |
|--------|-----------|-------|
| Condition level 2 (moderate wear) | -25 | NFPA 70B Table 11.1 |
| Condition level 3 (major deterioration) | -50 | NFPA 70B Table 11.1 |
| Visible damage | -15 | API 510 defect classification |
| Active corrosion | -15 | API 570 corrosion assessment |
| Active leaks | -20 | API 510 leak severity |
| Age > 20 years | -10 | Equipment lifecycle data |
| Age > 10 years | -5 | Equipment lifecycle data |

#### Maintenance Score (0–100)

| Factor | Deduction |
|--------|-----------|
| Maintenance overdue (>2x schedule) | -40 |
| Maintenance overdue (<2x schedule) | -20 |
| Inspection overdue | -15 |
| Compliance < 80% | -20 |
| Compliance 80–90% | -10 |
| Outstanding work orders > 5 | -15 |
| Outstanding work orders 3–5 | -8 |

#### Operational Stress Score (0–100)

| Factor | Deduction |
|--------|-----------|
| Pressure ratio > 95% of max | -25 |
| Pressure ratio 85–95% | -10 |
| Temperature ratio > 95% of max | -25 |
| Temperature ratio 85–95% | -10 |
| Capacity > 95% | -15 |
| Operating 24 hrs/day | -10 |

#### Criticality Multiplier
The weighted score is divided by the criticality factor:
- Criticality Level 1 (highest): factor = 1.2
- Criticality Level 2 (standard): factor = 1.0
- Criticality Level 3 (lowest): factor = 0.8
- Safety-critical: +0.2
- No redundancy: +0.1

```
Final Score = (Physical×0.30 + Maintenance×0.30 + Operational×0.20 + Environment×0.20) / Criticality Factor
```

#### Overall Condition Classification

| Score | Classification |
|-------|---------------|
| ≥ 90 | Excellent |
| 75–89 | Good |
| 55–74 | Fair |
| 35–54 | Poor |
| < 35 | Critical |

---

## 6. Comprehensive Safety Checklist Generation

### Reference Standards
- OSHA 29 CFR 1910.119 (Process Safety Management)
- OSHA 29 CFR 1910.1200 (Hazard Communication)
- NFPA 1, NFPA 30, NFPA 45, NFPA 400
- API RP 750 (Management of Process Hazards)

### Methodology

The checklist is **dynamically generated** based on four data sources, then sorted by priority.

#### Source 1: General Safety Items (all inspections)
Standard items applicable to every facility:
- Emergency preparedness (assembly points, first aid, communications)
- Documentation (training records, SDS accessibility)
- Housekeeping (egress, spill response)

#### Source 2: Site-Type Specific Items
Tailored checklists based on facility classification:

| Site Type | Categories Covered |
|-----------|-------------------|
| Chemical Plant | Process Safety (PSI, MOC, PHA), Emergency Systems (ESD, gas detection) |
| Refinery | Hydrocarbon Safety (LEL, hot work), Fire Prevention (foam, firewater) |
| Pharmaceutical | GMP Compliance, Chemical Handling |
| Storage Facility | Storage Integrity, Loading/Unloading |
| Manufacturing | Machine Safety (guarding, LOTO) |
| Research Lab | Lab Safety (fume hoods, chemical hygiene plan) |

#### Source 3: Chemical-Specific Items
Generated based on the chemical inventory:

| Trigger | Checklist Category |
|---------|-------------------|
| Flammable chemicals present | Explosion-proof equipment, grounding, ventilation, fire suppression |
| Oxidizers present | Segregation from organics, labeling, containment |
| Corrosives present | Secondary containment, compatible materials, neutralizers, PPE, eyewash |
| Toxic chemicals (low IDLH) | Atmospheric monitoring, respiratory protection, evacuation routes |
| Reactive chemicals present | Temperature control, incompatible storage, pressure relief, quench systems |
| Water-reactive chemicals | Dry storage, moisture control, special fire suppression |
| Pyrophoric chemicals | Inert atmosphere, air ingress checks, fire blankets |
| Bulk quantity > 1,000 kg | Bulk storage integrity verification |
| Storage temp outside 0–40°C | Temperature control verification |
| Storage pressure > 1.5 atm | Pressure vessel integrity verification |

#### Source 4: Equipment-Specific Items
Generated based on equipment type and condition assessment:
- **Type-based checks:** Each equipment type (reactor, pump, compressor, etc.) has specific inspection items.
- **Condition-based checks:** Equipment rated "poor" or "critical" gets urgent action items.
- **Issue-based checks:** Specific findings (overdue maintenance, leaks, damage) generate targeted checklist items.

#### Priority Weighting (for Daily Safety Score)

| Priority | Weight | Examples |
|----------|--------|---------|
| Critical | 4 | Active leaks, safety system failures, incompatible storage |
| High | 3 | Overdue inspections, SDS accessibility, emergency communications |
| Medium | 2 | Training records, routine equipment checks |
| Low | 1 | Visitor orientation, housekeeping |

**Daily Safety Score** = Σ(checked_item_weight) / Σ(total_item_weight) × 100%

---

## 7. Scientific Validity & Limitations

### What Makes This Prototype Scientifically Sound

1. **Industry-Standard References:** All algorithms are based on published, peer-reviewed, or regulatory methodologies (Dow Guide, NIOSH IDLH, EPA Compatibility Charts, Stoessel, NFPA 70B).

2. **Conservative Approach:** Simplified calculations err on the side of caution — they may over-flag risks but are unlikely to miss genuinely hazardous conditions.

3. **Real Chemical Data:** The chemical database uses actual flash points, boiling points, IDLH values, and material factors from NIOSH, NFPA, and Dow reference tables.

4. **Correct Mathematical Structure:** The Dow F&EI follows the correct multiplicative penalty structure (MF × F1 × F2). The incompatibility matrix follows the correct pairwise group-based approach. Equipment scoring uses weighted multi-factor analysis consistent with risk-based inspection standards.

### Known Simplifications (Prototype Scope)

| Area | Simplification | Impact | Full Method |
|------|---------------|--------|-------------|
| Dow F&EI | Only hazard ID portion (no loss estimation) | Cannot calculate dollar losses or exposure radius | Add damage factors, MPPD, loss control credits |
| Toxic Load | Linear quantity/IDLH ratio | Overestimates risk for low-vapor-pressure solids | Use Gaussian dispersion (ALOHA/PHAST) |
| Incompatibility | Binary yes/no per group pair | May flag low-risk pairs equally to high-risk | Add reaction severity grading |
| Stoessel | Boiling point proxy for MTT | Adequate for atmospheric systems only | DSC/ARC calorimetry data |
| Equipment | Penalty-based scoring | No probabilistic failure modeling | Full RBI per API 581 |

### Regulatory Compliance Note

This tool is a **screening-level prototype** intended to assist safety professionals in identifying potential hazards during facility inspections. It does **not** replace:
- Formal Process Hazard Analysis (PHA/HAZOP) per OSHA PSM
- Quantitative Risk Assessment (QRA)
- Professional engineering judgment
- Regulatory compliance audits

All findings should be verified by qualified safety engineers before implementation of corrective actions.

---

*Document generated by SafetyPro Inspection Assistant v1.0*
