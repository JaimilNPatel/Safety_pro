import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Loader2, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2,
  FlaskConical,
  ClipboardCheck,
  FileDown
} from 'lucide-react';
import { format } from 'date-fns';

interface InspectionDetails {
  id: string;
  status: string;
  inspection_type: string;
  created_at: string;
  completed_at: string | null;
  sites: {
    name: string;
    location: string;
    site_type: string;
  } | null;
}

interface RiskFinding {
  id: string;
  finding_type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  score: number | null;
}

interface InspectionChemical {
  id: string;
  quantity_kg: number;
  storage_temp_c: number;
  pressure_atm: number;
  chemicals: {
    name: string;
    cas_number: string;
  } | null;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
}

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [findings, setFindings] = useState<RiskFinding[]>([]);
  const [chemicals, setChemicals] = useState<InspectionChemical[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchInspectionDetails();
  }, [id]);

  const fetchInspectionDetails = async () => {
    // Fetch inspection with site
    const { data: inspectionData } = await supabase
      .from('inspections')
      .select(`
        id,
        status,
        inspection_type,
        created_at,
        completed_at,
        sites (
          name,
          location,
          site_type
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (inspectionData) {
      setInspection(inspectionData as InspectionDetails);

      // Fetch findings if new inspection
      if (inspectionData.inspection_type === 'new') {
        const { data: findingsData } = await supabase
          .from('risk_findings')
          .select('*')
          .eq('inspection_id', id);
        if (findingsData) setFindings(findingsData);

        // Fetch chemicals
        const { data: chemicalsData } = await supabase
          .from('inspection_chemicals')
          .select(`
            id,
            quantity_kg,
            storage_temp_c,
            pressure_atm,
            chemicals (
              name,
              cas_number
            )
          `)
          .eq('inspection_id', id);
        if (chemicalsData) setChemicals(chemicalsData as InspectionChemical[]);
      } else {
        // Fetch checklist for routine inspection
        const { data: checklistData } = await supabase
          .from('routine_checklist')
          .select('*')
          .eq('inspection_id', id);
        if (checklistData) setChecklist(checklistData);

        // Fetch notes
        const { data: notesData } = await supabase
          .from('inspection_notes')
          .select('notes')
          .eq('inspection_id', id)
          .maybeSingle();
        if (notesData) setNotes(notesData.notes || '');
      }
    }

    setLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-critical" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold">Inspection Not Found</h3>
              <Button className="mt-4" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Group checklist by category
  const checklistByCategory: Record<string, ChecklistItem[]> = {};
  checklist.forEach(item => {
    if (!checklistByCategory[item.category]) {
      checklistByCategory[item.category] = [];
    }
    checklistByCategory[item.category].push(item);
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/inspections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{inspection.sites?.name}</h1>
              <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
                {inspection.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {inspection.sites?.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(inspection.created_at), 'MMMM d, yyyy')}
              </span>
              <Badge variant="outline">
                {inspection.inspection_type === 'new' ? 'Full Assessment' : 'Routine Inspection'}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Content based on inspection type */}
        {inspection.inspection_type === 'new' ? (
          <div className="space-y-6">
            {/* Chemicals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Chemical Inventory
                </CardTitle>
                <CardDescription>{chemicals.length} chemicals assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {chemicals.map(chem => (
                    <div key={chem.id} className="rounded-lg border p-3">
                      <div className="font-medium">{chem.chemicals?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        CAS: {chem.chemicals?.cas_number}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="ml-1 font-medium">{chem.quantity_kg} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="ml-1 font-medium">{chem.storage_temp_c}°C</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Press:</span>
                          <span className="ml-1 font-medium">{chem.pressure_atm} atm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Screening Results</CardTitle>
                <CardDescription>
                  {findings.filter(f => f.severity !== 'pass').length} findings require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {findings.map(finding => (
                    <div
                      key={finding.id}
                      className={`rounded-lg border p-4 ${
                        finding.severity === 'critical'
                          ? 'border-critical/50 bg-critical/5'
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
                        <Badge
                          variant={
                            finding.severity === 'critical'
                              ? 'destructive'
                              : finding.severity === 'high'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {finding.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm">{finding.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Routine Checklist Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Checklist Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(checklistByCategory).map(([category, items]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="mb-3 font-semibold">{category}</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${
                            item.checked ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'
                          }`}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span>{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            {notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
