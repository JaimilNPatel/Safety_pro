import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, Gauge, Wrench, AlertTriangle, Settings } from 'lucide-react';
import { 
  type EquipmentData, 
  type ConditionResult,
  calculateEquipmentCondition, 
  getDefaultEquipmentData,
  getConditionColorClass 
} from '@/lib/equipmentCondition';

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

interface EquipmentWithCondition {
  data: EquipmentData;
  condition: ConditionResult;
}

interface EquipmentFormProps {
  equipment: EquipmentWithCondition[];
  onChange: (equipment: EquipmentWithCondition[]) => void;
}

export default function EquipmentForm({ equipment, onChange }: EquipmentFormProps) {
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipType, setNewEquipType] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addEquipment = () => {
    if (!newEquipName.trim() || !newEquipType) return;
    
    const data = getDefaultEquipmentData(newEquipName.trim(), newEquipType);
    const condition = calculateEquipmentCondition(data);
    
    onChange([...equipment, { data, condition }]);
    setNewEquipName('');
    setNewEquipType('');
  };

  const updateEquipment = (index: number, updates: Partial<EquipmentData>) => {
    const updated = [...equipment];
    const newData = { ...updated[index].data, ...updates };
    const newCondition = calculateEquipmentCondition(newData);
    updated[index] = { data: newData, condition: newCondition };
    onChange(updated);
  };

  const removeEquipment = (index: number) => {
    onChange(equipment.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Equipment Assessment
        </CardTitle>
        <CardDescription>
          Add equipment with detailed condition assessment based on NFPA 70B standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Equipment */}
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
              {EQUIPMENT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addEquipment} disabled={!newEquipName.trim() || !newEquipType}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Equipment List */}
        {equipment.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No equipment added yet. Add equipment above to assess.
          </p>
        ) : (
          <div className="space-y-3">
            {equipment.map((equip, index) => (
              <Collapsible
                key={index}
                open={expandedIndex === index}
                onOpenChange={(open) => setExpandedIndex(open ? index : null)}
              >
                <div className="rounded-lg border">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{equip.data.name}</span>
                          <Badge variant="outline">{equip.data.equipment_type}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Score: {equip.condition.condition_score}/100</span>
                          <span>•</span>
                          <span>Governing: {equip.condition.governing_factor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getConditionColorClass(equip.condition.overall_condition)}>
                        {equip.condition.overall_condition.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEquipment(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Safety Limits Section */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-semibold text-sm">
                            <Gauge className="h-4 w-4 text-primary" />
                            Safety Limits & Operating Conditions
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Design Pressure (PSI)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 150"
                                value={equip.data.design_pressure_psi || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  design_pressure_psi: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Max Operating Pressure (PSI)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 120"
                                value={equip.data.max_operating_pressure_psi || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  max_operating_pressure_psi: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Current Pressure (PSI)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 95"
                                value={equip.data.current_operating_pressure_psi || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  current_operating_pressure_psi: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Safety Relief (PSI)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 165"
                                value={equip.data.safety_relief_setpoint_psi || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  safety_relief_setpoint_psi: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Design Temp (°C)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 200"
                                value={equip.data.design_temperature_c || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  design_temperature_c: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Current Temp (°C)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 85"
                                value={equip.data.current_operating_temperature_c || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  current_operating_temperature_c: parseFloat(e.target.value) || undefined 
                                })}
                              />
                            </div>
                          </div>

                          {/* Usage Metrics */}
                          <h4 className="flex items-center gap-2 pt-2 font-semibold text-sm">
                            Usage Metrics
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Capacity Used (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={equip.data.capacity_utilization_percent}
                                onChange={(e) => updateEquipment(index, { 
                                  capacity_utilization_percent: parseFloat(e.target.value) || 0 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Hours/Day</Label>
                              <Input
                                type="number"
                                min="0"
                                max="24"
                                value={equip.data.operating_hours_per_day}
                                onChange={(e) => updateEquipment(index, { 
                                  operating_hours_per_day: parseFloat(e.target.value) || 0 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Years in Service</Label>
                              <Input
                                type="number"
                                min="0"
                                value={equip.data.years_in_service}
                                onChange={(e) => updateEquipment(index, { 
                                  years_in_service: parseFloat(e.target.value) || 0 
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Maintenance Section */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-semibold text-sm">
                            <Wrench className="h-4 w-4 text-primary" />
                            Maintenance Data
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Last Maintenance Date</Label>
                              <Input
                                type="date"
                                value={equip.data.last_maintenance_date || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  last_maintenance_date: e.target.value || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Maintenance Interval (days)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={equip.data.maintenance_frequency_days}
                                onChange={(e) => updateEquipment(index, { 
                                  maintenance_frequency_days: parseInt(e.target.value) || 90 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Last Inspection Date</Label>
                              <Input
                                type="date"
                                value={equip.data.last_inspection_date || ''}
                                onChange={(e) => updateEquipment(index, { 
                                  last_inspection_date: e.target.value || undefined 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Inspection Interval (days)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={equip.data.inspection_frequency_days}
                                onChange={(e) => updateEquipment(index, { 
                                  inspection_frequency_days: parseInt(e.target.value) || 365 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Maintenance Compliance (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={equip.data.maintenance_compliance_percent}
                                onChange={(e) => updateEquipment(index, { 
                                  maintenance_compliance_percent: parseFloat(e.target.value) || 0 
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Outstanding Work Orders</Label>
                              <Input
                                type="number"
                                min="0"
                                value={equip.data.outstanding_work_orders}
                                onChange={(e) => updateEquipment(index, { 
                                  outstanding_work_orders: parseInt(e.target.value) || 0 
                                })}
                              />
                            </div>
                          </div>

                          {/* Physical Condition */}
                          <h4 className="flex items-center gap-2 pt-2 font-semibold text-sm">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            Physical Condition (NFPA 70B)
                          </h4>
                          <div className="space-y-3">
                            <Select
                              value={String(equip.data.physical_condition)}
                              onValueChange={(v) => updateEquipment(index, { 
                                physical_condition: parseInt(v) as 1 | 2 | 3 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Condition 1 - Like New</SelectItem>
                                <SelectItem value="2">Condition 2 - Warning Signs</SelectItem>
                                <SelectItem value="3">Condition 3 - Red Flag State</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.has_visible_damage}
                                  onCheckedChange={(c) => updateEquipment(index, { has_visible_damage: !!c })}
                                />
                                Visible Damage
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.has_corrosion}
                                  onCheckedChange={(c) => updateEquipment(index, { has_corrosion: !!c })}
                                />
                                Corrosion
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.has_leaks}
                                  onCheckedChange={(c) => updateEquipment(index, { has_leaks: !!c })}
                                />
                                Active Leaks
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Criticality & Environment - Full Width */}
                        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
                          {/* Criticality */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Criticality Assessment</h4>
                            <Select
                              value={String(equip.data.criticality_level)}
                              onValueChange={(v) => updateEquipment(index, { 
                                criticality_level: parseInt(v) as 1 | 2 | 3 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Critical - Highest Priority</SelectItem>
                                <SelectItem value="2">Standard - Normal Priority</SelectItem>
                                <SelectItem value="3">Non-Critical - Lower Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.is_safety_critical}
                                  onCheckedChange={(c) => updateEquipment(index, { is_safety_critical: !!c })}
                                />
                                Safety Critical
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.redundancy_available}
                                  onCheckedChange={(c) => updateEquipment(index, { redundancy_available: !!c })}
                                />
                                Redundancy Available
                              </label>
                            </div>
                          </div>

                          {/* Environment */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Operating Environment</h4>
                            <Select
                              value={String(equip.data.environment_condition)}
                              onValueChange={(v) => updateEquipment(index, { 
                                environment_condition: parseInt(v) as 1 | 2 | 3 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Clean/Controlled</SelectItem>
                                <SelectItem value="2">Moderate Exposure</SelectItem>
                                <SelectItem value="3">Harsh Conditions</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.exposed_to_corrosive}
                                  onCheckedChange={(c) => updateEquipment(index, { exposed_to_corrosive: !!c })}
                                />
                                Corrosive Env.
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.exposed_to_vibration}
                                  onCheckedChange={(c) => updateEquipment(index, { exposed_to_vibration: !!c })}
                                />
                                High Vibration
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={equip.data.exposed_to_extreme_temp}
                                  onCheckedChange={(c) => updateEquipment(index, { exposed_to_extreme_temp: !!c })}
                                />
                                Extreme Temp
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="lg:col-span-2 space-y-2">
                          <Label className="text-sm">Equipment Notes</Label>
                          <Textarea
                            placeholder="Additional observations about this equipment..."
                            value={equip.data.notes || ''}
                            onChange={(e) => updateEquipment(index, { notes: e.target.value })}
                            rows={2}
                          />
                        </div>

                        {/* Condition Summary */}
                        {equip.condition.recommendations.length > 0 && (
                          <div className="lg:col-span-2 rounded-lg bg-muted p-4">
                            <h4 className="mb-2 font-semibold text-sm">Assessment Summary</h4>
                            <div className="grid gap-2 md:grid-cols-5 mb-3">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Physical</div>
                                <div className="font-semibold">{equip.condition.physical_score}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Maintenance</div>
                                <div className="font-semibold">{equip.condition.maintenance_score}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Operational</div>
                                <div className="font-semibold">{equip.condition.operational_score}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Environment</div>
                                <div className="font-semibold">{equip.condition.environment_score}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Overall</div>
                                <div className="font-bold text-primary">{equip.condition.condition_score}%</div>
                              </div>
                            </div>
                            <ul className="space-y-1 text-sm">
                              {equip.condition.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-warning">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
