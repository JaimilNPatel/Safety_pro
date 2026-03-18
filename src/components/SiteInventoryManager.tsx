import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FlaskConical, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { type Chemical } from '@/lib/riskCalculations';
import { 
  type EquipmentData, 
  calculateEquipmentCondition,
  getConditionColorClass,
  getDefaultEquipmentData 
} from '@/lib/equipmentCondition';
import EquipmentForm from './EquipmentForm';

interface SiteChemical {
  id?: string;
  chemical_id: string;
  chemical: Chemical;
  quantity_kg: number;
  storage_temp_c: number;
  pressure_atm: number;
  storage_location?: string;
}

interface SiteEquipment {
  id?: string;
  data: EquipmentData;
  condition: ReturnType<typeof calculateEquipmentCondition>;
}

interface SiteInventoryManagerProps {
  siteId: string;
  siteName: string;
  onSave?: () => void;
  readOnly?: boolean;
}

const EQUIPMENT_TYPES = [
  'Reactor',
  'Distillation Column',
  'Heat Exchanger',
  'Storage Tank',
  'Pump',
  'Compressor',
  'Control System',
  'Safety Valve',
  'Other',
];

export default function SiteInventoryManager({ 
  siteId, 
  siteName, 
  onSave,
  readOnly = false 
}: SiteInventoryManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Chemicals
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [siteChemicals, setSiteChemicals] = useState<SiteChemical[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Chemical[]>([]);
  
  // Equipment
  const [siteEquipment, setSiteEquipment] = useState<SiteEquipment[]>([]);
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipType, setNewEquipType] = useState('');

  useEffect(() => {
    fetchData();
  }, [siteId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all chemicals
    const { data: chemData } = await supabase.from('chemicals').select('*').order('name');
    if (chemData) setChemicals(chemData as Chemical[]);
    
    // Fetch site chemicals
    const { data: siteChemData } = await supabase
      .from('site_chemicals')
      .select('*, chemicals(*)')
      .eq('site_id', siteId);
    
    if (siteChemData) {
      setSiteChemicals(siteChemData.map((sc: any) => ({
        id: sc.id,
        chemical_id: sc.chemical_id,
        chemical: sc.chemicals as Chemical,
        quantity_kg: sc.quantity_kg,
        storage_temp_c: sc.storage_temp_c,
        pressure_atm: sc.pressure_atm,
        storage_location: sc.storage_location,
      })));
    }
    
    // Fetch site equipment
    const { data: siteEquipData } = await supabase
      .from('site_equipment')
      .select('*')
      .eq('site_id', siteId);
    
    if (siteEquipData) {
      setSiteEquipment(siteEquipData.map((eq: any) => {
        const data: EquipmentData = {
          name: eq.name,
          equipment_type: eq.equipment_type,
          design_pressure_psi: eq.design_pressure_psi,
          max_operating_pressure_psi: eq.max_operating_pressure_psi,
          current_operating_pressure_psi: eq.current_operating_pressure_psi,
          design_temperature_c: eq.design_temperature_c,
          max_operating_temperature_c: eq.max_operating_temperature_c,
          current_operating_temperature_c: eq.current_operating_temperature_c,
          safety_relief_setpoint_psi: eq.safety_relief_setpoint_psi,
          capacity_utilization_percent: eq.capacity_utilization_percent || 0,
          operating_hours_per_day: eq.operating_hours_per_day || 8,
          years_in_service: eq.years_in_service || 0,
          last_maintenance_date: eq.last_maintenance_date,
          maintenance_frequency_days: eq.maintenance_frequency_days || 90,
          last_inspection_date: eq.last_inspection_date,
          inspection_frequency_days: eq.inspection_frequency_days || 365,
          maintenance_compliance_percent: eq.maintenance_compliance_percent || 100,
          outstanding_work_orders: eq.outstanding_work_orders || 0,
          physical_condition: eq.physical_condition || 1,
          has_visible_damage: eq.has_visible_damage || false,
          has_corrosion: eq.has_corrosion || false,
          has_leaks: eq.has_leaks || false,
          criticality_level: eq.criticality_level || 2,
          is_safety_critical: eq.is_safety_critical || false,
          redundancy_available: eq.redundancy_available || false,
          environment_condition: eq.environment_condition || 1,
          exposed_to_corrosive: eq.exposed_to_corrosive || false,
          exposed_to_vibration: eq.exposed_to_vibration || false,
          exposed_to_extreme_temp: eq.exposed_to_extreme_temp || false,
          notes: eq.notes,
        };
        return {
          id: eq.id,
          data,
          condition: calculateEquipmentCondition(data),
        };
      }));
    }
    
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = chemicals.filter(
      c => c.name.toLowerCase().includes(query) || c.cas_number.includes(query)
    ).filter(c => !siteChemicals.some(sc => sc.chemical_id === c.id));
    setSearchResults(results);
  };

  const addChemical = (chemical: Chemical) => {
    setSiteChemicals([
      ...siteChemicals,
      { chemical_id: chemical.id, chemical, quantity_kg: 100, storage_temp_c: 25, pressure_atm: 1 },
    ]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const updateChemical = (index: number, updates: Partial<SiteChemical>) => {
    const updated = [...siteChemicals];
    updated[index] = { ...updated[index], ...updates };
    setSiteChemicals(updated);
  };

  const removeChemical = (index: number) => {
    setSiteChemicals(siteChemicals.filter((_, i) => i !== index));
  };

  const addEquipment = () => {
    if (!newEquipName.trim() || !newEquipType) return;
    const data = getDefaultEquipmentData(newEquipName.trim(), newEquipType);
    const condition = calculateEquipmentCondition(data);
    setSiteEquipment([...siteEquipment, { data, condition }]);
    setNewEquipName('');
    setNewEquipType('');
  };

  const updateEquipment = (index: number, updates: Partial<EquipmentData>) => {
    const updated = [...siteEquipment];
    const newData = { ...updated[index].data, ...updates };
    updated[index] = { ...updated[index], data: newData, condition: calculateEquipmentCondition(newData) };
    setSiteEquipment(updated);
  };

  const removeEquipment = (index: number) => {
    setSiteEquipment(siteEquipment.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing and re-insert chemicals
      await supabase.from('site_chemicals').delete().eq('site_id', siteId);
      for (const chem of siteChemicals) {
        await supabase.from('site_chemicals').insert({
          site_id: siteId,
          chemical_id: chem.chemical_id,
          quantity_kg: chem.quantity_kg,
          storage_temp_c: chem.storage_temp_c,
          pressure_atm: chem.pressure_atm,
          storage_location: chem.storage_location,
        });
      }

      // Delete existing and re-insert equipment
      await supabase.from('site_equipment').delete().eq('site_id', siteId);
      for (const equip of siteEquipment) {
        await supabase.from('site_equipment').insert({
          site_id: siteId,
          name: equip.data.name,
          equipment_type: equip.data.equipment_type,
          design_pressure_psi: equip.data.design_pressure_psi,
          max_operating_pressure_psi: equip.data.max_operating_pressure_psi,
          current_operating_pressure_psi: equip.data.current_operating_pressure_psi,
          design_temperature_c: equip.data.design_temperature_c,
          max_operating_temperature_c: equip.data.max_operating_temperature_c,
          current_operating_temperature_c: equip.data.current_operating_temperature_c,
          safety_relief_setpoint_psi: equip.data.safety_relief_setpoint_psi,
          capacity_utilization_percent: equip.data.capacity_utilization_percent,
          operating_hours_per_day: equip.data.operating_hours_per_day,
          years_in_service: equip.data.years_in_service,
          last_maintenance_date: equip.data.last_maintenance_date,
          maintenance_frequency_days: equip.data.maintenance_frequency_days,
          last_inspection_date: equip.data.last_inspection_date,
          inspection_frequency_days: equip.data.inspection_frequency_days,
          maintenance_compliance_percent: equip.data.maintenance_compliance_percent,
          outstanding_work_orders: equip.data.outstanding_work_orders,
          physical_condition: equip.data.physical_condition,
          has_visible_damage: equip.data.has_visible_damage,
          has_corrosion: equip.data.has_corrosion,
          has_leaks: equip.data.has_leaks,
          criticality_level: equip.data.criticality_level,
          is_safety_critical: equip.data.is_safety_critical,
          redundancy_available: equip.data.redundancy_available,
          environment_condition: equip.data.environment_condition,
          exposed_to_corrosive: equip.data.exposed_to_corrosive,
          exposed_to_vibration: equip.data.exposed_to_vibration,
          exposed_to_extreme_temp: equip.data.exposed_to_extreme_temp,
          condition_score: equip.condition.condition_score,
          overall_condition: equip.condition.overall_condition,
          notes: equip.data.notes,
        });
      }

      toast({ title: 'Site inventory saved successfully!' });
      onSave?.();
    } catch (error: any) {
      toast({ title: 'Error saving inventory', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{siteName} Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {siteChemicals.length} chemicals, {siteEquipment.length} equipment items
          </p>
        </div>
        {!readOnly && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Inventory
          </Button>
        )}
      </div>

      <Tabs defaultValue="chemicals">
        <TabsList>
          <TabsTrigger value="chemicals" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Chemicals ({siteChemicals.length})
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-2">
            <Settings className="h-4 w-4" />
            Equipment ({siteEquipment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chemicals" className="mt-4 space-y-4">
          {/* Search */}
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Search chemicals by name or CAS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardContent className="p-0">
                {searchResults.slice(0, 5).map((chem) => (
                  <div
                    key={chem.id}
                    className="flex items-center justify-between border-b p-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{chem.name}</div>
                      <div className="text-sm text-muted-foreground">
                        CAS: {chem.cas_number} | Group: {chem.reactivity_group}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addChemical(chem)}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Chemical List */}
          {siteChemicals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FlaskConical className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No chemicals added to this site yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {siteChemicals.map((chem, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{chem.chemical.name}</span>
                          <Badge variant="outline">{chem.chemical.reactivity_group}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">CAS: {chem.chemical.cas_number}</p>
                      </div>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChemical(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity (kg)</Label>
                        <Input
                          type="number"
                          value={chem.quantity_kg}
                          onChange={(e) => updateChemical(index, { quantity_kg: parseFloat(e.target.value) || 0 })}
                          disabled={readOnly}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Storage Temp (°C)</Label>
                        <Input
                          type="number"
                          value={chem.storage_temp_c}
                          onChange={(e) => updateChemical(index, { storage_temp_c: parseFloat(e.target.value) || 0 })}
                          disabled={readOnly}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Pressure (atm)</Label>
                        <Input
                          type="number"
                          value={chem.pressure_atm}
                          onChange={(e) => updateChemical(index, { pressure_atm: parseFloat(e.target.value) || 0 })}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4 space-y-4">
          {/* Add Equipment */}
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Equipment name (e.g., Reactor R-101)..."
                value={newEquipName}
                onChange={(e) => setNewEquipName(e.target.value)}
                className="flex-1"
              />
              <Select value={newEquipType} onValueChange={setNewEquipType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type..." />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addEquipment} disabled={!newEquipName.trim() || !newEquipType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Equipment List */}
          {siteEquipment.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Settings className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No equipment added to this site yet.</p>
              </CardContent>
            </Card>
          ) : (
            <EquipmentForm
              equipment={siteEquipment.map((e) => ({ data: e.data, condition: e.condition }))}
              onChange={(updated) => setSiteEquipment(updated.map((u, i) => ({ 
                ...siteEquipment[i], 
                data: u.data, 
                condition: u.condition 
              })))}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
