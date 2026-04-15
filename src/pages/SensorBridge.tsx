import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import SensorBridgePanel from '@/components/SensorBridgePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, BellRing, Link2, ShieldCheck } from 'lucide-react';

const integrationSteps = [
  {
    title: 'Connect live data',
    description: 'Import from SCADA, historian, OPC UA, MQTT, REST, or a CSV export from operations.',
    icon: Link2,
  },
  {
    title: 'Match it to equipment',
    description: 'Tie each reading to a site, asset tag, or inspection record so drift is visible in context.',
    icon: ShieldCheck,
  },
  {
    title: 'Trigger action',
    description: 'Convert abnormal values into a follow-up inspection, calibration review, or risk finding.',
    icon: BellRing,
  },
];

export default function SensorBridge() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" asChild className="w-fit gap-2 pl-0">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">
                <Activity className="h-4 w-4" />
                Sensor-aware safety layer
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Sensor Bridge</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Use SafetyPro as the interpretation layer above SCADA and sensor systems. The plant stays controlled by automation; this app turns live readings into inspection and safety decisions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/inspection/new">Start inspection</Link>
            </Button>
            <Button asChild>
              <Link to="/reports">Open reports</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How the integration works</CardTitle>
                <CardDescription>
                  Modern plants already have sensors. SafetyPro adds value by turning that data into action.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.title} className="flex gap-4 rounded-xl border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">0{index + 1}</span>
                          <h3 className="font-semibold">{step.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle>Why this matters</CardTitle>
                <CardDescription>
                  SCADA shows state. SafetyPro turns state into decisions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <p>• Compare live sensor readings with inspection baselines.</p>
                <p>• Flag drift, calibration issues, and abnormal trends before they become incidents.</p>
                <p>• Keep safety, maintenance, and compliance records in one workflow.</p>
                <p>• Provide a modern bridge between operations data and inspection intelligence.</p>
              </CardContent>
            </Card>
          </div>

          <SensorBridgePanel />
        </div>
      </main>
    </div>
  );
}