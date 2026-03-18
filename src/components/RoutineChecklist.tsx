import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { 
  ClipboardCheck, 
  FlaskConical, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { type Chemical } from '@/lib/riskCalculations';
import { type EquipmentData, calculateEquipmentCondition } from '@/lib/equipmentCondition';

interface ChecklistItem {
  id: string;
  category: string;
  question: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'chemical' | 'equipment' | 'general';
  sourceRef?: string;
  response: 'yes' | 'no' | null;
  notes: string;
}

interface SiteChemical {
  chemical: Chemical;
  quantity_kg: number;
  storage_temp_c: number;
  pressure_atm: number;
}

interface SiteEquipment {
  data: EquipmentData;
  condition: ReturnType<typeof calculateEquipmentCondition>;
}

interface RoutineChecklistProps {
  siteId: string;
  siteName: string;
  siteType: string;
  onComplete: (items: ChecklistItem[], score: number) => void;
}

// Priority weights for scoring
const PRIORITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Chemical-specific routine checks
const CHEMICAL_CHECKS: Record<string, { question: string; priority: 'critical' | 'high' | 'medium' }[]> = {
  'Flammable': [
    { question: 'Are grounding and bonding connections verified?', priority: 'critical' },
    { question: 'Is the fire suppression system functional?', priority: 'critical' },
    { question: 'Is ventilation for vapor control adequate?', priority: 'high' },
  ],
  'Oxidizer': [
    { question: 'Are oxidizers properly segregated from flammables?', priority: 'high' },
    { question: 'Are storage containers free from contamination?', priority: 'high' },
  ],
  'Corrosive': [
    { question: 'Is secondary containment intact?', priority: 'high' },
    { question: 'Are neutralizing agents available?', priority: 'medium' },
    { question: 'Is PPE for corrosive handling available?', priority: 'high' },
  ],
  'Toxic': [
    { question: 'Is atmospheric monitoring equipment functional?', priority: 'critical' },
    { question: 'Is respiratory protection available?', priority: 'critical' },
    { question: 'Are emergency evacuation routes clear?', priority: 'high' },
  ],
  'Reactive': [
    { question: 'Are temperature control systems operational?', priority: 'critical' },
    { question: 'Are incompatible chemicals properly separated?', priority: 'critical' },
    { question: 'Are pressure relief systems functional?', priority: 'critical' },
  ],
  'Water-Reactive': [
    { question: 'Is storage area dry?', priority: 'critical' },
    { question: 'Is dry chemical/sand fire suppression available?', priority: 'critical' },
  ],
  'Pyrophoric': [
    { question: 'Is inert atmosphere maintained in storage?', priority: 'critical' },
    { question: 'Are fire blankets/sand immediately accessible?', priority: 'critical' },
  ],
};

// Equipment-specific routine checks
function getEquipmentChecks(equipment: SiteEquipment): { question: string; priority: 'critical' | 'high' | 'medium' }[] {
  const checks: { question: string; priority: 'critical' | 'high' | 'medium' }[] = [];
  
  // General checks for all equipment
  checks.push({ question: `Is ${equipment.data.name} operating within normal parameters?`, priority: 'high' });
  
  if (equipment.data.is_safety_critical) {
    checks.push({ question: `Is ${equipment.data.name} safety-critical function verified?`, priority: 'critical' });
  }
  
  if (equipment.data.has_leaks || equipment.data.has_corrosion || equipment.data.has_visible_damage) {
    checks.push({ question: `Has previous damage/leak on ${equipment.data.name} been addressed?`, priority: 'critical' });
  }
  
  // Check based on condition
  if (equipment.condition.overall_condition === 'poor' || equipment.condition.overall_condition === 'critical') {
    checks.push({ question: `Has ${equipment.data.name} (${equipment.condition.overall_condition} condition) been evaluated for repair/replacement?`, priority: 'critical' });
  }
  
  // Type-specific checks
  const typeChecks: Record<string, { question: string; priority: 'critical' | 'high' | 'medium' }[]> = {
    'Reactor': [
      { question: 'Is reactor temperature and pressure within limits?', priority: 'critical' },
      { question: 'Is reactor agitation functioning properly?', priority: 'high' },
    ],
    'Storage Tank': [
      { question: 'Is tank level instrumentation accurate?', priority: 'high' },
      { question: 'Is tank vent and overfill protection functional?', priority: 'critical' },
    ],
    'Pump': [
      { question: 'Is pump seal free of leaks?', priority: 'high' },
      { question: 'Is pump vibration within acceptable range?', priority: 'medium' },
    ],
    'Safety Valve': [
      { question: 'Is safety valve inspection tag current?', priority: 'critical' },
      { question: 'Is safety valve inlet/outlet unobstructed?', priority: 'critical' },
    ],
    'Heat Exchanger': [
      { question: 'Is heat exchanger thermal performance adequate?', priority: 'medium' },
    ],
    'Compressor': [
      { question: 'Is compressor oil level adequate?', priority: 'medium' },
      { question: 'Is compressor temperature within limits?', priority: 'high' },
    ],
  };
  
  if (typeChecks[equipment.data.equipment_type]) {
    checks.push(...typeChecks[equipment.data.equipment_type]);
  }
  
  return checks;
}

// General safety checks
const GENERAL_CHECKS: { question: string; priority: 'critical' | 'high' | 'medium' | 'low' }[] = [
  { question: 'Are emergency exits clear and accessible?', priority: 'critical' },
  { question: 'Are fire extinguishers in place and inspected?', priority: 'high' },
  { question: 'Is PPE available and in good condition?', priority: 'high' },
  { question: 'Are safety showers and eyewash stations functional?', priority: 'high' },
  { question: 'Is first aid kit stocked?', priority: 'medium' },
  { question: 'Are MSDS/SDS sheets accessible?', priority: 'medium' },
  { question: 'Are emergency procedures posted?', priority: 'medium' },
  { question: 'Is housekeeping satisfactory?', priority: 'low' },
];

export default function RoutineChecklist({ 
  siteId, 
  siteName, 
  siteType,
  onComplete 
}: RoutineChecklistProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    generateChecklist();
  }, [siteId]);

  const generateChecklist = async () => {
    setLoading(true);
    const checklistItems: ChecklistItem[] = [];
    let idCounter = 0;
    
    // Fetch site chemicals
    const { data: chemData } = await supabase
      .from('site_chemicals')
      .select('*, chemicals(*)')
      .eq('site_id', siteId);
    
    const siteChemicals: SiteChemical[] = (chemData || []).map((c: any) => ({
      chemical: c.chemicals as Chemical,
      quantity_kg: c.quantity_kg,
      storage_temp_c: c.storage_temp_c,
      pressure_atm: c.pressure_atm,
    }));
    
    // Fetch site equipment
    const { data: equipData } = await supabase
      .from('site_equipment')
      .select('*')
      .eq('site_id', siteId);
    
    const siteEquipment: SiteEquipment[] = (equipData || []).map((e: any) => {
      const data: EquipmentData = {
        name: e.name,
        equipment_type: e.equipment_type,
        design_pressure_psi: e.design_pressure_psi,
        max_operating_pressure_psi: e.max_operating_pressure_psi,
        current_operating_pressure_psi: e.current_operating_pressure_psi,
        design_temperature_c: e.design_temperature_c,
        max_operating_temperature_c: e.max_operating_temperature_c,
        current_operating_temperature_c: e.current_operating_temperature_c,
        safety_relief_setpoint_psi: e.safety_relief_setpoint_psi,
        capacity_utilization_percent: e.capacity_utilization_percent || 0,
        operating_hours_per_day: e.operating_hours_per_day || 8,
        years_in_service: e.years_in_service || 0,
        last_maintenance_date: e.last_maintenance_date,
        maintenance_frequency_days: e.maintenance_frequency_days || 90,
        last_inspection_date: e.last_inspection_date,
        inspection_frequency_days: e.inspection_frequency_days || 365,
        maintenance_compliance_percent: e.maintenance_compliance_percent || 100,
        outstanding_work_orders: e.outstanding_work_orders || 0,
        physical_condition: e.physical_condition || 1,
        has_visible_damage: e.has_visible_damage || false,
        has_corrosion: e.has_corrosion || false,
        has_leaks: e.has_leaks || false,
        criticality_level: e.criticality_level || 2,
        is_safety_critical: e.is_safety_critical || false,
        redundancy_available: e.redundancy_available || false,
        environment_condition: e.environment_condition || 1,
        exposed_to_corrosive: e.exposed_to_corrosive || false,
        exposed_to_vibration: e.exposed_to_vibration || false,
        exposed_to_extreme_temp: e.exposed_to_extreme_temp || false,
        notes: e.notes,
      };
      return { data, condition: calculateEquipmentCondition(data) };
    });
    
    // Add general checks
    GENERAL_CHECKS.forEach((check) => {
      checklistItems.push({
        id: `gen_${idCounter++}`,
        category: 'General Safety',
        question: check.question,
        priority: check.priority,
        source: 'general',
        response: null,
        notes: '',
      });
    });
    
    // Add chemical-specific checks (only unique groups)
    const addedGroups = new Set<string>();
    siteChemicals.forEach((chem) => {
      const group = chem.chemical.reactivity_group;
      if (!addedGroups.has(group) && CHEMICAL_CHECKS[group]) {
        CHEMICAL_CHECKS[group].forEach((check) => {
          checklistItems.push({
            id: `chem_${idCounter++}`,
            category: `${group} Chemicals`,
            question: check.question,
            priority: check.priority,
            source: 'chemical',
            sourceRef: group,
            response: null,
            notes: '',
          });
        });
        addedGroups.add(group);
      }
    });
    
    // Add equipment-specific checks
    siteEquipment.forEach((equip) => {
      const checks = getEquipmentChecks(equip);
      checks.forEach((check) => {
        checklistItems.push({
          id: `equip_${idCounter++}`,
          category: `${equip.data.equipment_type} Equipment`,
          question: check.question,
          priority: check.priority,
          source: 'equipment',
          sourceRef: equip.data.name,
          response: null,
          notes: '',
        });
      });
    });
    
    // Sort by priority
    checklistItems.sort((a, b) => PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]);
    
    setItems(checklistItems);
    setLoading(false);
  };

  const updateResponse = (id: string, response: 'yes' | 'no') => {
    setItems(items.map((item) => 
      item.id === id ? { ...item, response } : item
    ));
  };

  const calculateScore = () => {
    let totalWeight = 0;
    let earnedWeight = 0;
    
    items.forEach((item) => {
      const weight = PRIORITY_WEIGHTS[item.priority];
      totalWeight += weight;
      if (item.response === 'yes') {
        earnedWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  };

  // Auto-complete when all items are answered
  useEffect(() => {
    const allAnswered = items.length > 0 && items.every(i => i.response !== null);
    if (allAnswered) {
      const score = calculateScore();
      onComplete(items, score);
    }
  }, [items]);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'chemical': return <FlaskConical className="h-4 w-4 text-purple-500" />;
      case 'equipment': return <Settings className="h-4 w-4 text-blue-500" />;
      default: return <ClipboardCheck className="h-4 w-4 text-primary" />;
    }
  };

  const answeredCount = items.filter((i) => i.response !== null).length;
  const score = calculateScore();
  const allAnswered = answeredCount === items.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Daily Safety Score
          </CardTitle>
          <CardDescription>
            {siteName} - Routine Inspection Checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {answeredCount} of {items.length} items completed
              </span>
              <span className={`text-2xl font-bold ${
                score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {score}%
              </span>
            </div>
            <Progress value={(answeredCount / items.length) * 100} />
            {allAnswered && (
              <div className={`flex items-center gap-2 rounded-lg p-3 ${
                score >= 80 ? 'bg-success/10 text-success' : 
                score >= 60 ? 'bg-warning/10 text-warning' : 
                'bg-destructive/10 text-destructive'
              }`}>
                {score >= 80 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span>
                  {score >= 80 ? 'Good safety score!' : 
                   score >= 60 ? 'Attention needed on some items' : 
                   'Critical issues require immediate attention'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {getSourceIcon(categoryItems[0].source)}
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityBadgeVariant(item.priority) as any}>
                        {item.priority}
                      </Badge>
                      {item.sourceRef && (
                        <span className="text-xs text-muted-foreground">
                          ({item.sourceRef})
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-medium">{item.question}</p>
                  </div>
                </div>
                
                <RadioGroup
                  value={item.response || ''}
                  onValueChange={(v) => updateResponse(item.id, v as 'yes' | 'no')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                    <Label htmlFor={`${item.id}-yes`} className="flex items-center gap-1 cursor-pointer">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${item.id}-no`} />
                    <Label htmlFor={`${item.id}-no`} className="flex items-center gap-1 cursor-pointer">
                      <XCircle className="h-4 w-4 text-destructive" />
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Record any observations, incidents, or follow-up actions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
