import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  ArrowRight,
  DatabaseZap,
  LineChart,
  Radar,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

type SensorStatus = 'normal' | 'watch' | 'alert';

type SensorSignal = {
  id: string;
  asset: string;
  signal: string;
  source: string;
  baseline: number;
  unit: string;
  value: number;
  status: SensorStatus;
  lagMinutes: number;
};

type DemoStep = {
  title: string;
  summary: string;
  signals: SensorSignal[];
};

const DEMO_STEPS: DemoStep[] = [
  {
    title: 'Shift start baseline',
    summary: 'All readings are close to the inspection baseline and no follow-up action is required.',
    signals: [
      {
        id: 'reactor-temp',
        asset: 'Reactor R-204',
        signal: 'Temperature',
        source: 'Historian feed',
        baseline: 182,
        unit: '°C',
        value: 183,
        status: 'normal',
        lagMinutes: 1,
      },
      {
        id: 'pump-vibration',
        asset: 'Pump P-17',
        signal: 'Vibration',
        source: 'Edge gateway',
        baseline: 2.1,
        unit: 'mm/s',
        value: 2.2,
        status: 'normal',
        lagMinutes: 1,
      },
      {
        id: 'nh3-detector',
        asset: 'NH₃ detector loop',
        signal: 'Gas concentration',
        source: 'Safety PLC',
        baseline: 0,
        unit: 'ppm',
        value: 0,
        status: 'normal',
        lagMinutes: 1,
      },
      {
        id: 'tank-level',
        asset: 'Storage Tank T-09',
        signal: 'Level',
        source: 'SCADA tag',
        baseline: 74,
        unit: '%',
        value: 75,
        status: 'normal',
        lagMinutes: 1,
      },
    ],
  },
  {
    title: 'Early drift detected',
    summary: 'A pump vibration rise and an NH₃ trace trigger a watch state for review.',
    signals: [
      {
        id: 'reactor-temp',
        asset: 'Reactor R-204',
        signal: 'Temperature',
        source: 'Historian feed',
        baseline: 182,
        unit: '°C',
        value: 186,
        status: 'watch',
        lagMinutes: 2,
      },
      {
        id: 'pump-vibration',
        asset: 'Pump P-17',
        signal: 'Vibration',
        source: 'Edge gateway',
        baseline: 2.1,
        unit: 'mm/s',
        value: 2.5,
        status: 'watch',
        lagMinutes: 2,
      },
      {
        id: 'nh3-detector',
        asset: 'NH₃ detector loop',
        signal: 'Gas concentration',
        source: 'Safety PLC',
        baseline: 0,
        unit: 'ppm',
        value: 3,
        status: 'watch',
        lagMinutes: 1,
      },
      {
        id: 'tank-level',
        asset: 'Storage Tank T-09',
        signal: 'Level',
        source: 'SCADA tag',
        baseline: 74,
        unit: '%',
        value: 79,
        status: 'watch',
        lagMinutes: 2,
      },
    ],
  },
  {
    title: 'Alert threshold crossed',
    summary: 'One asset crosses the alert threshold and should trigger an inspection task.',
    signals: [
      {
        id: 'reactor-temp',
        asset: 'Reactor R-204',
        signal: 'Temperature',
        source: 'Historian feed',
        baseline: 182,
        unit: '°C',
        value: 191,
        status: 'alert',
        lagMinutes: 3,
      },
      {
        id: 'pump-vibration',
        asset: 'Pump P-17',
        signal: 'Vibration',
        source: 'Edge gateway',
        baseline: 2.1,
        unit: 'mm/s',
        value: 3.1,
        status: 'alert',
        lagMinutes: 3,
      },
      {
        id: 'nh3-detector',
        asset: 'NH₃ detector loop',
        signal: 'Gas concentration',
        source: 'Safety PLC',
        baseline: 0,
        unit: 'ppm',
        value: 7,
        status: 'alert',
        lagMinutes: 1,
      },
      {
        id: 'tank-level',
        asset: 'Storage Tank T-09',
        signal: 'Level',
        source: 'SCADA tag',
        baseline: 74,
        unit: '%',
        value: 88,
        status: 'alert',
        lagMinutes: 3,
      },
    ],
  },
  {
    title: 'Corrective action logged',
    summary: 'A follow-up inspection returns the plant to a stable watch state and documents closure.',
    signals: [
      {
        id: 'reactor-temp',
        asset: 'Reactor R-204',
        signal: 'Temperature',
        source: 'Historian feed',
        baseline: 182,
        unit: '°C',
        value: 184,
        status: 'normal',
        lagMinutes: 1,
      },
      {
        id: 'pump-vibration',
        asset: 'Pump P-17',
        signal: 'Vibration',
        source: 'Edge gateway',
        baseline: 2.1,
        unit: 'mm/s',
        value: 2.3,
        status: 'watch',
        lagMinutes: 1,
      },
      {
        id: 'nh3-detector',
        asset: 'NH₃ detector loop',
        signal: 'Gas concentration',
        source: 'Safety PLC',
        baseline: 0,
        unit: 'ppm',
        value: 1,
        status: 'watch',
        lagMinutes: 1,
      },
      {
        id: 'tank-level',
        asset: 'Storage Tank T-09',
        signal: 'Level',
        source: 'SCADA tag',
        baseline: 74,
        unit: '%',
        value: 76,
        status: 'normal',
        lagMinutes: 1,
      },
    ],
  },
];

const statusConfig: Record<
  SensorStatus,
  { label: string; badgeClass: string; icon: typeof ShieldCheck }
> = {
  normal: {
    label: 'Normal',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    icon: ShieldCheck,
  },
  watch: {
    label: 'Watch',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    icon: Activity,
  },
  alert: {
    label: 'Alert',
    badgeClass: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: ShieldAlert,
  },
};

function formatDelta(value: number, baseline: number) {
  if (baseline === 0) {
    return value.toFixed(1);
  }

  const delta = ((value - baseline) / baseline) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

export interface SensorBridgePanelProps {
  compact?: boolean;
}

export default function SensorBridgePanel({ compact = false }: SensorBridgePanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const { toast } = useToast();
  const currentStep = DEMO_STEPS[stepIndex];
  const signals = currentStep.signals;

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setStepIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= DEMO_STEPS.length) {
          window.clearInterval(timer);
          setIsRunning(false);
          setIsComplete(true);
          setLastSync(new Date());
          toast({
            title: 'Simulation complete',
            description: 'The SCADA replay finished and the panel stopped on the final state.',
          });
          return currentIndex;
        }

        setLastSync(new Date());
        return nextIndex;
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isRunning, toast]);

  const handleStartSimulation = () => {
    setStepIndex(0);
    setIsComplete(false);
    setIsRunning(true);
    setLastSync(new Date());
  };

  const handleResetSimulation = () => {
    setStepIndex(0);
    setIsRunning(false);
    setIsComplete(false);
    setLastSync(new Date());
  };

  const totalAlerts = signals.filter((signal) => signal.status === 'alert').length;
  const watchCount = signals.filter((signal) => signal.status === 'watch').length;

  return (
    <Card className={compact ? 'border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background' : 'border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background'}>
      <CardHeader className={compact ? 'space-y-3' : 'space-y-4'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Radar className="h-5 w-5 text-primary" />
              Sensor Bridge
            </CardTitle>
            <CardDescription>
              SafetyPro can sit above SCADA or historian data and convert operational signals into safety actions.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Finite replay
            </Badge>
            <Badge variant="outline" className={isRunning ? 'border-amber-500/20 bg-amber-500/10 text-amber-700' : 'border-muted bg-muted/40 text-muted-foreground'}>
              {isRunning ? 'Running' : isComplete ? 'Complete' : 'Stopped'}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-primary">{currentStep.title}</p>
              <p className="text-sm text-muted-foreground">{currentStep.summary}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Step {stepIndex + 1} of {DEMO_STEPS.length}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleStartSimulation} disabled={isRunning} className="gap-2">
              <Activity className="h-4 w-4" />
              Start replay
            </Button>
            <Button variant="outline" onClick={handleResetSimulation} disabled={isRunning && stepIndex > 0}>
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card/80 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DatabaseZap className="h-4 w-4" />
              Connected signals
            </div>
            <div className="mt-2 text-2xl font-bold">{signals.length}</div>
          </div>
          <div className="rounded-lg border bg-card/80 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Watch items
            </div>
            <div className="mt-2 text-2xl font-bold">{watchCount}</div>
          </div>
          <div className="rounded-lg border bg-card/80 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              Active alerts
            </div>
            <div className="mt-2 text-2xl font-bold text-warning">{totalAlerts}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'space-y-4' : 'space-y-5'}>
        <div className="grid gap-3 md:grid-cols-2">
          {signals.map((signal) => {
            const config = statusConfig[signal.status];
            const StatusIcon = config.icon;

            return (
              <div key={signal.id} className="rounded-xl border bg-background/80 p-4 shadow-sm transition-colors hover:border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{signal.asset}</p>
                    <h3 className="text-lg font-semibold">{signal.signal}</h3>
                  </div>
                  <Badge variant="outline" className={config.badgeClass}>
                    <StatusIcon className="mr-1 h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tabular-nums">
                        {signal.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{signal.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Baseline {signal.baseline} {signal.unit} · Drift {formatDelta(signal.value, signal.baseline)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{signal.source}</div>
                    <div>Updated {signal.lagMinutes}m ago</div>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      signal.status === 'normal'
                        ? 'bg-emerald-500'
                        : signal.status === 'watch'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, signal.status === 'normal' ? 50 : signal.status === 'watch' ? 70 : 92)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <RefreshCw className="h-4 w-4" />
                Integration workflow
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                This panel uses a fixed replay with start and end states. It is meant to demonstrate how SCADA snapshots can be turned into inspection and safety actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/inspection/new">
                  Start inspection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2">
                <Link to="/reports">
                  View reports
                  <LineChart className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Last sync {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}. The replay stops after the final case, so it shows SCADA snapshots rather than a continuous live feed.
        </p>
      </CardContent>
    </Card>
  );
}