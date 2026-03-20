import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

interface FormData {
  holeDiameter: number;
  upstreamPressure: number;
  stabilityClass: string;
  windSpeed: number;
  releaseHeight: number;
  duration: number;
}

interface Results {
  idlhRadius: number;
  erpg2Radius: number;
  lcFiftyRadius: number;
}

const STABILITY_COEFFICIENTS: Record<string, { a: number; c: number; d: number; f: number }> = {
  A: { a: 0.22, c: 0.20, d: 0.894, f: 0 },
  B: { a: 0.16, c: 0.12, d: 0.894, f: 0 },
  C: { a: 0.11, c: 0.08, d: 0.894, f: 0 },
  D: { a: 0.08, c: 0.06, d: 0.894, f: 0 },
  E: { a: 0.06, c: 0.03, d: 0.894, f: 0 },
  F: { a: 0.04, c: 0.016, d: 0.894, f: 0 },
};

// Unit conversion functions
const mmToM = (mm: number) => mm / 1000;
const barGToPa = (bar: number) => bar * 100000;
const ppmToMgM3 = (ppm: number) => ppm * 0.714; // For NH3 at STP (MW=17, approximate)
const mgM3ToPpm = (mgM3: number) => mgM3 / 0.714;

export default function DispersionCalculator() {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      holeDiameter: 50,
      upstreamPressure: 25,
      stabilityClass: 'D',
      windSpeed: 3,
      releaseHeight: 0,
      duration: 10,
    },
  });

  const [results, setResults] = useState<Results | null>(null);
  const [calculating, setCalculating] = useState(false);

  const stabilityClass = watch('stabilityClass');

  const calculateDispersion = (data: FormData) => {
    setCalculating(true);

    // Step 1: Calculate mass flow rate
    const holeArea = Math.PI * Math.pow(mmToM(data.holeDiameter) / 2, 2); // m²
    const deltaP = barGToPa(data.upstreamPressure); // Pa
    const rhoNH3 = 0.717; // kg/m³ at STP
    const Cd = 0.61; // discharge coefficient
    const massFlowRate = Cd * holeArea * Math.sqrt(2 * rhoNH3 * deltaP); // kg/s

    // Get dispersion coefficients
    const coeffs = STABILITY_COEFFICIENTS[data.stabilityClass];
    const u = data.windSpeed; // wind speed in m/s

    // Function to calculate concentration at distance x
    const calculateConcentration = (x: number, threshold: number): number => {
      if (u === 0 || x < 1) return 0;

      // Calculate dispersion parameters
      const sigma_y = coeffs.a * Math.pow(x, 0.894); // m
      const sigma_z = coeffs.c * Math.pow(x, coeffs.d) + coeffs.f; // m
      const He = data.releaseHeight; // effective height

      // Gaussian dispersion formula: C(x) = Q / (π * σy * σz * u) * exp(-He² / (2 * σz²))
      const exponentialTerm = Math.exp(-Math.pow(He, 2) / (2 * Math.pow(sigma_z, 2)));
      const concentration =
        (massFlowRate * 1000) / // Convert kg/s to g/s (1000 factor)
        (Math.PI * sigma_y * sigma_z * u) *
        exponentialTerm; // g/m³

      return concentration;
    };

    // Step 3: Find distances where concentration equals thresholds
    const findDistance = (targetConcentration: number): number => {
      // Convert ppm to mg/m³
      const targetMgM3 = ppmToMgM3(targetConcentration);

      // Iterate from 10m to 5000m in 10m steps
      for (let x = 10; x <= 5000; x += 10) {
        const conc = calculateConcentration(x, targetConcentration);
        if (conc <= targetMgM3) {
          return x;
        }
      }
      return 5000; // If concentration never drops below threshold
    };

    // Calculate the three zones
    const idlhRadius = findDistance(25); // 25 ppm
    const erpg2Radius = findDistance(150); // 150 ppm
    const lcFiftyRadius = findDistance(1000); // 1000 ppm

    setResults({
      idlhRadius,
      erpg2Radius,
      lcFiftyRadius,
    });

    setCalculating(false);
  };

  const maxRadius = results ? Math.max(results.idlhRadius, results.erpg2Radius, results.lcFiftyRadius) : 100;
  const scale = 500 / maxRadius; // Scale factor to fit in SVG

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
          <span className="text-foreground font-medium">Dispersion Calculator</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Toxic Release Dispersion Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Estimate the radius of hazard zones for ammonia leaks using Gaussian atmospheric dispersion model
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Model Inputs</CardTitle>
              <CardDescription>Define the leak scenario and atmospheric conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(calculateDispersion)} className="space-y-6">
                {/* Hole Diameter */}
                <div className="space-y-2">
                  <Label htmlFor="holeDiameter">Leak hole diameter (mm)</Label>
                  <Input
                    id="holeDiameter"
                    type="number"
                    min="1"
                    max="500"
                    step="0.5"
                    {...register('holeDiameter', { valueAsNumber: true, min: 1, max: 500 })}
                  />
                  <p className="text-xs text-muted-foreground">Range: 1–500 mm</p>
                </div>

                {/* Upstream Pressure */}
                <div className="space-y-2">
                  <Label htmlFor="upstreamPressure">Upstream pressure (bar g)</Label>
                  <Input
                    id="upstreamPressure"
                    type="number"
                    min="0"
                    max="300"
                    step="0.1"
                    {...register('upstreamPressure', { valueAsNumber: true })}
                  />
                </div>

                {/* Stability Class */}
                <div className="space-y-2">
                  <Label htmlFor="stabilityClass">Atmospheric stability class (Pasquill-Gifford)</Label>
                  <Select defaultValue={stabilityClass}>
                    <SelectTrigger id="stabilityClass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (Extremely unstable)</SelectItem>
                      <SelectItem value="B">B (Unstable)</SelectItem>
                      <SelectItem value="C">C (Slightly unstable)</SelectItem>
                      <SelectItem value="D">D (Neutral)</SelectItem>
                      <SelectItem value="E">E (Slightly stable)</SelectItem>
                      <SelectItem value="F">F (Stable)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">D = typical daytime, neutral conditions</p>
                </div>

                {/* Wind Speed */}
                <div className="space-y-2">
                  <Label htmlFor="windSpeed">Wind speed (m/s)</Label>
                  <Input
                    id="windSpeed"
                    type="number"
                    min="0.1"
                    max="20"
                    step="0.1"
                    {...register('windSpeed', { valueAsNumber: true, min: 0.1 })}
                  />
                </div>

                {/* Release Height */}
                <div className="space-y-2">
                  <Label htmlFor="releaseHeight">Release height (m)</Label>
                  <Input
                    id="releaseHeight"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    {...register('releaseHeight', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">0 = ground-level release</p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Release duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="1440"
                    step="1"
                    {...register('duration', { valueAsNumber: true, min: 1 })}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-amber-600 hover:bg-amber-700" disabled={calculating}>
                  {calculating ? 'Calculating...' : 'Calculate Dispersion'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">NH₃ Properties</p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Molecular weight: 17 g/mol</li>
                    <li>• Density (STP): 0.717 kg/m³</li>
                    <li>• Discharge coefficient (Cd): 0.61</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {!results ? (
              <Card className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Enter parameters and click "Calculate Dispersion" to see results</p>
                </div>
              </Card>
            ) : (
              <>
                {/* Result Cards */}
                <div className="grid gap-4">
                  {/* IDLH Zone */}
                  <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">IDLH Zone Radius</p>
                          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                            {results.idlhRadius.toFixed(0)} m
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                            Immediately Dangerous to Life or Health (25 ppm)
                          </p>
                        </div>
                        <Badge className="bg-yellow-600">🟡 IDLH</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ERPG-2 Zone */}
                  <Card className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-900 dark:text-orange-200">ERPG-2 Zone Radius</p>
                          <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                            {results.erpg2Radius.toFixed(0)} m
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Maximum hourly exposure for reversible effects (150 ppm)
                          </p>
                        </div>
                        <Badge className="bg-orange-600">🟠 ERPG-2</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LC₅₀ Zone */}
                  <Card className="bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-900 dark:text-red-200">LC₅₀ Zone Radius</p>
                          <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">
                            {results.lcFiftyRadius.toFixed(0)} m
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                            Lethal to 50% of exposed population, 1-hour exposure (~1000 ppm)
                          </p>
                        </div>
                        <Badge className="bg-red-600">🔴 LC₅₀</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hazard Zone Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <svg
                        width="400"
                        height="400"
                        viewBox="0 0 400 400"
                        className="drop-shadow"
                      >
                        {/* Center point */}
                        <circle cx="200" cy="200" r="4" fill="black" />

                        {/* LC50 zone (red) */}
                        <circle
                          cx="200"
                          cy="200"
                          r={Math.min(results.lcFiftyRadius * scale, 190)}
                          fill="#fca5a5"
                          opacity="0.3"
                          stroke="#dc2626"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />

                        {/* ERPG-2 zone (orange) */}
                        <circle
                          cx="200"
                          cy="200"
                          r={Math.min(results.erpg2Radius * scale, 190)}
                          fill="#fed7aa"
                          opacity="0.4"
                          stroke="#ea580c"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />

                        {/* IDLH zone (yellow) */}
                        <circle
                          cx="200"
                          cy="200"
                          r={Math.min(results.idlhRadius * scale, 190)}
                          fill="#fef3c7"
                          opacity="0.5"
                          stroke="#d97706"
                          strokeWidth="2"
                        />

                        {/* Wind direction arrow */}
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#666" />
                          </marker>
                        </defs>
                        <line x1="200" y1="50" x2="200" y2="90" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        <text x="210" y="75" fill="#666" fontSize="12" fontWeight="bold">
                          Wind
                        </text>

                        {/* Legend */}
                        <rect x="10" y="320" width="380" height="70" fill="white" opacity="0.9" stroke="#ccc" rx="4" />
                        <circle cx="20" cy="335" r="6" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                        <text x="32" y="339" fontSize="11" fontWeight="500">
                          IDLH: {results.idlhRadius.toFixed(0)}m
                        </text>
                        <circle cx="120" cy="335" r="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
                        <text x="132" y="339" fontSize="11" fontWeight="500">
                          ERPG-2: {results.erpg2Radius.toFixed(0)}m
                        </text>
                        <circle cx="250" cy="335" r="6" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
                        <text x="262" y="339" fontSize="11" fontWeight="500">
                          LC₅₀: {results.lcFiftyRadius.toFixed(0)}m
                        </text>

                        <text x="20" y="365" fontSize="10" fill="#666">
                          Not to scale • Assumes steady-state wind direction
                        </text>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Disclaimer */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Screening Model Only</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      This is a simplified model for preliminary risk assessment. For regulatory submissions and detailed risk 
                      analysis, use validated software such as PHAST, SAFETI, or EFFECTS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
