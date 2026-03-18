import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/AppHeader';
import SiteInventoryManager from '@/components/SiteInventoryManager';
import RoutineChecklist from '@/components/RoutineChecklist';
import DynamicChecklist from '@/components/DynamicChecklist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { runRiskScreening, type InspectionChemical, type RiskFinding, type Chemical } from '@/lib/riskCalculations';
import { type EquipmentData, calculateEquipmentCondition } from '@/lib/equipmentCondition';
import { generateInspectionChecklist, type ChecklistItem } from '@/lib/checklistGenerator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  ClipboardCheck, 
  FlaskConical, 
  ShieldAlert,
  Plus,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Settings,
  ListChecks,
  ArrowRight
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  location: string;
  site_type: string;
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

const SITE_TYPES = [
  'Chemical Plant',
  'Refinery',
  'Pharmaceutical',
  'Storage Facility',
  'Manufacturing',
  'Research Lab',
  'Other',
];

export default function NewInspection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Site Selection
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isNewSite, setIsNewSite] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', location: '', site_type: '' });
  const [siteHasInventory, setSiteHasInventory] = useState(false);
  
  // Step 2: Inspection Type
  const [inspectionType, setInspectionType] = useState<'new' | 'routine'>('new');
  
  // For New Inspection: updateInventory or continue
  const [updateInventory, setUpdateInventory] = useState(false);
  
  // Step 3: Generated checklist (for new) or Routine checklist data
  const [generatedChecklist, setGeneratedChecklist] = useState<ChecklistItem[]>([]);
  const [routineScore, setRoutineScore] = useState<number>(0);
  
  // Step 4: Results
  const [findings, setFindings] = useState<RiskFinding[]>([]);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [siteChemicals, setSiteChemicals] = useState<SiteChemical[]>([]);
  const [siteEquipment, setSiteEquipment] = useState<SiteEquipment[]>([]);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId);
      setSelectedSite(site || null);
      checkSiteInventory(selectedSiteId);
    } else {
      setSelectedSite(null);
      setSiteHasInventory(false);
    }
  }, [selectedSiteId, sites]);

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('*').order('name');
    if (data) setSites(data);
  };

  const checkSiteInventory = async (siteId: string) => {
    const { count: chemCount } = await supabase
      .from('site_chemicals')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);
    
    const { count: equipCount } = await supabase
      .from('site_equipment')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);
    
    setSiteHasInventory((chemCount || 0) > 0 || (equipCount || 0) > 0);
  };

  const fetchSiteData = async (siteId: string) => {
    // Fetch chemicals
    const { data: chemData } = await supabase
      .from('site_chemicals')
      .select('*, chemicals(*)')
      .eq('site_id', siteId);
    
    if (chemData) {
      setSiteChemicals(chemData.map((c: any) => ({
        chemical: c.chemicals as Chemical,
        quantity_kg: c.quantity_kg,
        storage_temp_c: c.storage_temp_c,
        pressure_atm: c.pressure_atm,
      })));
    }
    
    // Fetch equipment
    const { data: equipData } = await supabase
      .from('site_equipment')
      .select('*')
      .eq('site_id', siteId);
    
    if (equipData) {
      setSiteEquipment(equipData.map((e: any) => {
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
      }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedSiteId || (isNewSite && newSite.name && newSite.location && newSite.site_type);
      case 2:
        if (inspectionType === 'new') {
          // Must have inventory OR updating inventory
          return siteHasInventory || updateInventory || isNewSite;
        }
        return siteHasInventory; // Routine requires existing inventory
      case 3:
        return true;
      default:
        return true;
    }
  };

  const getTotalSteps = () => {
    if (inspectionType === 'new') {
      return updateInventory || isNewSite ? 5 : 4; // With inventory: Site -> Type -> Inventory -> Checklist -> Results
    }
    return 4; // Routine: Site -> Type -> Checklist -> Results
  };

  const getStepLabels = () => {
    if (inspectionType === 'new') {
      if (updateInventory || isNewSite) {
        return [
          { icon: Building2, label: 'Site' },
          { icon: ClipboardCheck, label: 'Type' },
          { icon: FlaskConical, label: 'Inventory' },
          { icon: ListChecks, label: 'Checklist' },
          { icon: ShieldAlert, label: 'Results' },
        ];
      }
      return [
        { icon: Building2, label: 'Site' },
        { icon: ClipboardCheck, label: 'Type' },
        { icon: ListChecks, label: 'Checklist' },
        { icon: ShieldAlert, label: 'Results' },
      ];
    }
    return [
      { icon: Building2, label: 'Site' },
      { icon: ClipboardCheck, label: 'Type' },
      { icon: ListChecks, label: 'Daily Checklist' },
      { icon: ShieldAlert, label: 'Score' },
    ];
  };

  const handleNext = async () => {
    if (step === 1 && isNewSite) {
      // Create new site first
      setLoading(true);
      const { data: siteData, error } = await supabase
        .from('sites')
        .insert({
          user_id: user!.id,
          name: newSite.name,
          location: newSite.location,
          site_type: newSite.site_type,
        })
        .select()
        .single();
      
      if (error) {
        toast({ title: 'Error creating site', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      
      setSelectedSiteId(siteData.id);
      setSelectedSite(siteData);
      setSites([...sites, siteData]);
      setLoading(false);
    }
    
    if (step === 2) {
      // Fetch site data for use in checklist/screening
      await fetchSiteData(selectedSiteId);
    }
    
    // Handle step transitions based on inspection type
    if (inspectionType === 'new') {
      if (step === 2 && !updateInventory && !isNewSite && siteHasInventory) {
        // Skip to checklist generation
        await generateNewInspectionChecklist();
        setStep(3);
      } else if (step === 2 && (updateInventory || isNewSite)) {
        // Go to inventory management
        setStep(3);
      } else if (step === 3 && (updateInventory || isNewSite)) {
        // After inventory, generate checklist
        await fetchSiteData(selectedSiteId);
        await generateNewInspectionChecklist();
        setStep(4);
      } else if ((step === 3 && !updateInventory && !isNewSite) || step === 4) {
        // Run risk screening and save
        await runScreening();
      } else {
        setStep(step + 1);
      }
    } else {
      // Routine inspection
      if (step < getTotalSteps()) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateNewInspectionChecklist = async () => {
    const site = selectedSite || { name: newSite.name, site_type: newSite.site_type, location: newSite.location };
    const chemicalsForChecklist = siteChemicals.map(c => ({
      chemical: c.chemical,
      quantity_kg: c.quantity_kg,
      storage_temp_c: c.storage_temp_c,
      pressure_atm: c.pressure_atm,
    }));
    const equipmentForChecklist = siteEquipment.map(e => ({
      equipment: e.data,
      condition: e.condition,
    }));
    
    const items = generateInspectionChecklist(
      site,
      chemicalsForChecklist as InspectionChemical[],
      equipmentForChecklist
    );
    
    setGeneratedChecklist(items);
  };

  const handleRoutineComplete = async (items: any[], score: number) => {
    setRoutineScore(score);
    setLoading(true);
    
    try {
      // Create inspection record
      const { data: inspData, error } = await supabase
        .from('inspections')
        .insert({
          user_id: user!.id,
          site_id: selectedSiteId,
          inspection_type: 'routine',
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      setInspectionId(inspData.id);
      
      // Save checklist items
      for (const item of items) {
        await supabase.from('routine_checklist').insert({
          inspection_id: inspData.id,
          category: item.category,
          item: item.question,
          checked: item.response === 'yes',
        });
      }
      
      // Create findings for failed items
      const failedCritical = items.filter(i => i.response === 'no' && i.priority === 'critical');
      const failedHigh = items.filter(i => i.response === 'no' && i.priority === 'high');
      
      for (const item of failedCritical) {
        await supabase.from('risk_findings').insert({
          inspection_id: inspData.id,
          finding_type: 'routine_check',
          severity: 'critical',
          title: `Failed: ${item.question}`,
          description: `Routine check failed for ${item.category}`,
          recommendation: 'Address immediately before next shift',
        });
      }
      
      for (const item of failedHigh) {
        await supabase.from('risk_findings').insert({
          inspection_id: inspData.id,
          finding_type: 'routine_check',
          severity: 'high',
          title: `Failed: ${item.question}`,
          description: `Routine check failed for ${item.category}`,
          recommendation: 'Schedule corrective action within 24 hours',
        });
      }
      
      setStep(4);
    } catch (error: any) {
      toast({ title: 'Error saving inspection', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const runScreening = async () => {
    setLoading(true);
    
    try {
      // Create inspection
      const { data: inspData, error } = await supabase
        .from('inspections')
        .insert({
          user_id: user!.id,
          site_id: selectedSiteId,
          inspection_type: 'new',
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      setInspectionId(inspData.id);
      
      // Run risk calculations
      const chemicalsForScreening: InspectionChemical[] = siteChemicals.map(c => ({
        chemical: c.chemical,
        quantity_kg: c.quantity_kg,
        storage_temp_c: c.storage_temp_c,
        pressure_atm: c.pressure_atm,
      }));
      
      const riskFindings = runRiskScreening(chemicalsForScreening);
      setFindings(riskFindings);
      
      // Save findings
      for (const finding of riskFindings) {
        await supabase.from('risk_findings').insert({
          inspection_id: inspData.id,
          finding_type: finding.finding_type,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          recommendation: finding.recommendation,
          score: finding.score,
        });
      }
      
      // Save generated checklist
      for (const item of generatedChecklist) {
        await supabase.from('generated_checklist').insert({
          inspection_id: inspData.id,
          category: item.category,
          item: item.item,
          priority: item.priority,
          source_type: item.source_type,
          source_reference: item.source_reference,
          checked: item.checked,
        });
      }
      
      // Copy chemical and equipment data to inspection tables for historical record
      for (const chem of siteChemicals) {
        await supabase.from('inspection_chemicals').insert({
          inspection_id: inspData.id,
          chemical_id: chem.chemical.id,
          quantity_kg: chem.quantity_kg,
          storage_temp_c: chem.storage_temp_c,
          pressure_atm: chem.pressure_atm,
        });
      }
      
      for (const equip of siteEquipment) {
        await supabase.from('inspection_equipment').insert({
          inspection_id: inspData.id,
          name: equip.data.name,
          equipment_type: equip.data.equipment_type,
          overall_condition: equip.condition.overall_condition,
          condition_score: equip.condition.condition_score,
          // ... other fields
        });
      }
      
      setStep(getTotalSteps());
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const completeInspection = async () => {
    if (!inspectionId) return;
    
    setLoading(true);
    await supabase
      .from('inspections')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', inspectionId);
    
    toast({ title: 'Inspection completed!' });
    navigate('/dashboard');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
  };

  const totalSteps = getTotalSteps();
  const stepLabels = getStepLabels();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {inspectionType === 'routine' ? 'Routine Inspection' : 'New Inspection'}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <Progress value={(step / totalSteps) * 100} className="flex-1" />
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {stepLabels.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                  step > i + 1
                    ? 'bg-primary text-primary-foreground'
                    : step === i + 1
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Site Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Site
              </CardTitle>
              <CardDescription>Choose an existing site or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isNewSite && (
                <div className="space-y-2">
                  <Label>Existing Sites</Label>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a site..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name} - {site.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSite && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{selectedSite.site_type}</Badge>
                      {siteHasInventory ? (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Has inventory data
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-warning">
                          <AlertTriangle className="h-4 w-4" />
                          No inventory data yet
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant={isNewSite ? 'default' : 'outline'}
                onClick={() => {
                  setIsNewSite(!isNewSite);
                  setSelectedSiteId('');
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {isNewSite ? 'Creating New Site' : 'Create New Site'}
              </Button>

              {isNewSite && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="e.g., Building A Distillation"
                      value={newSite.name}
                      onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteLocation">Location</Label>
                    <Input
                      id="siteLocation"
                      placeholder="e.g., Houston, TX"
                      value={newSite.location}
                      onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Site Type</Label>
                    <Select
                      value={newSite.site_type}
                      onValueChange={(v) => setNewSite({ ...newSite, site_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SITE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Inspection Type */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Choose Inspection Type
              </CardTitle>
              <CardDescription>
                {selectedSite?.name} - {selectedSite?.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={inspectionType} onValueChange={(v) => setInspectionType(v as 'new' | 'routine')}>
                <div className="space-y-4">
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                      inspectionType === 'new' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value="new" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold">Full Assessment</div>
                      <p className="text-sm text-muted-foreground">
                        Complete risk screening with Dow F&EI, toxic load analysis, and chemical incompatibility checks.
                        Generates a comprehensive safety checklist.
                      </p>
                    </div>
                  </label>
                  
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                      inspectionType === 'routine' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    } ${!siteHasInventory && !isNewSite ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RadioGroupItem 
                      value="routine" 
                      className="mt-1" 
                      disabled={!siteHasInventory && !isNewSite}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Routine Inspection</span>
                        {!siteHasInventory && !isNewSite && (
                          <Badge variant="secondary">Requires inventory</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quick Yes/No checklist based on site chemicals and equipment.
                        Generates a daily safety score weighted by priority.
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {inspectionType === 'new' && siteHasInventory && (
                <div className="rounded-lg border p-4">
                  <Label className="text-base font-semibold">Site Inventory</Label>
                  <p className="mb-3 text-sm text-muted-foreground">
                    This site already has chemical and equipment data.
                  </p>
                  <RadioGroup 
                    value={updateInventory ? 'update' : 'continue'} 
                    onValueChange={(v) => setUpdateInventory(v === 'update')}
                  >
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <RadioGroupItem value="continue" />
                        <div>
                          <span className="font-medium">Continue with existing data</span>
                          <p className="text-xs text-muted-foreground">Use current inventory for screening</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <RadioGroupItem value="update" />
                        <div>
                          <span className="font-medium">Update inventory first</span>
                          <p className="text-xs text-muted-foreground">Modify chemicals or equipment before screening</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Inventory Management (New Inspection with update) */}
        {step === 3 && inspectionType === 'new' && (updateInventory || isNewSite) && (
          <SiteInventoryManager
            siteId={selectedSiteId}
            siteName={selectedSite?.name || newSite.name}
            onSave={() => toast({ title: 'Inventory saved' })}
          />
        )}

        {/* Step 3: Routine Checklist */}
        {step === 3 && inspectionType === 'routine' && selectedSite && (
          <RoutineChecklist
            siteId={selectedSiteId}
            siteName={selectedSite.name}
            siteType={selectedSite.site_type}
            onComplete={handleRoutineComplete}
          />
        )}

        {/* Step 3/4: Generated Checklist (New Inspection) */}
        {((step === 3 && inspectionType === 'new' && !updateInventory && !isNewSite) ||
          (step === 4 && inspectionType === 'new' && (updateInventory || isNewSite))) && (
          <div className="space-y-6">
            <DynamicChecklist
              items={generatedChecklist}
              onChange={setGeneratedChecklist}
              title="Safety Verification Checklist"
              description="Complete these checks based on site chemicals, equipment, and conditions"
            />
          </div>
        )}

        {/* Step 4: Routine Results */}
        {step === 4 && inspectionType === 'routine' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Inspection Complete
              </CardTitle>
              <CardDescription>Daily safety score calculated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8">
                <div className={`text-6xl font-bold ${
                  routineScore >= 80 ? 'text-success' : 
                  routineScore >= 60 ? 'text-warning' : 
                  'text-destructive'
                }`}>
                  {routineScore}%
                </div>
                <p className="mt-2 text-lg text-muted-foreground">Daily Safety Score</p>
                <div className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 ${
                  routineScore >= 80 ? 'bg-success/10 text-success' : 
                  routineScore >= 60 ? 'bg-warning/10 text-warning' : 
                  'bg-destructive/10 text-destructive'
                }`}>
                  {routineScore >= 80 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Excellent - All critical safety measures in place</span>
                    </>
                  ) : routineScore >= 60 ? (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <span>Attention needed - Some items require follow-up</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      <span>Critical - Immediate action required</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Step: New Inspection Results */}
        {step === totalSteps && inspectionType === 'new' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Risk Screening Results
                </CardTitle>
                <CardDescription>
                  Automated risk assessment for {selectedSite?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4 rounded-lg bg-muted p-4">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  <div>
                    <div className="font-semibold">
                      {findings.filter(f => f.severity !== 'pass').length} Finding(s) Require Attention
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {findings.filter(f => f.severity === 'critical').length} Critical,{' '}
                      {findings.filter(f => f.severity === 'high').length} High Priority
                    </div>
                  </div>
                </div>

                {/* Equipment Summary */}
                {siteEquipment.length > 0 && (
                  <div className="mb-4 rounded-lg border p-4">
                    <h4 className="mb-3 font-semibold">Equipment Condition Summary</h4>
                    <div className="space-y-2">
                      {siteEquipment.map((equip, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>{equip.data.name} ({equip.data.equipment_type})</span>
                          <Badge className={
                            equip.condition.overall_condition === 'excellent' || equip.condition.overall_condition === 'good'
                              ? 'bg-success text-success-foreground'
                              : equip.condition.overall_condition === 'fair'
                              ? 'bg-warning text-warning-foreground'
                              : 'bg-destructive text-destructive-foreground'
                          }>
                            {equip.condition.overall_condition.toUpperCase()} ({equip.condition.condition_score}%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Findings */}
                <div className="space-y-3">
                  {findings.map((finding, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 ${
                        finding.severity === 'critical'
                          ? 'border-destructive/50 bg-destructive/5'
                          : finding.severity === 'high'
                          ? 'border-warning/50 bg-warning/5'
                          : 'border-success/50 bg-success/5'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(finding.severity)}
                          <span className="font-semibold">{finding.title}</span>
                        </div>
                        <Badge variant={finding.severity === 'critical' ? 'destructive' : finding.severity === 'high' ? 'default' : 'secondary'}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{finding.description}</p>
                      <div className="mt-2 rounded bg-background/50 p-2">
                        <span className="text-xs font-medium">Recommendation: </span>
                        <span className="text-sm">{finding.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step === totalSteps ? (
            <Button onClick={completeInspection} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Complete Inspection
            </Button>
          ) : step === 3 && inspectionType === 'routine' ? (
            <Button 
              onClick={() => {
                const checklist = document.querySelector('[data-checklist]');
                // The RoutineChecklist component handles its own completion
              }} 
              disabled={loading || !canProceed()}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Score
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={loading || !canProceed()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
              {step === 2 && inspectionType === 'new' && !updateInventory && !isNewSite && siteHasInventory
                ? 'Run Screening'
                : 'Next'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
