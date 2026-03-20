# SafetyPro NH₃ Safety Module Documentation

**Version:** 1.0  
**Date:** March 2026  
**Purpose:** Complete guide to ammonia facility safety management, including hazard assessment, dispersion modeling, risk analysis, equipment inspection, and incident tracking

---

## Table of Contents

1. [Overview & Critical Parameters](#overview--critical-parameters)
2. [Module Architecture](#module-architecture)
3. [Dispersion Calculator](#dispersion-calculator)
4. [LOPA & SIL Estimator](#lopa--sil-estimator)
5. [Equipment Checklists](#equipment-checklists)
6. [Incident Tracker](#incident-tracker)
7. [Database Schema](#database-schema)
8. [Safety Standards & References](#safety-standards--references)
9. [Disclaimer & Limitations](#disclaimer--limitations)

---

## Overview & Critical Parameters

### Why Ammonia Safety?

Ammonia (NH₃) is a critical utility in fertilizer production, refrigeration, chemical synthesis, and petroleum refining. While essential for industrial operations, ammonia presents significant hazards:

- **Immediate Danger to Life and Health (IDLH):** 25 ppm (NIOSH)
- **Flammable Range:** 15–28% in air at room temperature
- **Lethal Concentration (LC₅₀, 1 hour):** ~1000 ppm
- **Odor Threshold:** 1–5 ppm (detectable but unreliable as sole warning)
- **Boiling Point:** −33.3°C (−28°F) at 1 atm; liquefied at higher pressures
- **Toxicity:** Irritant to mucous membranes; pulmonary edema at high concentrations

### Key Safety Distinctions

| Parameter | Value | Significance |
|---|---|---|
| **IDLH (Immediately Dangerous to Life or Health)** | 25 ppm | Maximum safe exposure limit for evacuation / emergency response |
| **ERPG-2 (Emergency Response Planning Guideline)** | 150 ppm | Maximum safe exposure without serious health effect for 1 hour |
| **ERPG-3 (Emergency Response Planning Guideline)** | 3000 ppm | Maximum safe exposure without lethal effect for 1 hour |
| **LC₅₀ (Lethal Concentration)** | ~1000 ppm | Concentration lethal to 50% of exposed population over 1 hour |
| **Flammable Range (LFL–UFL)** | 15–28% | Concentration range of ammonia vapor in air that can ignite |

---

## Module Architecture

### Module Organization

The NH₃ Safety Module is organized as a dedicated sub-application with the following structure:

```
/src/pages/
├── NH3Module.tsx               (Hub page / landing)
└── nh3/
    ├── DispersionCalculator.tsx (Toxic gas dispersion model)
    ├── LopaEstimator.tsx       (Layer of Protection Analysis / SIL)
    ├── NH3Checklists.tsx       (Equipment-specific inspection checklists)
    └── IncidentTracker.tsx     (Incident & near-miss documentation)
```

### Navigation & Integration

**Entry Point:** Main SafetyPro navigation menu → NH₃ Safety Module

**Standard Routes:**
- `/nh3` - NH₃ Module landing page
- `/nh3/dispersion` - Dispersion calculator
- `/nh3/lopa` - LOPA & SIL estimator
- `/nh3/checklists` - Equipment inspection checklists
- `/nh3/incidents` - Incident tracker and analytics

### Access Control

All NH₃ module components are protected routes requiring user authentication. Access is role-based:
- **Viewer:** Can view historical data and reports
- **Engineer:** Can create and edit assessments
- **Manager:** Can approve escalations and review all data
- **Admin:** Full system access

---

## Dispersion Calculator

### Purpose & Application

The Dispersion Calculator estimates the toxic release cloud radius for ammonia leaks using the **Gaussian Plume Model**. It calculates the areas where hazardous ammonia concentrations (IDLH, ERPG-2, LC₅₀) would be reached downwind of a release point.

**Use Cases:**
- Quantify impact radius of rupture scenarios
- Determine evacuation or shelter-in-place zone sizes
- Validate inherent or mitigated risk control measure placement
- Support Process Safety Management (PSM) / Risk Management Plan (RMP) documentation
- Inform emergency response planning

### Input Parameters

#### Release Source Parameters

| Parameter | Unit | Range | Description |
|---|---|---|---|
| **Orifice Diameter** | mm | 0.1–50 | Size of leak opening (hole, crack, or line rupture) |
| **Release Pressure** | bar (abs) | 1–100 | Ammonia pressure at rupture point (liquid NH₃ storage: typical 8–10 bar) |
| **Ambient Temperature** | °C | −40 to +50 | Outside air temperature at time of release |
| **Liquid Temperature** | °C | −50 to +20 | Temperature of ammonia at release point (liquid NH₃ at atmospheric pressure: −33°C) |

#### Atmospheric & Wind Parameters

| Parameter | Unit | Range | Description |
|---|---|---|---|
| **Wind Speed** | m/s | 0.5–10 | Average wind speed in downwind direction |
| **Atmospheric Stability Class** | A–F | Selection | Pasquill-Gifford stability category (see below) |
| **Ambient Pressure** | kPa | 80–105 | Atmospheric pressure (assume 101.325 kPa sea level) |
| **Relative Humidity** | % | 30–100 | Moisture content of air (affects vapor density) |

#### Atmospheric Stability Classification (Pasquill-Gifford)

The dispersion model uses the Pasquill-Gifford categorization to determine atmospheric mixing:

| Category | Stability | Conditions | Dispersion Rate | Typical Use |
|---|---|---|---|---|
| **A** | Very Unstable | Strong solar radiation, light wind, clear sky | Very Rapid | Daytime summer with clear sky |
| **B** | Unstable | Solar radiation moderate, light wind | Rapid | Daytime spring/fall |
| **C** | Neutral (Slightly Unstable) | Weak solar radiation, light wind; slight cloud cover | Moderate | Early morning / late afternoon |
| **D** | Neutral (Slightly Stable) | Moderate wind, any solar radiation | Moderate-Slow | Overcast day or evening |
| **E** | Stable | Light wind, mostly cloudy or overcast | Slow | Summer night or winter day |
| **F** | Very Stable | Very light wind, mostly cloudy night | Very Slow | Clear winter night / very stable |

**Rationale:** Very unstable conditions (A) → rapid mixing → contaminant concentration drops quickly with distance → smaller hazard zone. Very stable conditions (F) → poor mixing → contaminant spreads laterally more → larger hazard zone.

### Calculation Algorithm

#### Step 1: Mass Flow Rate Calculation (Bernoulli Equation)

For a pressurized liquid ammonia release through an orifice:

$$\dot{m} = C_d A \sqrt{2 \rho \Delta P}$$

Where:
- $\dot{m}$ = mass flow rate (kg/s)
- $C_d$ = discharge coefficient (~0.61 for sharp-edged orifice)
- $A$ = orifice area (m²)
- $\rho$ = liquid ammonia density (~682 kg/m³ at 1 bar, 0°C)
- $\Delta P$ = pressure differential (Pa)

**Example:** 5 mm hole, 10 bar pressure, 0°C liquid
- Area = π(0.0025)² = 1.96 × 10⁻⁵ m²
- ΔP = (10 − 1.01) bar = 89.9 × 10³ Pa
- ṁ = 0.61 × 1.96 × 10⁻⁵ × √(2 × 682 × 89900) ≈ 0.24 kg/s

#### Step 2: Evaporation & Vapor Temperature

Flash evaporation of liquid ammonia at the release point. Ammonia evaporates rapidly as pressure drops, consuming latent heat from the remaining liquid and surroundings:

$$T_{vapor} = T_{sat}(P_{atm}) = -33.3°C$$

The vapor is initially much colder than ambient air, creating a denser plume initially ("negatively buoyant").

#### Step 3: Gaussian Plume Model

The steady-state Gaussian plume equation predicts concentration at distance x downwind:

$$C(x, y, z) = \frac{\dot{m}}{2\pi u \sigma_y \sigma_z} \exp\left(-\frac{y^2}{2\sigma_y^2}\right) \exp\left(-\frac{(z-H)^2}{2\sigma_z^2}\right)$$

Where:
- $C$ = concentration (ppm or mg/m³)
- $\dot{m}$ = mass emission rate (kg/s)
- $u$ = wind speed (m/s)
- $\sigma_y, \sigma_z$ = dispersion parameters (functions of downwind distance and stability class)
- $H$ = initial plume height (0 m for ground-level release)
- $y$ = lateral distance from plume centerline (m)
- $z$ = vertical distance from ground (m)

#### Step 4: Dispersion Parameters (Pasquill-Gifford)

Empirical dispersion parameters as functions of downwind distance x and stability class:

| Stability | σ_y Formula | σ_z Formula | Rationale |
|---|---|---|---|
| A (unstable) | Rapid growth | Rapid growth | Rapid vertical/lateral mixing from turbulence |
| B–D (neutral) | Moderate growth | Moderate growth | Standard atmospheric mixing |
| E–F (stable) | Slow growth | Slow growth | Stable stratum inhibits mixing |

Example (Stability D): σ_y ≈ 0.08x, σ_z ≈ 0.06x (at x < 1 km)

#### Step 5: Iterative Solver for Hazard Zones

For each hazard level (IDLH, ERPG-2, LC₅₀), solve iteratively for the distance at which centerline concentration equals the threshold:

$$\text{Solve: } C(x, 0, 0) = \text{IDLH (25 ppm)}$$

**Iterative Method:** Binary search on downwind distance x until centerline concentration equals target, then scale radially based on dispersion parameters.

### Output & Visualization

#### Result Cards (Tabular)

For each hazard zone:

| Zone | Concentration | Radius | Example |
|---|---|---|---|
| **IDLH** | 25 ppm | x₁ meters | Immediate evacuation zone |
| **ERPG-2** | 150 ppm | x₂ meters | Shelter-in-place for 1 hour |
| **LC₅₀** | 1000 ppm | x₃ meters | Lethal hazard zone |

#### SVG Visualization

A concentric circle diagram showing:
- **Innermost circle:** IDLH zone (red, darkest)
- **Middle circle:** ERPG-2 zone (orange, dark)
- **Outer circle:** LC₅₀ zone (yellow, lighter)
- **Wind arrow:** Direction indicator at 12 o'clock position
- **Scale legend:** Distance markings in meters

Example: For a 10 mm hole at 10 bar in neutral (D) stability with 5 m/s wind:
- IDLH zone: ~150 m radius
- ERPG-2 zone: ~400 m radius
- LC₅₀ zone: ~800 m radius

### Limitations & Disclaimers

⚠️ **Important:** This is a **screening-level model** suitable for notional assessments but not for quantitative RMP filing without professional review.

**Model Limitations:**
1. **Gaussian Plume is steady-state** — Does not account for transient puff dispersion (initial release surge)
2. **No buoyancy correction** — Cold ammonia vapor is denser than air but model assumes neutral buoyancy after initial mixing
3. **Homogeneous meteorology** — Assumes uniform wind speed and stability with distance; does not account for vertical wind shear
4. **Ground-level release only** — Model assumes accident occurs at meter height; elevated releases (stack, roof leak) modeled as different initial condition
5. **No terrain effects** — Cannot model building effects, valley channeling, or topographic blocking
6. **Simplified source term** — Assumes pressurized liquid release with flash evaporation; more complex multi-phase flows not modeled
7. **Rectangular domain** — 2D representation; actual mixing is 3D

**For refined assessments:**
- Use **ALOHA** (NOAA) or **SafetyToolKit** (DNV) for RMP/PSM studies
- Engage qualified process safety engineer
- Consider full CFD modeling for complex geometries

### Safety Notes

- Results are upper-bound estimates under worst-case conditions (neutral stability, minimal mixing)
- Actual dispersion often better due to atmospheric instability, terrain features, building effects
- Wind direction and speed variability not captured (execute multiple scenarios)
- Use results for planning but not for precise prediction

---

## LOPA & SIL Estimator

### Purpose & Application

The LOPA (Layer of Protection Analysis) & SIL (Safety Integrity Level) Estimator supports quantitative risk reduction assessment for ammonia hazard scenarios. It evaluates the effectiveness of protection layers and determines the required SIL level for risk targets.

**Use Cases:**
- Quantify risk reduction from protection layers (PRV, ESD, operator response, etc.)
- Determine if existing safety systems meet risk reduction targets
- Identify SIL requirements for new or modified equipment
- Support Hazard and Operability Study (HAZOP) or What-If analysis
- Document risk-based decision making per ASME/IEC 61511

### LOPA Methodology Overview

LOPA is a simplified quantitative risk assessment technique that:

1. Defines an **initiating event** (e.g., ammonia leak)
2. Identifies **consequences** (e.g., cloud formation, exposure)
3. Assigns **frequency** of the event (events/year)
4. Applies **protection layers** with failure probabilities
5. Calculates **mitigated risk** and **Risk Reduction Factor (RRF)**
6. Determines **SIL requirement** based on RRF needed

**Mathematical Basis:**

$$\text{Mitigated Frequency} = F_{initiating} \times PFD_1 \times PFD_2 \times ... \times PFD_n$$

$$\text{Risk Reduction Factor (RRF)} = \frac{F_{initiating}}{F_{mitigated}}$$

$$\text{SIL} = \log_{10}(RRF)$$ (approximate)

### Input Parameters

#### Step 1: Scenario Definition

| Parameter | Description | Examples |
|---|---|---|
| **Hazard Scenario** | Description of potential incident | Ammonia leak from vessel rupture, tubing fractured, seal failure |
| **Potential Consequence** | Outcome if scenario occurs | Toxic vapor cloud, IDLH zone exposure, personnel injury, asset loss |
| **Affected Area** | Geographic extent of consequence | Local (within unit), site-wide (multiple units), offsite (beyond fence) |

#### Step 2: Initiating Event Frequency

**Question:** How often might this scenario be triggered?

| Frequency Range | Description | Examples |
|---|---|---|
| **10⁻¹ /yr** | 1 per 10 years | Large pressure relief; equipment high pressure cycling |
| **10⁻² /yr** | 1 per 100 years | Vessel over-pressure; minor seal failure |
| **10⁻³ /yr** | 1 per 1000 years | Major equipment failure; rare weather event |
| **10⁻⁴ /yr** | 1 per 10,000 years | Catastrophic multi-fault combination |

**Data Sources:**
- Equipment failure rate databases (OREDA, CCPS)
- Historical incident records
- Probability assessments from HAZOP or field engineers

#### Step 3: Consequence Severity Mapping

Map the consequence to a **risk acceptance criterion**:

| Consequence | Severity | Unmitigated Risk (1/yr probability) | Maximum Tolerable Mitigated Risk | RRF Needed |
|---|---|---|---|---|
| **No injury, no asset impact** | Negligible | Acceptable | 10⁻² | 1 (none) |
| **Minor injury, minor damage** | Low | 10⁻⁴ | 10⁻⁶ | 100 (SIL 2) |
| **Serious injury, asset loss** | High | 10⁻⁵ | 10⁻⁷ | 100–1000 (SIL 2–3) |
| **Fatality, major asset loss, offsite impact** | Critical | 10⁻⁶ | 10⁻⁸ to 10⁻⁹ | 1000–10,000 (SIL 3+) |

#### Step 4: Protection Layers Selection

The system provides six standard protection layers with documented PFD (Probability of Failure on Demand) values:

| Protection Layer | Abbreviation | Typical PFD | Description |
|---|---|---|---|
| **Basic Process Control System** | BPCS | 0.01–0.1 | Temperature, pressure, level control maintaining safe operating envelope |
| **Safety Relief Valve** | PRV/SRV | 0.01–0.05 | Spring-loaded pressure relief protecting vessel from over-pressure |
| **Operator Response** | Manual | 0.1–0.5 | Trained operator recognizing alarm and taking corrective action |
| **Emergency Shutdown (ESD)** | ESD | 0.001–0.01 | Automated logic stopping process or isolating hazard (e.g., solenoid valve) |
| **Containment/Dike** | Dike | 0.05–0.2 | Secondary containment preventing spill release to environment |
| **Deluge/Quench System** | Deluge | 0.05–0.1 | Water spray reducing vapor concentration or cooling equipment |

**Rationale for PFD Values:**

- **BPCS (0.01–0.1):** Routine control; subject to drift, calibration error, failures. Higher PFD than safety-critical systems.
- **PRV (0.01–0.05):** Periodic testing verifies set pressure; manufacturing variations produce scatter. Well-maintained valve ~1% failure probability.
- **Operator (0.1–0.5):** Human factors; response time delays, skill variation, fatigue. Typically less reliable than automatic systems.
- **ESD (0.001–0.01):** Automated proof-test capability; redundant logic possible. Lowest PFD with proper maintenance.
- **Dike (0.05–0.2):** Containment is passive; subject to settlement, corrosion, inadequate volume estimation.
- **Deluge (0.05–0.1):** Water header system subject to blockage, nozzle fouling, pump failure.

### Calculation Steps

#### Step 1: Define Unmitigated Frequency
$$F_{unmitigated} = F_{initiating} \text{ (events/year)}$$

**Example:** PRV lifting event from process upset
- Initiating frequency: 10⁻² /yr (happens roughly once per 100 years)

#### Step 2: Apply Protection Layers
$$F_{mitigated} = F_{unmitigated} \times \prod_{i=1}^{n} PFD_i$$

**Example Protection Layer Stack:**
1. **BPCS (temperature control):** PFD = 0.05 (catches 95% of upsets)
2. **Relief Valve:** PFD = 0.02 (catches 98% if BPCS fails)
3. **ESD (automatic shutdown):** PFD = 0.005 (catches 99.5% if both above fail)
4. **Dike containment:** PFD = 0.1 (reduces consequence if all above fail)

Mitigated frequency = 10⁻² × 0.05 × 0.02 × 0.005 = 5 × 10⁻⁹ /yr

#### Step 3: Calculate Risk Reduction Factor
$$RRF = \frac{F_{unmitigated}}{F_{mitigated}} = \frac{10^{-2}}{5 \times 10^{-9}} = 2,000,000$$

#### Step 4: Determine Required SIL
$$\text{SIL} = \log_{10}(RRF) - 1 \approx \log_{10}(2 \times 10^6) - 1 \approx 6.3 - 1 = \text{SIL 3+}$$

**Standard SIL Bands (IEC 61511):**
- **SIL 1:** RRF 10–100
- **SIL 2:** RRF 100–1,000
- **SIL 3:** RRF 1,000–10,000
- **SIL 4:** RRF >10,000 (rarely required; very expensive)

### Output Visualization

#### Risk Reduction Scale

A visual bar chart showing:
- **Unmitigated risk** (leftmost, red)
- **Risk after each layer** (progressively rightward, fading color)
- **Target risk** (rightmost, green)
- **SIL determination** (annotation)

Example output:
```
Unmitigated: 10⁻² /yr (1 per 100 years)
After BPCS: 5 × 10⁻⁴ /yr
After PRV: 10⁻⁵ /yr
After ESD: 5 × 10⁻⁸ /yr
Target Risk: 10⁻⁷ /yr

SIL Determination: SIL 2 (RRF = 100–1,000)
✓ This system meets target risk
```

### Limitations & Assumptions

**LOPA Assumptions:**
1. **Independence** — Protection layers assumed independent; no common-cause failures modeled
2. **Single-point truth** — PFD values are typical; actual varies with maintenance, design, operation
3. **Steady-state** — Does not account for transient or demand-driven scenarios
4. **Conservative** — Typical PFD values are conservative (pessimistic); actual systems often perform better

**When LOPA is NOT sufficient:**
- Complex systems with interdependencies (use Fault Tree Analysis)
- Rare high-consequence scenarios (use Monte Carlo simulation)
- Systems with inadequate historical data (use expert judgment / Delphi method)
- Regulatory-mandated precise quantification (use full probabilistic risk assessment)

---

## Equipment Checklists

### Purpose & Application

The Equipment Checklists provide structured, ammonia-specific inspection procedures for critical equipment. These checklists support:

- **Routine inspections:** Verify continued safe operation
- **PSM compliance:** Document equipment integrity assessments
- **Maintenance planning:** Identify degradation trends and upgrade needs
- **Training:** Standardize inspection criteria for inspectors
- **Record-keeping:** Create historical baseline for trending

### Equipment Categories

#### 1. Synthesis Reactor (7 Items)

**Function:** Catalytic synthesis of ammonia from nitrogen and hydrogen under high temperature/pressure.

**Critical Assessment Points:**

| Checklist Item | Why Important | Pass Criteria | Failure Action |
|---|---|---|---|
| **Catalyst condition and activity** | Fouled catalyst reduces conversion, causes hot-spot formation | Visual inspection: catalyst not agglomerated; activity level within 85–100% of baseline | Replace catalyst; investigate fouling cause (water, poison, or loss of binder) |
| **Pressure drop across catalyst bed** | Increasing pressure drop indicates catalyst fouling or structural failure | Pressure drop within ±10% of baseline | Clean or replace catalyst; inspect support grids |
| **Refractory lining integrity** | Damaged refractory allows hot gases to contact vessel wall, accelerating corrosion | Visual/borescope: no spalling, erosion, or gaps; surface smooth | Repair or reline refractory; establish monitoring interval |
| **Shell thermal cycling cracks** | Repeated temperature cycling (startup/shutdown) causes fatigue cracking | UT or dye penetrant: no indication of cracks >1/32" | Stress relief or nozzle reinforcement; reduce thermal cycling rate if possible |
| **Agitator seal condition** | Seal failure allows ammonia vapor escape and contamination of lube oil | No visible leakage; seal faces clean; vibration <5 mm/s | Replace seal cartridge or entire seal assembly |
| **Inlet/outlet nozzle welds** | Thermal cycling and vibration cause weld fatigue; nozzle cracking precedes rupture | UT or visual: no cracks or indications; connections tight | Re-weld or reinforce nozzle; consider strengthening plate |
| **Instrumentation accuracy** | Temperature and pressure control depend on sensor accuracy | Calibration within ±2% of full scale; readings drift <3% over interval | Calibrate or replace sensors; document in maintenance log |

#### 2. Refrigeration System (7 Items)

**Function:** Liquefaction and cooling of ammonia products using refrigeration cycle (ammonia refrigerant).

**Critical Assessment Points:**

| Checklist Item | Why Important | Pass Criteria | Failure Action |
|---|---|---|---|
| **Suction pressure and superheat** | Low suction pressure = low cooling capacity; high superheat = compressor motor overload | Suction 5–8 bar; superheat 5–10°C above saturation | Check compressor unload valve, add refrigerant, or verify condenser fouling |
| **Oil carryover from compressor** | Liquid oil entering refrigerant circuit fouls tubes and reduces heat transfer | No visible oil in refrigerant sight glass; oil level in compressor normal | Increase compressor oil level; install/verify oil separator function |
| **Frost pattern on suction line** | Indicates proper liquid/vapor separation and temperature profile | Frost pattern uniform from evaporator outlet to compressor inlet | Check expansion device; if erratic frost, verify instrumentation |
| **Abnormal noise or vibration** | Compressor noise indicates bearing wear, valve issues, or surge | Compressor noise consistent with baseline; vibration <3 mm/s | Inspect compressor; consider bearing or shaft replacement |
| **Condenser cleanliness and performance** | Fouled condenser reduces cooling capacity, increases discharge pressure | Condenser tubes clean; discharge pressure <20 bar; approach temp <5°C | Clean condenser (chemical or mechanical); inspect water treatment if water-cooled |
| **Ammonia detector functionality** | Detectors warn of leaks before IDLH concentration reached | All detectors alarm at <50 ppm ammonia; self-test function operates | Replace detector or repair sensor; verify calibration |
| **Relief valve and vent system** | Blocked relief or vent → uncontrolled pressure rise → rupture | Relief pilot opens at setpoint ±2%; discharge line clear of blockage | Test relief valve; clean vent line; verify discharge safe to atmosphere |

#### 3. Storage Tank (7 Items)

**Function:** Long-term storage of liquid or pressurized ammonia under controlled conditions.

**Critical Assessment Points:**

| Checklist Item | Why Important | Pass Criteria | Failure Action |
|---|---|---|---|
| **Foundation settlement** | Settlement >10–15 mm distorts shell, compromises structural integrity | Survey measurements: settlement <10 mm cumulative; level within ±5 mm side-to-side | Stabilize foundation; consider underpinning if >15 mm |
| **Shell thickness (UT ultrasonic testing)** | Corrosion under insulation (CUI) thins shell wall; thinning approaching minimum required | UT readings >90% of nominal thickness; corrosion rate <0.5 mm/year | Investigate CUI root cause (insulation moisture); perform coating repair |
| **Weld seam condition** | Welds are high-stress areas; fatigue or corrosion cracking initiates at welds | Visual/UT: no indications; X-ray sampling shows fusion lines intact | Re-weld suspect seam; post-weld heat treatment if required |
| **Roof/shell junction integrity** | Roof attachment points are high-stress; roof detachment → loss of containment | Bolted connections intact; weldments (if any) show no cracks | Tighten bolts per torque spec; re-weld cracked studs |
| **Breathing vent condition** | Blocked vent → build-up or vacuum → rupture or implosion; leaking vent → vapor escape | Vent clear of obstruction; no visible liquid discharge; desiccant not saturated | Clean vent; replace desiccant cartridge if wet; repair if cracked |
| **Thermal relief system** | Liquid ammonia in sealed tank expands with temperature rise; thermal relief prevents overpressure | Thermal relief opens at setpoint ±2%; no blockage in discharge | Test relief per API 520; clean discharge line |
| **Dike or secondary containment** | Prevents ground contamination if tank ruptures or overflows during filling | Dike floor impermeable; sump pump operable; no cracks >1/16"; volume ≥110% tank contents | Repair cracks; clean sump; test pump; inspect for settling |

#### 4. Compressors (6 Items)

**Function:** Multi-stage compression of recycled unreacted ammonia to feed pressure.

**Critical Assessment Points:**

| Checklist Item | Why Important | Pass Criteria | Failure Action |
|---|---|---|---|
| **Vibration monitoring** | Vibration indicates blade damage, imbalance, bearing wear, or surge | Vibration <7.1 mm/s overall per ISO 20816; trending stable or downward | Investigate cause; balance, repair blade damage, or inspect bearings |
| **Seal gas supply and condition** | Mechanical seal in compressor requires clean pilot gas at controlled pressure | Seal gas pressure 3–5 bar above discharge; no liquid contamination detected | Verify seal gas supply; clean seal gas filter or replace cartridge |
| **Lube oil condition and level** | Contaminated or low lube oil → bearing failure; high TAN indicates oxidation | Oil level sight glass 50–75% full; ISO particle count <18/16/13; TAN <0.5 mg KOH/g | Top-up oil; perform oil change; inspect for moisture or contamination |
| **Coupling alignment and condition** | Misaligned coupling → vibration and bearing damage; damaged element → failure | Runout <0.05 mm; flexible element not cracked; bolts tight | Re-align shafts per ISO 1101; replace flexible element if damaged |
| **Compressor discharge temperature** | High discharge temp → lube oil degradation, bearing damage; low temp → inefficiency | Discharge temp within normal operating range; no trending upward >5°C/month | Check compressor map; verify cooling system; inspect for fouling |
| **Instrumentation drift** | Pressure/temperature readings may drift; false alarms or missed warnings | Sensor readings ±2% full scale from baseline; self-test passes | Recalibrate sensors; replace if drift >3% and recalibration unsuccessful |

#### 5. Relief & Flare System (6 Items)

**Function:** Safe disposal and atmospheric discharge of excess ammonia vapor under relief conditions.

**Critical Assessment Points:**

| Checklist Item | Why Important | Pass Criteria | Failure Action |
|---|---|---|---|
| **Pressure drop across accumulator/knock-out drum** | High pressure drop indicates liquid level too high or fouling; low pressure indicates inadequate separation | Pressure drop within design range (typically 0.2–0.5 bar); liquid level normal | Drain liquid from drum; clean or replace separator cartridge |
| **Seal drum float ball operation** | Float ball prevents liquid discharge to flare and directs to blow-down system | Float ball moves freely; no sticking or blockage | Inspect float mechanism; clean or replace if damaged |
| **Flare header and tip inspection** | Blocked flare → dangerous back-pressure; deteriorated tip → incomplete combustion | Header clear of blockage; tip clean and flame stable during testing | Clear blockage; inspect burner assembly; replace tip if damaged |
| **Pressure relief valve setting and operation** | Relief must open at correct set point; cracked or stuck valve endangers system | Pop test result ±2% of nameplate setting; smooth opening/closing | Bench test or replace relief; document test results per API 520 |
| **Flare gas recovery or knockout drum sump** | Liquid ammonia in flare line → freeze/blockage; properly designed KO drum → liquid return | KO drum liquid level <50% nominal; sump drain clear | Drain liquid; verify insulation on flare header to prevent ammonia condensation |
| **Monitoring instrumentation** | Pressure, temperature, and flame detection provide early warning of relief system activation | All sensors functioning and trending normally; alarms active and tested | Calibrate sensors; test alarm circuits; verify DCS/control system response |

### Checklist Completion & Result Recording

#### Per-Item Result Options

For each checklist item, the inspector selects:

| Result | Definition | Escalation |
|---|---|---|
| **PASS** | Item meets pass criteria; no action needed | None |
| **FAIL** | Item fails criteria; repairs/replacement required | Automatic escalation to engineer |
| **N/A** | Item not applicable to this installation (e.g., no water cooling = skip Condenser item) | None |

#### Severity Classification (FAIL items only)

| Severity | Definition | Response Time |
|---|---|---|
| **CRITICAL** | Safety system non-functional; immediate danger | Immediate (within hours) |
| **MAJOR** | Equipment underperforming; degradation trend concerning | Urgent (within 1–2 weeks) |
| **MINOR** | Cosmetic or low-impact issue; no safety concern | Routine (next scheduled maintenance) |

#### Remarks Field

Free-text field for inspector notes:
- Quantitative observations (e.g., "Catalyst bed ΔP = 1.8 bar, nominal 1.6 bar; +12% increase")
- Visual observations (e.g., "Visible white frost on suction line from evaporator outlet to compressor")
- Maintenance recommendations (e.g., "Recommend refractory lining repair within 6 months; monitor every 2 months")
- Comparison to previous inspections (e.g., "Same fouling issue as last inspection; root cause not addressed")

### Database Storage

All checklist results are stored in Supabase `nh3_checklist_results` table:

```sql
CREATE TABLE nh3_checklist_results (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  equipment_type VARCHAR(50),  -- e.g., 'Synthesis Reactor', 'Compressor'
  equipment_name VARCHAR(255),
  inspection_date TIMESTAMPTZ,
  checklist_items JSONB,  -- Array of {item, result, severity, remarks}
  critical_failure_flag BOOLEAN,  -- TRUE if any CRITICAL failure
  overall_status VARCHAR(20),  -- PASS, FAIL, or FAIL_WITH_CRITICAL
  created_at TIMESTAMPTZ DEFAULT NOW(),
);
```

---

## Incident Tracker

### Purpose & Application

The Incident Tracker provides comprehensive documentation and analysis of safety incidents, near-misses, and hazard events. It supports:

- **Root cause analysis:** Document immediate cause, root causes, and contributing factors
- **Trending:** Identify patterns in equipment failures, operating procedures, or human factors
- **Regulatory compliance:** Meet EPA RMP, OSHA PSM, and state reporting requirements
- **Learning:** Share incident lessons with operational and engineering teams
- **Corrective action tracking:** Monitor implementation and effectiveness of fixes

### Incident Data Model

#### Core Fields

| Field | Type | Required | Description |
|---|---|---|---|
| **Incident Type** | Enum | Yes | Leak, Relief opening, Abnormal temperature/pressure, Near-miss, Injury, Property damage |
| **Equipment Involved** | Dropdown | Yes | Synthesis Reactor, Compressor, Storage Tank, Relief System, etc. |
| **Incident Date/Time** | DateTime | Yes | When incident occurred |
| **Duration** | Duration | No | How long incident lasted (minutes to hours) |
| **Severity Rating** | Integer 1–5 | Yes | 1=near-miss, 5=fatality |
| **Description** | Text | Yes | Detailed narrative of what happened |

#### Root Cause Analysis

| Field | Type | Description |
|---|---|---|
| **Failure Mode** | Dropdown | Mechanical failure, Human error, Environmental, Design defect, Maintenance deficiency |
| **Immediate Cause** | Text | Direct reason for failure (e.g., "Thermometer bulb fell out of pocket, loss of temperature control") |
| **Root Causes** | Multi-select | Contributing factors (e.g., inadequate training, worn equipment, design oversight) |
| **Contributing Factors** | Text | Latent failures or organizational factors that enabled the incident |

#### Safeguards Assessment

| Field | Type | Description |
|---|---|---|
| **Safeguards That Worked** | Multi-select | Which protection layers detected or mitigated the incident (e.g., relief valve opened, backup cooling started) |
| **Safeguards That Failed** | Multi-select | Which protection layers did NOT function as intended (e.g., detector didn't alarm, manual intervention late) |
| **Why Safeguards Failed** | Text | Analysis of why expected protections failed (maintenance, design, or training issue?) |

#### Corrective Actions (Multi-Row)

For each identified action to prevent recurrence:

| Field | Type | Description |
|---|---|---|
| **Action Description** | Text | Specific corrective action (e.g., "Replace all thermometer pockets with screw-in design") |
| **Action Type** | Dropdown | Design change, Procedure update, Training, Maintenance, Replacement, Elimination |
| **Owner** | User/Role | Who is responsible for implementation |
| **Target Completion Date** | Date | When action must be done |
| **Actual Completion Date** | Date | When action was actually done |
| **Effectiveness Assessment** | Dropdown | Not yet, In progress, Completed, Effective, Ineffective |

### Dashboard & Analytics

#### Overview Cards

- **Total incidents (this year)**
- **Critical incidents (severity 4–5)**
- **Open corrective actions**
- **Closure rate (% completed)**

#### Bar Chart: Incidents by Equipment Type

Y-axis: Incident count; X-axis: Equipment category (Reactor, Compressor, Storage Tank, etc.)

Shows 12-month rolling summary allowing comparison of equipment failure rates.

#### Pie Chart: Failure Mode Distribution

Shows proportional breakdown of incident causes:
- Mechanical failures (e.g., seal failure, bearing wear)
- Human error (e.g., operator mistake, inadequate response)
- Environmental (e.g., corrosion, vibrational damage)
- Design defects (e.g., undersized relief, inadequate instrumentation)

#### Severity Timeline

A chronological list of incidents with color-coded severity badges:
- **Red (Critical)** – Severity 5 (fatality)
- **Orange (Major)** – Severity 4 (serious injury or significant asset loss)
- **Yellow (Moderate)** – Severity 3 (minor injury or environmental release)
- **Blue (Minor)** – Severity 1–2 (near-miss or cosmetic issue)

### Incident Lifecycle & Workflow

#### 1. Reporting
An employee observes an incident or near-miss and opens Incident Tracker to create a report.

**Initial Information:**
- Incident type, date/time, equipment affected
- Brief description of what happened
- Any immediate response taken

**Status:** "OPEN_INVESTIGATION"

#### 2. Investigation
A process safety engineer conducts root cause analysis, interviewing personnel and reviewing equipment data.

**Added Information:**
- Detailed description with timeline
- Failure mode and immediate cause
- Root cause analysis with contributing factors
- Assessment of which safeguards worked/failed

**Status:** "UNDER_INVESTIGATION"

#### 3. Corrective Action Planning
Based on root causes, engineers develop corrective actions.

**Added Information:**
- Specific, time-bound corrective actions
- Assignment to responsible owners
- Target completion dates

**Status:** "CAP_DEVELOPMENT"

#### 4. Implementation
Actions are executed; evidence of completion (work orders, photos, training records) documented.

**Status:** "CAP_IMPLEMENTATION"

#### 5. Verification & Closure
Effectiveness assessed; incident closed.

**Status:** "CLOSED"

### Database Schema

```sql
CREATE TABLE nh3_incidents (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  incident_date TIMESTAMPTZ,
  incident_type VARCHAR(50),
  equipment_involved VARCHAR(255),
  severity_rating INT,  -- 1–5
  description TEXT,
  failure_mode VARCHAR(100),
  immediate_cause TEXT,
  root_causes TEXT[],
  safeguards_worked TEXT[],
  safeguards_failed TEXT[],
  corrective_actions JSONB,  -- Array of {description, owner, target_date, done_date}
  status VARCHAR(30),  -- OPEN_INVESTIGATION, CAP_IMPLEMENTATION, CLOSED
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  last_updated_by UUID,
);
```

---

## Database Schema

### Supabase Tables

#### 1. nh3_lopa_scenarios

Stores LOPA assessments and SIL determinations:

```sql
CREATE TABLE nh3_lopa_scenarios (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  scenario_name VARCHAR(255),
  hazard_description TEXT,
  initiating_event_description VARCHAR(255),
  consequence VARCHAR(255),
  initiating_frequency FLOAT,  -- events per year
  consequence_severity INT,  -- 1–5
  protection_layers JSONB,  -- {layer_name, pfd, selected: boolean}
  calculated_mitigated_frequency FLOAT,
  risk_reduction_factor FLOAT,
  required_sil INT,  -- 1–4
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);
```

#### 2. nh3_checklist_results

Stores equipment inspection checklist results:

```sql
CREATE TABLE nh3_checklist_results (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  equipment_type VARCHAR(50),
  equipment_name VARCHAR(255),
  inspection_date TIMESTAMPTZ,
  checklist_data JSONB,  -- {item_name, result, severity, remarks}
  critical_failure_flag BOOLEAN,
  overall_status VARCHAR(20),  -- PASS, FAIL, FAIL_CRITICAL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);
```

#### 3. nh3_incidents

Stores incident and near-miss reports:

```sql
CREATE TABLE nh3_incidents (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  incident_date TIMESTAMPTZ,
  incident_type VARCHAR(50),
  equipment_involved VARCHAR(255),
  severity_rating INT,  -- 1–5
  description TEXT,
  failure_mode VARCHAR(100),
  immediate_cause TEXT,
  root_causes TEXT[],
  safeguards_worked TEXT[],
  safeguards_failed TEXT[],
  corrective_actions JSONB,
  status VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  last_updated_by UUID,
);
```

### Row-Level Security (RLS) Policies

All NH₃ tables enforce RLS:

```sql
-- Users can view only their own records
CREATE POLICY "Users can view own records"
  ON nh3_lopa_scenarios
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all records
CREATE POLICY "Admins can view all records"
  ON nh3_lopa_scenarios
  FOR SELECT
  USING (auth.has_role(auth.uid(), 'admin'));

-- Managers can view all + update status
CREATE POLICY "Managers can view all and update"
  ON nh3_lopa_scenarios
  FOR ALL
  USING (auth.has_role(auth.uid(), 'manager') OR user_id = auth.uid());
```

---

## Safety Standards & References

### Regulatory & Industry Standards

| Standard | Authority | Applicability | Key Requirement |
|---|---|---|---|
| **EPA Risk Management Plan (RMP)** | USEPA | Facilities > 10,000 lbs ammonia | Document hazard analysis, worst-case release, off-site consequence, prevention program, emergency plan |
| **OSHA Process Safety Management (PSM)** | USDOL OSHA | Facilities > 10,000 lbs covered chemicals | 14-element PSM program including hazop, safety integrity, maintenance, incident investigation, training |
| **ASME/IEC 61511** | ASME/IEC | Safety Instrumented Systems (SIS) | Safety function assessment, SIL determination, design, validation, testing, maintenance of SIS |
| **AIChE Center for Chemical Process Safety (CCPS)** | AIChE | Best practices | Guidance on Process Hazard Analysis, Layer of Protection Analysis, Risk-Based Decision Making |
| **API 570** | American Petroleum Institute | Piping integrity | Inspection and rating of in-service piping with ammonia service examples |
| **NFPA 13** | NFPA | Fire protection systems | Sprinkler design for ammonia storage areas |
| **ANSI/ISA-84 (IEC 61508)** | ISA | Electrical safety systems | Functional safety and SIL methodology (precursor to IEC 61511) |

### References for Dispersion Modeling

- **Turner, D.B.** (1994). "Workbook of Atmospheric Dispersion Estimates," 2nd ed., EPA Publication 600/8-94-009
- **Pasquill, F. & Smith, F.B.** (1983). "Atmospheric Diffusion," 3rd ed., Ellis Horwood Ltd.
- **Guidelines for Consequence Analysis of Chemical Releases (CCPS)**, AIChE, 2000
- **USEPA ALOHA (Areal Locations of Hazardous Atmospheres)** – Free software for dispersion modeling

### References for LOPA & SIL

- **ASME/IEC 61511-1:2016** – Functional safety: Safety instrumented systems for the process industry
- **AIChE CCPS (2001).** "Layer of Protection Analysis: Simplified Process Risk Assessment"
- **OREDA (Offshore Reliability Data)** – Equipment failure rate database
- **CCPS (1988).** "Guidelines for Process Equipment Reliability Data"

### Ammonia Safety References

- **AIChE CCPS (2007).** "Ammonia: Technology and Use"
- **NFPA 30A** – Code for Motor Fuel Dispensing Facilities and Repair Garages (includes ammonia guidance)
- **NOAA Hazmat Response Division** – Ammonia properties and thermal effects
- **ASHRAE 34** – Designation and Safety Classification of Refrigerants (ammonia: R-717)

---

## Disclaimer & Limitations

⚠️ **IMPORTANT SAFETY NOTICE**

The SafetyPro NH₃ Safety Module is a **screening and decision-support tool** designed to aid qualified process safety professionals in hazard assessment, risk analysis, and documentation. It is **NOT**:

1. **A substitute for professional engineering judgment.** All results should be reviewed and validated by a qualified process safety engineer with ammonia facility experience.

2. **Suitable for regulatory filing without review.** RMP filings, PSM reports, and SIL validation documents require professional sign-off and should not be submitted based solely on this tool's output.

3. **A replacement for detailed consequence analysis.** The Gaussian plume dispersion model is simplified; more rigorous analyses should use ALOHA, SafetyToolKit, or CFD for critical decisions.

4. **A guarantee of safety.** Equipment failure, human error, and unforeseen circumstances can always occur. This tool addresses known hazards with standard protection layers; it cannot prevent all possible accidents.

5. **Current with all regulatory requirements.** Regulations change; local regulations may supersede federal guidance. Consult with environmental health & safety counsel and regulatory agencies.

### Model Uncertainties

- **Dispersion model:** ±50% to ±200% depending on meteorology, terrain, and source complexity
- **LOPA PFD values:** ±10×–0.1× depending on design, maintenance, and testing; actual PFD highly site-specific
- **Consequence severity:** Depends on exposure duration, population density, weather, and response effectiveness

### User Responsibility

Users of SafetyPro acknowledge that:
- They have adequate training in process safety management, LOPA, and consequence analysis
- They will have qualified professionals review all outputs before use in regulatory filings or critical decisions
- They assume responsibility for the accuracy, completeness, and appropriateness of data entered
- They will maintain records of all assessments and support documentation as required by regulations

---

## Support & Revision History

| Version | Date | Changes |
|---|---|---|
| 1.0 | March 2026 | Initial release; 4 submodules (Dispersion, LOPA, Checklists, Incidents); Supabase integration |

**For technical support, training, or customization, contact SafetyPro development team.**

---

**Document prepared by:** SafetyPro Development Team  
**Classification:** Internal Use / Client Distribution  
**Last Updated:** March 2026
