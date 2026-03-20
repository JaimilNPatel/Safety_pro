import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  scenarioName: string;
  equipmentTag: string;
  initiatingEvent: string;
  initiatingFreq: string;
  consequence: string;
}

interface ProtectionLayer {
  id: string;
  name: string;
  pfd: number;
  selected: boolean;
}

const CONSEQUENCE_TARGETS: Record<string, number> = {
  Catastrophic: 1e-5,
  Critical: 1e-4,
  Marginal: 1e-3,
  Negligible: 1e-2,
};

const INITIATING_FREQUENCIES: Record<string, { label: string; value: number }> = {
  '10^-1': { label: '10⁻¹ /yr — Common (once in 10 years)', value: 0.1 },
  '10^-2': { label: '10⁻² /yr — Occasional', value: 0.01 },
  '10^-3': { label: '10⁻³ /yr — Uncommon', value: 0.001 },
  '10^-4': { label: '10⁻⁴ /yr — Rare', value: 0.0001 },
};

const PROTECTION_LAYERS: ProtectionLayer[] = [
  { id: '1', name: 'Basic Process Control System (BPCS)', pfd: 0.1, selected: false },
  { id: '2', name: 'Pressure Relief Valve (PRV)', pfd: 0.01, selected: false },
  { id: '3', name: 'Operator response (trained, >10 min)', pfd: 0.1, selected: false },
  { id: '4', name: 'Emergency Shutdown System (ESD)', pfd: 0.01, selected: false },
  { id: '5', name: 'Dike / bund containment', pfd: 0.01, selected: false },
  { id: '6', name: 'Deluge / water curtain', pfd: 0.1, selected: false },
];

export default function LopaEstimator() {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      scenarioName: '',
      equipmentTag: '',
      initiatingEvent: 'Process deviation',
      initiatingFreq: '10^-3',
      consequence: 'Critical',
    },
  });

  const [step, setStep] = useState(1);
  const [layers, setLayers] = useState<ProtectionLayer[]>(PROTECTION_LAYERS);
  const [results, setResults] = useState<{
    initiatingFreq: number;
    targetFreq: number;
    mitigatedFreq: number;
    rrf: number;
    sil: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const consequence = watch('consequence');
  const initiatingFreq = watch('initiatingFreq');

  const calculateRisk = () => {
    const initiatingFreqValue = INITIATING_FREQUENCIES[initiatingFreq].value;
    const targetFreq = CONSEQUENCE_TARGETS[consequence];

    // Calculate product of PFD for selected layers
    const selectedLayers = layers.filter((l) => l.selected);
    let pfdProduct = 1;
    selectedLayers.forEach((layer) => {
      pfdProduct *= layer.pfd;
    });

    // If no layers selected, PFD is 1 (no protection)
    if (selectedLayers.length === 0) {
      pfdProduct = 1;
    }

    const mitigatedFreq = initiatingFreqValue * pfdProduct;
    const rrf = mitigatedFreq / targetFreq;

    let sil = 'None';
    if (rrf >= 10 && rrf < 100) sil = 'SIL 1';
    else if (rrf >= 100 && rrf < 1000) sil = 'SIL 2';
    else if (rrf >= 1000) sil = 'SIL 3';

    setResults({
      initiatingFreq: initiatingFreqValue,
      targetFreq,
      mitigatedFreq,
      rrf,
      sil,
    });
  };

  const handleToggleLayer = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)));
  };

  const handleSaveScenario = async (data: FormData) => {
    if (!results) {
      toast({ title: 'Error', description: 'Please calculate risk first', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const selectedLayers = layers.filter((l) => l.selected);

    // @ts-ignore - Table types will be available after migration is applied and types are regenerated
    const { error } = await supabase.from('nh3_lopa_scenarios').insert([
      {
        name: data.scenarioName,
        equipment_tag: data.equipmentTag,
        initiating_event: data.initiatingEvent,
        initiating_freq: results.initiatingFreq,
        consequence: consequence,
        target_freq: results.targetFreq,
        selected_layers: selectedLayers.map((l) => ({ id: l.id, name: l.name, pfd: l.pfd })),
        mitigated_freq: results.mitigatedFreq,
        rrf: results.rrf,
        sil_required: results.sil,
      },
    ]);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save scenario', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Scenario saved successfully' });
      setTimeout(() => navigate('/nh3'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/nh3" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> NH₃ Safety
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">LOPA & SIL Estimator</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">LOPA & SIL Risk Estimator</h1>
          <p className="text-muted-foreground mt-2">
            Perform Layer of Protection Analysis to determine required Safety Integrity Level for ammonia hazards
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Steps Progress */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      step === s
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium">
                      Step {s}
                      {s === 1 && ': Scenario'}
                      {s === 2 && ': Consequence'}
                      {s === 3 && ': Protections'}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Results Preview */}
            {results && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">SIL Required</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        className={`text-base px-3 py-1 ${
                          results.sil === 'None'
                            ? 'bg-green-600'
                            : results.sil === 'SIL 1'
                              ? 'bg-yellow-600'
                              : results.sil === 'SIL 2'
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                        }`}
                      >
                        {results.sil}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mitigated Freq:</span>
                      <span className="font-mono font-semibold">{results.mitigatedFreq.toExponential(2)} /yr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RRF:</span>
                      <span className="font-mono font-semibold">{results.rrf.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Freq:</span>
                      <span className="font-mono font-semibold">{results.targetFreq.toExponential(0)} /yr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(handleSaveScenario)} className="space-y-6">
              {/* Step 1: Scenario Definition */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Scenario Definition</CardTitle>
                    <CardDescription>Define the hazard scenario and initiating event</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="scenarioName">Scenario name (required) *</Label>
                      <Input
                        id="scenarioName"
                        placeholder="e.g., Synthesis reactor overpressure"
                        {...register('scenarioName', { required: 'Scenario name is required' })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipmentTag">Equipment tag / ID</Label>
                      <Input
                        id="equipmentTag"
                        placeholder="e.g., V-101 Synthesis Reactor"
                        {...register('equipmentTag')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initiatingEvent">Initiating event *</Label>
                      <Select defaultValue="Process deviation">
                        <SelectTrigger id="initiatingEvent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Process deviation">Process deviation</SelectItem>
                          <SelectItem value="Equipment failure">Equipment failure</SelectItem>
                          <SelectItem value="Human error">Human error</SelectItem>
                          <SelectItem value="External event">External event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initiatingFreq">Initiating event frequency *</Label>
                      <Select defaultValue="10^-3">
                        <SelectTrigger id="initiatingFreq">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(INITIATING_FREQUENCIES).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Consequence Severity */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Consequence Severity</CardTitle>
                    <CardDescription>Define the potential consequence severity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="consequence">Consequence category *</Label>
                      <Select defaultValue="Critical">
                        <SelectTrigger id="consequence">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(CONSEQUENCE_TARGETS).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <p className="text-sm font-semibold">Target Frequency (auto-populated)</p>
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Target frequency for {consequence}:</span>
                          <span className="font-mono font-semibold">
                            {CONSEQUENCE_TARGETS[consequence].toExponential(0)} /yr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> These are standard target frequencies. Adjust based on company risk appetite and regulatory requirements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Protection Layers */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Existing Protection Layers</CardTitle>
                    <CardDescription>Select protection layers already in place</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Checkbox
                            id={layer.id}
                            checked={layer.selected}
                            onCheckedChange={() => handleToggleLayer(layer.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={layer.id} className="font-medium cursor-pointer">
                              {layer.name}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">PFD: {layer.pfd}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm font-semibold">Selected layers ({layers.filter((l) => l.selected).length}):</p>
                      {layers.filter((l) => l.selected).length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No protection layers selected</p>
                      ) : (
                        <div className="space-y-1">
                          {layers
                            .filter((l) => l.selected)
                            .map((l) => (
                              <div key={l.id} className="text-xs">
                                {l.name} (PFD: {l.pfd})
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation and Calculate */}
              <div className="flex gap-3">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Previous
                  </Button>
                )}
                {step < 3 && (
                  <Button onClick={() => setStep(step + 1)} className="ml-auto">
                    Next
                  </Button>
                )}
                {step === 3 && !results && (
                  <Button onClick={calculateRisk} className="ml-auto bg-orange-600 hover:bg-orange-700">
                    Calculate Risk
                  </Button>
                )}
              </div>
            </form>

            {/* Result Display */}
            {results && step === 3 && (
              <Card className="mt-6 border-t-4 border-t-orange-600">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>LOPA Results</span>
                    <Badge
                      className={`text-lg px-3 py-1 ${
                        results.sil === 'None'
                          ? 'bg-green-600'
                          : results.sil === 'SIL 1'
                            ? 'bg-yellow-600'
                            : results.sil === 'SIL 2'
                              ? 'bg-orange-600'
                              : 'bg-red-600'
                      }`}
                    >
                      {results.sil}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Reduction Bar */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Risk Reduction Factor Scale</p>
                    <div className="relative h-12 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 bg-red-200 dark:bg-red-800" style={{ width: '15%' }}>
                        <span className="text-xs font-bold text-red-900 dark:text-red-100">None</span>
                      </div>
                      <div className="absolute inset-y-0 flex items-center px-3" style={{ left: '15%', width: '42%' }} >
                        <span className="text-xs font-bold text-yellow-900 dark:text-yellow-100">SIL 1</span>
                      </div>
                      <div className="absolute inset-y-0 flex items-center px-3" style={{ left: '57%', width: '33%' }}>
                        <span className="text-xs font-bold text-orange-900 dark:text-orange-100">SIL 2</span>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 bg-red-400 dark:bg-red-600" style={{ width: '10%' }}>
                        <span className="text-xs font-bold text-red-900 dark:text-red-100">SIL 3</span>
                      </div>

                      {/* Current RRF Indicator */}
                      <div
                        className="absolute top-0 bottom-0 flex flex-col items-center justify-center border-l-2 border-black"
                        style={{ left: `${Math.min((Math.log10(results.rrf) / 3) * 100, 99)}%` }}
                      >
                        <div className="w-0.5 h-full bg-black" />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>RRF &lt;10</span>
                      <span>10–100</span>
                      <span>100–1000</span>
                      <span>≥1000</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Initiating Frequency</p>
                      <p className="font-mono font-semibold text-lg mt-1">{results.initiatingFreq.toExponential(1)} /yr</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Target Frequency</p>
                      <p className="font-mono font-semibold text-lg mt-1">{results.targetFreq.toExponential(1)} /yr</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Mitigated Frequency</p>
                      <p className="font-mono font-semibold text-lg mt-1">{results.mitigatedFreq.toExponential(2)} /yr</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Reduction Factor</p>
                      <p className="font-mono font-semibold text-lg mt-1">{results.rrf.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={saving}
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Scenario to Database'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
