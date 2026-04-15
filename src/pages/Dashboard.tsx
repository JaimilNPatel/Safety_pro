import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/AppHeader';
import RiskActionPanel from '@/components/RiskActionPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Activity,
  Search, 
  Building2, 
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  Calendar,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';

interface InspectionWithSite {
  id: string;
  status: string;
  inspection_type: string;
  created_at: string;
  sites: {
    name: string;
    location: string;
  } | null;
}

interface DashboardStats {
  activeInspections: number;
  completedThisMonth: number;
  highRisks: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionWithSite[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ activeInspections: 0, completedThisMonth: 0, highRisks: 0 });
  const [loading, setLoading] = useState(true);
  const [showRiskPanel, setShowRiskPanel] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch recent inspections with site data
    const { data: inspectionsData } = await supabase
      .from('inspections')
      .select(`
        id,
        status,
        inspection_type,
        created_at,
        sites (
          name,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (inspectionsData) {
      setInspections(inspectionsData as InspectionWithSite[]);
    }

    // Fetch stats
    const { count: activeCount } = await supabase
      .from('inspections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: completedCount } = await supabase
      .from('inspections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth.toISOString());

    const { count: highRiskCount } = await supabase
      .from('risk_findings')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)
      .in('severity', ['critical', 'high']);

    setStats({
      activeInspections: activeCount || 0,
      completedThisMonth: completedCount || 0,
      highRisks: highRiskCount || 0,
    });

    setLoading(false);
  };

  const handleReEvaluate = (siteId: string) => {
    navigate(`/inspection/new?site=${siteId}`);
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your facility inspections and risk assessments
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
              <Link to="/inspection/new">
                <Plus className="h-5 w-5" />
                Start Inspection
              </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Inspections
                  </CardTitle>
                  <ClipboardList className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeInspections}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed This Month
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.completedThisMonth}</div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors hover:border-warning/50 ${
                  stats.highRisks > 0 ? 'border-warning/30 bg-warning/5' : ''
                }`}
                onClick={() => setShowRiskPanel(true)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    High Risks Active
                  </CardTitle>
                  <AlertTriangle className={`h-5 w-5 ${stats.highRisks > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${stats.highRisks > 0 ? 'text-warning' : ''}`}>
                      {stats.highRisks}
                    </div>
                    {stats.highRisks > 0 && (
                      <Button variant="ghost" size="sm" className="gap-1 text-warning">
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Inspections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Recent Inspections
                </CardTitle>
                <CardDescription>Your latest inspection activities</CardDescription>
              </CardHeader>
              <CardContent>
                {inspections.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No inspections yet. Start your first inspection!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspections.map((inspection) => (
                      <Link
                        key={inspection.id}
                        to={`/inspection/${inspection.id}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={inspection.status === 'completed' ? 'default' : 'secondary'}
                              >
                                {inspection.status === 'completed' ? 'Completed' : 'In Progress'}
                              </Badge>
                              <Badge variant="outline">
                                {inspection.inspection_type === 'new' ? 'Full Assessment' : 'Routine'}
                              </Badge>
                            </div>
                            <h3 className="mt-2 font-semibold">
                              {inspection.sites?.name || 'Unknown Site'}
                            </h3>
                            <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {inspection.sites?.location || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(inspection.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6">
                  <Link to="/chemicals">
                    <Search className="h-6 w-6" />
                    <span>Search Chemicals</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6">
                  <Link to="/sites">
                    <Building2 className="h-6 w-6" />
                    <span>View All Sites</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6">
                  <Link to="/inspections">
                    <ClipboardList className="h-6 w-6" />
                    <span>All Inspections</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6">
                  <Link to="/reports">
                    <FileText className="h-6 w-6" />
                    <span>Reports</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6 border-primary/30 hover:bg-primary/5">
                  <Link to="/sensor-bridge">
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="text-primary font-semibold">Sensor Bridge</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col gap-2 p-6 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20">
                  <Link to="/nh3">
                    <Flame className="h-6 w-6 text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-300 font-semibold">NH₃ Safety</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Panel Sidebar */}
          <div className="lg:col-span-1">
            {showRiskPanel ? (
              <RiskActionPanel 
                onClose={() => setShowRiskPanel(false)}
                onReEvaluate={handleReEvaluate}
              />
            ) : (
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  stats.highRisks > 0 ? 'border-warning/30' : ''
                }`}
                onClick={() => setShowRiskPanel(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className={`h-5 w-5 ${stats.highRisks > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                    Safety Actions
                  </CardTitle>
                  <CardDescription>
                    {stats.highRisks > 0 
                      ? `${stats.highRisks} finding${stats.highRisks > 1 ? 's' : ''} need attention`
                      : 'No active high-priority risks'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.highRisks > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Action Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to view prioritized safety steps and mark findings as resolved.
                      </p>
                      <Button className="w-full gap-2">
                        View Findings
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">All safety measures in place</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
