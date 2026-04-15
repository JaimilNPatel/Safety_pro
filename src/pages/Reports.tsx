import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, FileText, Loader2, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ReportRow {
  id: string;
  inspection_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  sites: {
    name: string;
    location: string;
  } | null;
}

export default function Reports() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('inspections')
      .select(`
        id,
        inspection_type,
        status,
        created_at,
        completed_at,
        sites (
          name,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setRows(data as ReportRow[]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inspection Reports</h1>
            <p className="text-muted-foreground">Open inspection records and report details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Reports
            </CardTitle>
            <CardDescription>{rows.length} total inspection records</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No reports found yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row) => (
                  <Link
                    key={row.id}
                    to={`/inspection/${row.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={row.status === 'completed' ? 'default' : 'secondary'}>
                          {row.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Badge variant="outline">
                          {row.inspection_type === 'new' ? 'Full Assessment' : 'Routine'}
                        </Badge>
                      </div>

                      <h3 className="mt-2 font-semibold">{row.sites?.name || 'Unknown Site'}</h3>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {row.sites?.location || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {format(new Date(row.created_at), 'MMM d, yyyy')}
                        </span>
                        {row.completed_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Completed {format(new Date(row.completed_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
