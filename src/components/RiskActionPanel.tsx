import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  X,
  Loader2,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface RiskFinding {
  id: string;
  inspection_id: string;
  finding_type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  score: number | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_notes: string | null;
  created_at: string;
  inspection?: {
    site_id: string;
    sites?: {
      name: string;
      location: string;
    };
  };
}

interface RiskActionPanelProps {
  onClose: () => void;
  onReEvaluate?: (siteId: string) => void;
}

export default function RiskActionPanel({ onClose, onReEvaluate }: RiskActionPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<RiskFinding[]>([]);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<RiskFinding | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('risk_findings')
      .select(`
        *,
        inspection:inspections (
          site_id,
          sites (
            name,
            location
          )
        )
      `)
      .eq('resolved', false)
      .in('severity', ['critical', 'high'])
      .order('created_at', { ascending: false });

    if (data) {
      setFindings(data as RiskFinding[]);
    }
    setLoading(false);
  };

  const handleResolve = async () => {
    if (!selectedFinding) return;
    
    setResolving(true);
    const { error } = await supabase
      .from('risk_findings')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_notes: resolveNotes,
      })
      .eq('id', selectedFinding.id);

    if (error) {
      toast({ title: 'Error resolving finding', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Finding marked as resolved' });
      setFindings(findings.filter((f) => f.id !== selectedFinding.id));
    }
    
    setResolving(false);
    setResolveDialogOpen(false);
    setSelectedFinding(null);
    setResolveNotes('');
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge>High</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const groupedFindings = findings.reduce((acc, finding) => {
    const siteName = finding.inspection?.sites?.name || 'Unknown Site';
    if (!acc[siteName]) acc[siteName] = [];
    acc[siteName].push(finding);
    return acc;
  }, {} as Record<string, RiskFinding[]>);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              Active Risk Findings
            </CardTitle>
            <CardDescription>
              {findings.length} unresolved high-priority findings
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto p-0">
          {findings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-success" />
              <p className="text-lg font-medium">No Active High-Priority Risks</p>
              <p className="text-sm text-muted-foreground">
                All critical and high-severity findings have been resolved.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedFindings).map(([siteName, siteFindings]) => (
                <div key={siteName} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{siteName}</h3>
                    {onReEvaluate && siteFindings[0]?.inspection?.site_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => onReEvaluate(siteFindings[0].inspection!.site_id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Re-evaluate
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {siteFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className={`rounded-lg border p-3 ${
                          finding.severity === 'critical' 
                            ? 'border-destructive/50 bg-destructive/5' 
                            : 'border-warning/50 bg-warning/5'
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(finding.severity)}
                            {getSeverityBadge(finding.severity)}
                            <Badge variant="outline">{finding.finding_type}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(finding.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h4 className="font-medium">{finding.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {finding.description}
                        </p>
                        <div className="mt-3 rounded-lg bg-background/80 p-2">
                          <p className="text-xs font-medium text-primary">Recommendation:</p>
                          <p className="text-sm">{finding.recommendation}</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFinding(finding);
                              setResolveDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Finding</DialogTitle>
            <DialogDescription>
              Mark this risk finding as resolved. Add notes describing the corrective action taken.
            </DialogDescription>
          </DialogHeader>
          {selectedFinding && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(selectedFinding.severity)}
                  <span className="font-medium">{selectedFinding.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedFinding.description}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  placeholder="Describe the corrective action taken..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolving || !resolveNotes.trim()}>
              {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
