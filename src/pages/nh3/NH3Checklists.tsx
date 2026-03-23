import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckItem {
  id: string;
  item: string;
  severity: 'Critical' | 'Major' | 'Minor';
  result?: 'Pass' | 'Fail' | 'N/A';
  remarks?: string;
}

interface Category {
  id: string;
  name: string;
  items: CheckItem[];
}

const CHECKLISTS: Category[] = [
  {
    id: 'reactor',
    name: 'Synthesis Reactor',
    items: [
      {
        id: 'r1',
        item: 'Catalyst bed temperature profile — no hot spots >480°C',
        severity: 'Critical',
      },
      { id: 'r2', item: 'Pressure drop across catalyst bed within design limits', severity: 'Critical' },
      {
        id: 'r3',
        item: 'Refractory lining inspection — no visible cracks or spalling',
        severity: 'Major',
      },
      { id: 'r4', item: 'Outlet gas H₂:N₂ ratio within 3:1 ± 0.2', severity: 'Major' },
      {
        id: 'r5',
        item: 'High-pressure shell — no visible corrosion, pitting, or weld defects',
        severity: 'Critical',
      },
      {
        id: 'r6',
        item: 'Thermocouples — all functional, no drift >10°C from reference',
        severity: 'Minor',
      },
      { id: 'r7', item: 'Bypass valve — operable and leak-tight', severity: 'Major' },
    ],
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration System',
    items: [
      { id: 'f1', item: 'Suction pressure within operating envelope', severity: 'Critical' },
      { id: 'f2', item: 'Oil carryover indicator — within acceptable limit', severity: 'Major' },
      {
        id: 'f3',
        item: 'Evaporator frost pattern — uniform, no bare patches',
        severity: 'Major',
      },
      {
        id: 'f4',
        item: 'Condenser approach temperature <5°C of design',
        severity: 'Minor',
      },
      { id: 'f5', item: 'Relief valve — last test date within 2 years', severity: 'Critical' },
      {
        id: 'f6',
        item: 'NH₃ detector in machine room — calibrated, alarmed',
        severity: 'Critical',
      },
      {
        id: 'f7',
        item: 'Compressor vibration level — below 4.5 mm/s RMS',
        severity: 'Major',
      },
    ],
  },
  {
    id: 'storage',
    name: 'Storage Tank',
    items: [
      {
        id: 's1',
        item: 'Foundation settlement measurement — within 10mm tolerance',
        severity: 'Critical',
      },
      {
        id: 's2',
        item: 'Shell plate thickness (UT) — above minimum retirement thickness',
        severity: 'Critical',
      },
      {
        id: 's3',
        item: 'Roof-to-shell weld — no visible cracks or leakage',
        severity: 'Critical',
      },
      {
        id: 's4',
        item: 'Pressure/vacuum vent — operational, set point verified',
        severity: 'Critical',
      },
      {
        id: 's5',
        item: 'Berm/dike integrity — no cracks, vegetation controlled',
        severity: 'Major',
      },
      {
        id: 's6',
        item: 'Cathodic protection system — current within design range',
        severity: 'Major',
      },
      { id: 's7', item: 'Level gauge — functional and calibrated', severity: 'Minor' },
    ],
  },
  {
    id: 'compressor',
    name: 'Compressors',
    items: [
      {
        id: 'c1',
        item: 'Vibration spectrum vs. baseline — no new peaks',
        severity: 'Critical',
      },
      { id: 'c2', item: 'Seal gas differential pressure — positive', severity: 'Critical' },
      {
        id: 'c3',
        item: 'Lube oil cleanliness — NAS Class 7 or better',
        severity: 'Major',
      },
      {
        id: 'c4',
        item: 'Coupling alignment within 0.05mm TIR',
        severity: 'Major',
      },
      { id: 'c5', item: 'Suction strainer — clean, dp within limit', severity: 'Minor' },
      {
        id: 'c6',
        item: 'Thrust bearing temperature — below 90°C',
        severity: 'Major',
      },
    ],
  },
  {
    id: 'relief',
    name: 'Relief & Flare System',
    items: [
      {
        id: 'v1',
        item: 'PRV inlet pressure drop <3% of set pressure (10% rule)',
        severity: 'Critical',
      },
      {
        id: 'v2',
        item: 'Flare seal drum level — within operating range',
        severity: 'Critical',
      },
      {
        id: 'v3',
        item: 'Knock-out drum — drained, no liquid carryover',
        severity: 'Critical',
      },
      {
        id: 'v4',
        item: 'PRV seat leakage — zero visible downstream emission',
        severity: 'Major',
      },
      {
        id: 'v5',
        item: 'Flare tip condition — no blockage or burnback',
        severity: 'Major',
      },
      {
        id: 'v6',
        item: 'Flare ignition system — pilot confirmed lit',
        severity: 'Critical',
      },
    ],
  },
];

export default function NH3Checklists() {
  const [categories] = useState<Category[]>(CHECKLISTS);
  const [checklist, setChecklist] = useState(categories);
  const [activeTab, setActiveTab] = useState('reactor');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResultChange = (categoryId: string, itemId: string, result: 'Pass' | 'Fail' | 'N/A') => {
    setChecklist(
      checklist.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, result } : item
              ),
            }
          : cat
      )
    );
  };

  const handleRemarksChange = (categoryId: string, itemId: string, remarks: string) => {
    setChecklist(
      checklist.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, remarks } : item
              ),
            }
          : cat
      )
    );
  };

  const getCompletionPercentage = () => {
    const total = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
    const completed = checklist.reduce(
      (sum, cat) => sum + cat.items.filter((item) => item.result).length,
      0
    );

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCriticalFailures = () => {
    return checklist.reduce((count, cat) => {
      return (
        count +
        cat.items.filter((item) => item.severity === 'Critical' && item.result === 'Fail')
          .length
      );
    }, 0);
  };

  const getTotalCritical = () => {
    return checklist.reduce(
      (count, cat) => count + cat.items.filter((item) => item.severity === 'Critical').length,
      0
    );
  };

  const handleSubmitInspection = async () => {
    const criticalFailures = getCriticalFailures();

    setSubmitting(true);

    // Get current active category for submission
    const activeCategory = categories.find((c) => c.id === activeTab);
    if (!activeCategory) {
      toast({ title: 'Error', description: 'Invalid category', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    // Get the checklist for the active category
    const categoryChecklist = checklist.find((c) => c.id === activeTab);

    // @ts-ignore - Table types will be available after migration is applied and types are regenerated
    const { error } = await supabase.from('nh3_checklist_results').insert([
      {
        equipment_category: activeCategory.name,
        inspection_date: new Date().toISOString().split('T')[0],
        items: categoryChecklist?.items.map((item) => ({
          id: item.id,
          item: item.item,
          severity: item.severity,
          result: item.result || null,
          remarks: item.remarks || null,
        })),
        critical_failures: criticalFailures,
        status: criticalFailures > 0 ? 'escalated' : 'complete',
      },
    ]);

    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit inspection', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Checklist submitted successfully' });
      setTimeout(() => navigate('/nh3'), 1500);
    }
  };

  const activeCategory = checklist.find((c) => c.id === activeTab);
  const criticalFailures = getCriticalFailures();

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
          <span className="text-foreground font-medium">Equipment Checklists</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">NH₃ Equipment Inspection Checklists</h1>
          <p className="text-muted-foreground mt-2">
            Perform structured inspections specific to ammonia facility equipment
          </p>
        </div>

        {/* Critical Alert */}
        {criticalFailures > 0 && (
          <Card className="mb-6 bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-600">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200">
                    Critical Findings Detected
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    {criticalFailures} critical item{criticalFailures !== 1 ? 's' : ''} failed. Escalate to site safety officer immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Inspection Progress</span>
              <span className="text-sm font-mono">{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {checklist.reduce((sum, cat) => sum + cat.items.filter((item) => item.result).length, 0)} of {checklist.reduce((sum, cat) => sum + cat.items.length, 0)} items completed
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const catChecklist = checklist.find((c) => c.id === category.id);
            if (!catChecklist) return null;

            return (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.items.length} inspection items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {catChecklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.item}</p>
                            <Badge
                              variant={
                                item.severity === 'Critical'
                                  ? 'destructive'
                                  : item.severity === 'Major'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="mt-1"
                            >
                              {item.severity}
                            </Badge>
                          </div>
                        </div>

                        {/* Result Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.result === 'Pass' ? 'default' : 'outline'}
                            className={item.result === 'Pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                            onClick={() => handleResultChange(category.id, item.id, 'Pass')}
                          >
                            ✓ Pass
                          </Button>
                          <Button
                            size="sm"
                            variant={item.result === 'Fail' ? 'destructive' : 'outline'}
                            onClick={() => handleResultChange(category.id, item.id, 'Fail')}
                          >
                            ✗ Fail
                          </Button>
                          <Button
                            size="sm"
                            variant={item.result === 'N/A' ? 'default' : 'outline'}
                            onClick={() => handleResultChange(category.id, item.id, 'N/A')}
                          >
                            – N/A
                          </Button>
                        </div>

                        {/* Remarks */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Remarks (optional)</label>
                          <Textarea
                            placeholder="Add any observations or notes..."
                            value={item.remarks || ''}
                            onChange={(e) =>
                              handleRemarksChange(category.id, item.id, e.target.value)
                            }
                            className="mt-1 min-h-20"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Submit Button */}
        <div className="mt-8 flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/nh3">Cancel</Link>
          </Button>
          <Button
            onClick={handleSubmitInspection}
            disabled={submitting || getCompletionPercentage() === 0}
            className="ml-auto bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting...' : 'Submit Inspection'}
          </Button>
        </div>

        {/* Completion Stats */}
        {getCompletionPercentage() > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Completion</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{getCompletionPercentage()}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Critical Items</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{criticalFailures}/{getTotalCritical()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <Badge className={criticalFailures > 0 ? 'bg-red-600 mt-1' : 'bg-green-600 mt-1'}>
                    {criticalFailures > 0 ? 'ESCALATED' : 'OK'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
