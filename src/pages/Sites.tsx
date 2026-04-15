import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Building2, MapPin, Loader2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Site {
  id: string;
  name: string;
  location: string;
  site_type: string;
  created_at: string;
  updated_at: string;
}

export default function Sites() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user]);

  const fetchSites = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setSites(data as Site[]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">All Sites</h1>
              <p className="text-muted-foreground">Browse and manage your inspection sites</p>
            </div>
          </div>

          <Button asChild className="gap-2">
            <Link to="/inspection/new">
              <Plus className="h-4 w-4" />
              New Inspection
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold">No Sites Yet</h2>
              <p className="mt-2 text-muted-foreground">Create your first site from New Inspection.</p>
              <Button asChild className="mt-4">
                <Link to="/inspection/new">Create Site</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Card key={site.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    {site.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {site.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{site.site_type}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(site.updated_at || site.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/inspection/new?site=${site.id}`}>Start Inspection</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
