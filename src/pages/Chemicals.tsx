import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, FlaskConical, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Chemical {
  id: string;
  name: string;
  cas_number: string;
  flash_point: number | null;
  boiling_point: number | null;
  idlh_ppm: number | null;
  reactivity_group: string;
  material_factor: number | null;
  heat_of_combustion: number | null;
  molecular_weight: number | null;
  density_kg_m3: number | null;
  vapor_pressure_kpa: number | null;
  auto_ignition_temp_c: number | null;
  lower_explosive_limit: number | null;
  upper_explosive_limit: number | null;
  specific_heat_kj_kgk: number | null;
  viscosity_cp: number | null;
  vapor_density: number | null;
  log_kow: number | null;
  nfpa_health: number | null;
  nfpa_fire: number | null;
  nfpa_reactivity: number | null;
}

export default function Chemicals() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [filteredChemicals, setFilteredChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchChemicals();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChemicals(chemicals);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChemicals(
        chemicals.filter(
          c => c.name.toLowerCase().includes(query) || c.cas_number.includes(query)
        )
      );
    }
  }, [searchQuery, chemicals]);

  const fetchChemicals = async () => {
    const { data } = await supabase.from('chemicals').select('*').order('name');
    if (data) {
      setChemicals(data as Chemical[]);
      setFilteredChemicals(data as Chemical[]);
    }
    setLoading(false);
  };

  const getReactivityBadgeColor = (group: string) => {
    const dangerous = ['strong_acid', 'strong_base', 'strong_oxidizer', 'oxidizer', 'halogen'];
    const moderate = ['alcohol', 'aldehyde', 'ketone', 'amine', 'epoxide', 'nitrile', 'nitro'];
    if (dangerous.includes(group)) return 'destructive';
    if (moderate.includes(group)) return 'default';
    return 'secondary';
  };

  const getNfpaColor = (value: number | null) => {
    if (value === null) return 'bg-muted text-muted-foreground';
    if (value >= 4) return 'bg-red-600 text-white';
    if (value >= 3) return 'bg-red-500 text-white';
    if (value >= 2) return 'bg-orange-500 text-white';
    if (value >= 1) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const fmt = (val: number | null | undefined, unit: string = '') => {
    if (val === null || val === undefined) return 'N/A';
    return `${val}${unit}`;
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
            <h1 className="text-2xl font-bold">Chemical Database</h1>
            <p className="text-muted-foreground">
              {chemicals.length} chemicals · Search by name or CAS number · Click to expand properties
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by chemical name or CAS number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredChemicals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Chemicals Found</h3>
              <p className="mt-2 text-muted-foreground">Try a different search term</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChemicals.map(chem => (
              <Collapsible
                key={chem.id}
                open={expandedId === chem.id}
                onOpenChange={(open) => setExpandedId(open ? chem.id : null)}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{chem.name}</CardTitle>
                          <CardDescription>
                            CAS: {chem.cas_number}
                            {chem.molecular_weight && ` · MW: ${chem.molecular_weight}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getReactivityBadgeColor(chem.reactivity_group) as any}>
                            {chem.reactivity_group.replace(/_/g, ' ')}
                          </Badge>
                          {expandedId === chem.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CardContent className="pt-0">
                    {/* Summary row always visible */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Flash Point:</span>
                        <span className="ml-1 font-medium">{fmt(chem.flash_point, '°C')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Boiling Point:</span>
                        <span className="ml-1 font-medium">{fmt(chem.boiling_point, '°C')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IDLH:</span>
                        <span className="ml-1 font-medium">{fmt(chem.idlh_ppm, ' ppm')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Material Factor:</span>
                        <span className="ml-1 font-medium">{fmt(chem.material_factor)}</span>
                      </div>
                    </div>

                    {/* NFPA diamond always visible */}
                    {(chem.nfpa_health !== null || chem.nfpa_fire !== null || chem.nfpa_reactivity !== null) && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground mr-1">NFPA:</span>
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${getNfpaColor(chem.nfpa_health)}`} title="Health">
                          {chem.nfpa_health ?? '-'}
                        </span>
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${getNfpaColor(chem.nfpa_fire)}`} title="Fire">
                          {chem.nfpa_fire ?? '-'}
                        </span>
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${getNfpaColor(chem.nfpa_reactivity)}`} title="Reactivity">
                          {chem.nfpa_reactivity ?? '-'}
                        </span>
                        <span className="ml-1 text-[10px] text-muted-foreground">H / F / R</span>
                      </div>
                    )}

                    {/* Expanded details */}
                    <CollapsibleContent>
                      <div className="mt-4 border-t pt-4 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Physical Properties
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Density:</span>
                            <span className="ml-1 font-medium">{fmt(chem.density_kg_m3, ' kg/m³')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mol. Weight:</span>
                            <span className="ml-1 font-medium">{fmt(chem.molecular_weight, ' g/mol')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vapor Pressure:</span>
                            <span className="ml-1 font-medium">{fmt(chem.vapor_pressure_kpa, ' kPa')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vapor Density:</span>
                            <span className="ml-1 font-medium">{fmt(chem.vapor_density, ' (air=1)')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Viscosity:</span>
                            <span className="ml-1 font-medium">{fmt(chem.viscosity_cp, ' cP')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sp. Heat:</span>
                            <span className="ml-1 font-medium">{fmt(chem.specific_heat_kj_kgk, ' kJ/kg·K')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Log Kow:</span>
                            <span className="ml-1 font-medium">{fmt(chem.log_kow)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ΔHc:</span>
                            <span className="ml-1 font-medium">{fmt(chem.heat_of_combustion, ' MJ/kg')}</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                          Flammability & Explosion
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Auto-Ignition:</span>
                            <span className="ml-1 font-medium">{fmt(chem.auto_ignition_temp_c, '°C')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LEL / UEL:</span>
                            <span className="ml-1 font-medium">
                              {chem.lower_explosive_limit !== null && chem.upper_explosive_limit !== null
                                ? `${chem.lower_explosive_limit}% – ${chem.upper_explosive_limit}%`
                                : chem.lower_explosive_limit !== null
                                ? `${chem.lower_explosive_limit}% – N/A`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredChemicals.length} of {chemicals.length} chemicals
        </div>
      </main>
    </div>
  );
}
