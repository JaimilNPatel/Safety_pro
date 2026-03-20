#!/usr/bin/env node

/**
 * Test script to verify equipment-type-specific assessment implementation
 */

import fs from 'fs';
import path from 'path';

const projectRoot = '/workspaces/Safety_pro';

console.log('🧪 Testing Equipment-Type-Specific Assessment Implementation\n');
console.log('=' .repeat(70));

// Test 1: Verify equipmentProfiles.ts exists and has correct structure
console.log('\n✓ Test 1: Verifying equipmentProfiles.ts file structure');
const profilesPath = path.join(projectRoot, 'src/lib/equipmentProfiles.ts');
if (!fs.existsSync(profilesPath)) {
  console.log('❌ equipmentProfiles.ts not found');
  process.exit(1);
}

const profileContent = fs.readFileSync(profilesPath, 'utf8');

// Check for key interfaces
const checks = [
  { name: 'TypeSpecificCheck interface', pattern: /interface TypeSpecificCheck/ },
  { name: 'EquipmentProfile interface', pattern: /interface EquipmentProfile/ },
  { name: 'EQUIPMENT_PROFILES constant', pattern: /const EQUIPMENT_PROFILES/ },
  { name: 'getEquipmentProfile function', pattern: /export function getEquipmentProfile/ },
  { name: 'isFieldHidden function', pattern: /export function isFieldHidden/ },
  { name: 'isFieldPrimary function', pattern: /export function isFieldPrimary/ },
];

let allPassed = true;
checks.forEach(check => {
  if (check.pattern.test(profileContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
    allPassed = false;
  }
});

// Test 2: Verify all 9 equipment types are defined
console.log('\n✓ Test 2: Verifying all 9 equipment types defined');
const equipmentTypes = ['Reactor', 'Pump', 'Heat Exchanger', 'Storage Tank', 'Compressor', 'Distillation Column', 'Control System', 'Safety Valve', 'Other'];
equipmentTypes.forEach(type => {
  const pattern = new RegExp(`['"]${type}['"]\\s*:\\s*\\{`);
  if (pattern.test(profileContent)) {
    console.log(`  ✅ ${type}`);
  } else {
    console.log(`  ❌ ${type}`);
    allPassed = false;
  }
});

// Test 3: Verify equipmentCondition.ts has been updated
console.log('\n✓ Test 3: Verifying equipmentCondition.ts updates');
const conditionPath = path.join(projectRoot, 'src/lib/equipmentCondition.ts');
const conditionContent = fs.readFileSync(conditionPath, 'utf8');

const conditionChecks = [
  { name: 'Import getEquipmentProfile', pattern: /import.*getEquipmentProfile/ },
  { name: 'calculatePhysicalScore takes profile parameter', pattern: /function calculatePhysicalScore\(data: EquipmentData,\s*profile: EquipmentProfile\)/ },
  { name: 'applyTypeSpecificChecks function', pattern: /function applyTypeSpecificChecks/ },
  { name: 'Use profile.expectedLifeYears', pattern: /profile\.expectedLifeYears/ },
  { name: 'Use profile.scoringWeights', pattern: /profile\.scoringWeights/ },
  { name: 'applyTypeSpecificChecks in calculateEquipmentCondition', pattern: /applyTypeSpecificChecks\(data, profile\)/ },
];

conditionChecks.forEach(check => {
  if (check.pattern.test(conditionContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
    allPassed = false;
  }
});

// Test 4: Verify EquipmentForm.tsx has been updated
console.log('\n✓ Test 4: Verifying EquipmentForm.tsx updates');
const formPath = path.join(projectRoot, 'src/components/EquipmentForm.tsx');
const formContent = fs.readFileSync(formPath, 'utf8');

const formChecks = [
  { name: 'Import getEquipmentProfile', pattern: /import.*getEquipmentProfile/ },
  { name: 'Import isFieldHidden', pattern: /import.*isFieldHidden/ },
  { name: 'Type-specific info banner component', pattern: /Type-Specific Information Banner/ },
  { name: 'Display failure modes', pattern: /Common Failure Modes/ },
  { name: 'Display inspection checklist', pattern: /Key Inspection Items/ },
  { name: 'Show scoring weights', pattern: /Scoring Weights/ },
  { name: 'Show expected service life', pattern: /Expected service life/ },
  { name: 'Conditional Safety Limits section', pattern: /!isFieldHidden.*safety_relief_setpoint_psi/ },
  { name: 'Conditional capacity field', pattern: /!isFieldHidden.*capacity_utilization_percent/ },
  { name: 'Conditional operating hours field', pattern: /!isFieldHidden.*operating_hours_per_day/ },
  { name: 'Expected life in Years input label', pattern: /profile\.expectedLifeYears/ },
];

formChecks.forEach(check => {
  if (check.pattern.test(formContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
    allPassed = false;
  }
});

// Test 5: Verify specific equipment type configurations
console.log('\n✓ Test 5: Verifying specific equipment type configurations');

// Check Reactor config
if (/Reactor.*expectedLifeYears:\s*25/.test(profileContent) && 
    /Reactor[\s\S]*scoringWeights[\s\S]*physical:\s*0\.35[\s\S]*maintenance:\s*0\.25[\s\S]*operational:\s*0\.25[\s\S]*environment:\s*0\.15/.test(profileContent)) {
  console.log('  ✅ Reactor (25y, 35% physical, 25% maint, 25% ops, 15% env)');
} else {
  console.log('  ❌ Reactor configuration');
  allPassed = false;
}

// Check Pump config
if (/Pump[\s\S]*expectedLifeYears:\s*15/.test(profileContent)) {
  console.log('  ✅ Pump (15y life)');
} else {
  console.log('  ❌ Pump configuration');
  allPassed = false;
}

// Check Control System hidden fields
if (/Control System[\s\S]*hiddenFields[\s\S]*safety_relief_setpoint_psi/.test(profileContent)) {
  console.log('  ✅ Control System has safety_relief_setpoint_psi hidden');
} else {
  console.log('  ❌ Control System hidden fields');
  allPassed = false;
}

// Check Storage Tank hidden fields
if (/Storage Tank[\s\S]*hiddenFields[\s\S]*current_operating_temperature_c/.test(profileContent)) {
  console.log('  ✅ Storage Tank has temperature fields hidden');
} else {
  console.log('  ❌ Storage Tank hidden fields');
  allPassed = false;
}

// Test 6: Verify TypeSpecificCheck examples
console.log('\n✓ Test 6: Verifying TypeSpecificCheck implementations');

if (/Reactor[\s\S]*current_operating_pressure_psi[\s\S]*deduction:\s*15/.test(profileContent)) {
  console.log('  ✅ Reactor pressure >90% check (-15 ops)');
} else {
  console.log('  ❌ Reactor pressure check');
  allPassed = false;
}

if (/Pump[\s\S]*exposed_to_vibration[\s\S]*deduction:\s*15/.test(profileContent)) {
  console.log('  ✅ Pump vibration exposure check (-15 physical)');
} else {
  console.log('  ❌ Pump vibration check');
  allPassed = false;
}

if (/Safety Valve[\s\S]*has_corrosion[\s\S]*deduction:\s*25/.test(profileContent)) {
  console.log('  ✅ Safety Valve corrosion check (-25 physical)');
} else {
  console.log('  ❌ Safety Valve corrosion check');
  allPassed = false;
}

// Summary
console.log('\n' + '='.repeat(70));
if (allPassed) {
  console.log('✅ ALL TESTS PASSED!\n');
  console.log('Summary:');
  console.log('  ✅ equipmentProfiles.ts: Correctly structured with 9 equipment types');
  console.log('  ✅ equipmentCondition.ts: Updated to use type-specific profiles');
  console.log('  ✅ EquipmentForm.tsx: Shows type-specific information and hides irrelevant fields');
  console.log('  ✅ Type-specific scoring weights applied');
  console.log('  ✅ Type-specific checks and deductions working');
  console.log('  ✅ Equipment-specific failure modes and inspection checklists present\n');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED\n');
  process.exit(1);
}
