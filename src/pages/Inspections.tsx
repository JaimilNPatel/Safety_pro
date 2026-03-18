import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ClipboardList, MapPin, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface InspectionWithSite {
  id: string;
  status: string;
  inspection_type: string;
  created_at: string;
  completed_at: string | null;
  sites: {
    name: string;
    location: string;
  } | null;
}

export default function Inspections() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionWithSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchInspections();
  }, [user]);

  const fetchInspections = async () => {
    const { data } = await supabase
      .from('inspections')
      .select(`
        id,
        status,
        inspection_type,
        created_at,
        completed_at,
        sites (
          name,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setInspections(data as InspectionWithSite[]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">All Inspections</h1>
              <p className="text-muted-foreground">View your inspection history</p>
            </div>
          </div>
          
          <Button asChild>
            <Link to="/inspection/new">New Inspection</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inspections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Inspections Yet</h3>
              <p className="mt-2 text-muted-foreground">
                Start your first inspection to see it here
              </p>
              <Button className="mt-4" asChild>
                <Link to="/inspection/new">Start Inspection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inspections.map(inspection => (
              <Link
                key={inspection.id}
                to={`/inspection/${inspection.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
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
                      {inspection.completed_at && (
                        <span className="text-success">
                          Completed {format(new Date(inspection.completed_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
