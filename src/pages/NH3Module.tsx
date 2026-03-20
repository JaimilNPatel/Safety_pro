import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Gauge, ListChecks, AlertTriangle, TrendingUp } from 'lucide-react';

export default function NH3Module() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Sticky Alert Banner */}
      <div className="sticky top-16 z-40 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-4 py-2">
        <div className="container flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
            <span>IDLH: 25 ppm | Flammable range: 15–28% in air | LC₅₀ (1hr): ~1000 ppm</span>
          </p>
        </div>
      </div>

      <main className="container py-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">NH₃ Safety Module</h1>
            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300">
              ⚠ Ammonia Safety
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Specialized tools for ammonia facility safety management, including dispersion modeling, risk assessment, 
            equipment inspections, and incident tracking.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dispersion Calculator Card */}
          <Card className="hover:shadow-lg transition-shadow border-t-2 border-t-amber-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-amber-600" />
                    Dispersion Calculator
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Estimate toxic release cloud radius using Gaussian dispersion model
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate IDLH, ERPG-2, and LC₅₀ zones for ammonia leaks based on orifice size, pressure, 
                atmospheric stability, and wind speed.
              </p>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link to="/nh3/dispersion">
                  Open →
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* LOPA Estimator Card */}
          <Card className="hover:shadow-lg transition-shadow border-t-2 border-t-orange-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    LOPA & SIL Estimator
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Layer of Protection Analysis and Safety Integrity Level assessment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Define ammonia hazard scenarios, evaluate protection layers, and determine required SIL (1–3) 
                for risk reduction targets.
              </p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link to="/nh3/lopa">
                  Open →
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Checklists Card */}
          <Card className="hover:shadow-lg transition-shadow border-t-2 border-t-red-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-red-600" />
                    Equipment Checklists
                  </CardTitle>
                  <CardDescription className="mt-1">
                    NH₃-specific inspection checklists for critical equipment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Perform structured inspections of synthesis reactors, refrigeration systems, storage tanks, 
                compressors, and relief systems with automatic critical finding escalation.
              </p>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link to="/nh3/checklists">
                  Open →
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Incident Tracker Card */}
          <Card className="hover:shadow-lg transition-shadow border-t-2 border-t-red-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-700" />
                    Incident Tracker
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Log and analyze NH₃ incidents and near-misses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Document incidents with root cause analysis, identify failed safeguards, and track corrective 
                actions with built-in analytics dashboard.
              </p>
              <Button asChild className="w-full bg-red-700 hover:bg-red-800">
                <Link to="/nh3/incidents">
                  Open →
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Important Safety Notes</h2>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• The dispersion calculator is a <strong>simplified screening model</strong> only. Use validated software (PHAST, SAFETI) for regulatory submissions.</li>
            <li>• LOPA estimates are based on standard PFD values. Verify with site-specific historical data and equipment datasheets.</li>
            <li>• Critical findings from checklists require immediate escalation to the site safety officer.</li>
            <li>• All incident data must comply with your facility's regulatory reporting requirements.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
