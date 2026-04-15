import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { incidentStorage } from '@/lib/incidentStorage';
import { ArrowLeft, Plus, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FormData {
  dateTime: string;
  incidentType: string;
  equipment: string;
  failureMode: string;
  description: string;
  immediateCause: string;
  safeguardsWorked: string;
  safeguardsFailed: string;
  severity: number;
}

interface CorrectiveAction {
  action: string;
  dueDate: string;
  owner: string;
}

interface Incident {
  id: string;
  incident_type: string;
  equipment: string;
  failure_mode: string;
  description: string;
  severity: number;
  created_at: string;
  root_causes: string[];
}

const ROOT_CAUSES = [
  'Management system',
  'Training',
  'Procedure',
  'Equipment design',
  'Inspection gap',
  'Communication',
];

const EQUIPMENT_OPTIONS = [
  'Synthesis reactor',
  'Refrigeration',
  'Storage tank',
  'Compressor',
  'Relief system',
  'Pipework',
  'Other',
];

const FAILURE_MODES = [
  'Mechanical',
  'Instrumentation',
  'Operational error',
  'External event',
  'Design deficiency',
  'Maintenance error',
];

export default function IncidentTracker() {
  const { register, handleSubmit, watch, reset, control } = useForm<FormData>({
    defaultValues: {
      dateTime: new Date().toISOString().slice(0, 16),
      incidentType: 'Near-miss',
      equipment: 'Synthesis reactor',
      failureMode: 'Mechanical',
      description: '',
      immediateCause: '',
      safeguardsWorked: '',
      safeguardsFailed: '',
      severity: 3,
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([
    { action: '', dueDate: '', owner: '' },
  ]);
  const [selectedRootCauses, setSelectedRootCauses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = incidentStorage.getAll();
      setIncidents(data as unknown as Incident[]);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({ title: 'Error', description: 'Failed to fetch incidents', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSubmitIncident = async (data: FormData) => {
    if (correctiveActions.some((a) => a.action && (!a.dueDate || !a.owner))) {
      toast({
        title: 'Error',
        description: 'All corrective actions must have a due date and owner',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Save to local storage
      incidentStorage.add({
        incident_type: data.incidentType,
        equipment: data.equipment,
        failure_mode: data.failureMode,
        description: data.description,
        immediate_cause: data.immediateCause,
        root_causes: selectedRootCauses,
        safeguards_worked: data.safeguardsWorked,
        safeguards_failed: data.safeguardsFailed,
        corrective_actions: correctiveActions.filter((a) => a.action),
        severity: data.severity,
      });

      setSubmitting(false);
      toast({ title: 'Success', description: 'Incident logged successfully' });
      reset();
      setCorrectiveActions([{ action: '', dueDate: '', owner: '' }]);
      setSelectedRootCauses([]);
      setShowForm(false);
      fetchIncidents();
    } catch (err) {
      setSubmitting(false);
      console.error('Submission error:', err);
      toast({
        title: 'Error',
        description: `Failed to submit incident: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddCorrectiveAction = () => {
    setCorrectiveActions([...correctiveActions, { action: '', dueDate: '', owner: '' }]);
  };

  const handleUpdateCorrectiveAction = (
    index: number,
    field: keyof CorrectiveAction,
    value: string
  ) => {
    const updated = [...correctiveActions];
    updated[index][field] = value;
    setCorrectiveActions(updated);
  };

  const handleRemoveCorrectiveAction = (index: number) => {
    setCorrectiveActions(correctiveActions.filter((_, i) => i !== index));
  };

  const toggleRootCause = (cause: string) => {
    setSelectedRootCauses((prev) =>
      prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]
    );
  };

  const handleDeleteIncident = (id: string) => {
    incidentStorage.delete(id);
    fetchIncidents();
    toast({ title: 'Success', description: 'Incident deleted' });
  };

  // Analytics calculations
  const filteredIncidents = incidents.filter((i) => {
    if (equipmentFilter !== 'all' && i.equipment !== equipmentFilter) return false;
    if (typeFilter !== 'all' && i.incident_type !== typeFilter) return false;
    return true;
  });

  const equipmentCounts = EQUIPMENT_OPTIONS.map((eq) => ({
    name: eq,
    count: incidents.filter((i) => i.equipment === eq).length,
  })).filter((e) => e.count > 0);

  const failureModeCounts = FAILURE_MODES.map((fm) => ({
    name: fm,
    count: incidents.filter((i) => i.failure_mode === fm).length,
  })).filter((f) => f.count > 0);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];

  const severityBadgeClass = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-green-600';
      case 2:
        return 'bg-yellow-600';
      case 3:
        return 'bg-orange-600';
      case 4:
        return 'bg-red-600';
      case 5:
        return 'bg-red-800';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          {/* NH3 logo disabled - work in progress */}
          <span className="flex items-center gap-1 cursor-not-allowed opacity-60 pointer-events-none">
            <ArrowLeft className="h-4 w-4" /> NH₃ Safety
          </span>
          <span>/</span>
          <span className="text-foreground font-medium">Incident Tracker</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Incident & Near-Miss Tracker</h1>
            <p className="text-muted-foreground mt-2">
              Document and analyze NH₃-specific incidents with root cause analysis
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Log New Incident
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Log New Incident</CardTitle>
              <CardDescription>
                Provide detailed information about the incident or near-miss
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleSubmitIncident)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="dateTime">Date & Time *</Label>
                    <Input id="dateTime" type="datetime-local" {...register('dateTime')} />
                  </div>

                  {/* Incident Type */}
                  <div className="space-y-2">
                    <Label htmlFor="incidentType">Incident Type *</Label>
                    <Controller
                      name="incidentType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="incidentType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Near-miss">Near-miss</SelectItem>
                            <SelectItem value="Minor release">Minor release</SelectItem>
                            <SelectItem value="Major release">Major release</SelectItem>
                            <SelectItem value="Fire/explosion">Fire/explosion</SelectItem>
                            <SelectItem value="Injury">Injury</SelectItem>
                            <SelectItem value="Equipment failure">Equipment failure</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Equipment */}
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment Involved *</Label>
                    <Controller
                      name="equipment"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="equipment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_OPTIONS.map((eq) => (
                              <SelectItem key={eq} value={eq}>
                                {eq}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Failure Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="failureMode">Failure Mode *</Label>
                    <Controller
                      name="failureMode"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="failureMode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FAILURE_MODES.map((fm) => (
                              <SelectItem key={fm} value={fm}>
                                {fm}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Severity */}
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity (1–5) *</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="severity"
                        type="number"
                        min="1"
                        max="5"
                        {...register('severity', { valueAsNumber: true })}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {watch('severity') === 1
                          ? 'Low'
                          : watch('severity') === 2
                            ? 'Minor'
                            : watch('severity') === 3
                              ? 'Moderate'
                              : watch('severity') === 4
                                ? 'Serious'
                                : 'Catastrophic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description of Incident *</Label>
                  <Textarea
                    id="description"
                    placeholder="What happened? Provide specific details..."
                    {...register('description')}
                    className="min-h-24"
                  />
                </div>

                {/* Immediate Cause */}
                <div className="space-y-2">
                  <Label htmlFor="immediateCause">Immediate Cause *</Label>
                  <Textarea
                    id="immediateCause"
                    placeholder="What directly caused the incident?"
                    {...register('immediateCause')}
                    className="min-h-20"
                  />
                </div>

                {/* Root Causes */}
                <div className="space-y-3">
                  <Label>Root Causes (select one or more)</Label>
                  <div className="space-y-2">
                    {ROOT_CAUSES.map((cause) => (
                      <div key={cause} className="flex items-center gap-2">
                        <Checkbox
                          id={`cause-${cause}`}
                          checked={selectedRootCauses.includes(cause)}
                          onCheckedChange={() => toggleRootCause(cause)}
                        />
                        <Label htmlFor={`cause-${cause}`} className="font-normal cursor-pointer">
                          {cause}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safeguards */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="safeguardsWorked">Safeguards That Worked</Label>
                    <Textarea
                      id="safeguardsWorked"
                      placeholder="What protective measures functioned correctly?"
                      {...register('safeguardsWorked')}
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="safeguardsFailed">Safeguards That Failed</Label>
                    <Textarea
                      id="safeguardsFailed"
                      placeholder="What safety systems did not function as designed?"
                      {...register('safeguardsFailed')}
                      className="min-h-20"
                    />
                  </div>
                </div>

                {/* Corrective Actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Corrective Actions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCorrectiveAction}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Action
                    </Button>
                  </div>

                  {correctiveActions.map((action, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-3 p-3 rounded-lg border">
                      <Input
                        placeholder="Corrective action"
                        value={action.action}
                        onChange={(e) =>
                          handleUpdateCorrectiveAction(index, 'action', e.target.value)
                        }
                      />
                      <Input
                        type="date"
                        value={action.dueDate}
                        onChange={(e) =>
                          handleUpdateCorrectiveAction(index, 'dueDate', e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Owner"
                          value={action.owner}
                          onChange={(e) =>
                            handleUpdateCorrectiveAction(index, 'owner', e.target.value)
                          }
                        />
                        {correctiveActions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCorrectiveAction(index)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="ml-auto bg-red-600 hover:bg-red-700"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? 'Logging...' : 'Log Incident'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Analytics */}
        {incidents.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Equipment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incidents by Equipment (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                {equipmentCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={equipmentCounts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">No incident data</p>
                )}
              </CardContent>
            </Card>

            {/* Failure Mode Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Failure Mode Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {failureModeCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={failureModeCounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {failureModeCounts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">No incident data</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Incident Log</CardTitle>
                <CardDescription>
                  {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {EQUIPMENT_OPTIONS.map((eq) => (
                      <SelectItem key={eq} value={eq}>
                        {eq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Near-miss">Near-miss</SelectItem>
                    <SelectItem value="Minor release">Minor release</SelectItem>
                    <SelectItem value="Major release">Major release</SelectItem>
                    <SelectItem value="Fire/explosion">Fire/explosion</SelectItem>
                    <SelectItem value="Injury">Injury</SelectItem>
                    <SelectItem value="Equipment failure">Equipment failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No incidents found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{incident.incident_type}</h3>
                          <Badge className={severityBadgeClass(incident.severity)}>
                            Severity {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.equipment}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {incident.root_causes?.map((cause) => (
                            <Badge key={cause} variant="secondary" className="text-xs">
                              {cause}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(incident.created_at), 'MMM d, yyyy')}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIncident(incident.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
