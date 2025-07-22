import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import PropCard from "@/components/ui/prop-card";
import HeatmapTable from "@/components/ui/heatmap-table";
import PromptBox from "@/components/ui/prompt-box";
import AIFeed from "@/components/ui/ai-feed";
import TrendAlerts from "@/components/ui/trend-alerts";
import AccuracyTracker from "@/components/ui/accuracy-tracker";
import { DataStatusBanner } from "@/components/ui/data-status-banner";
import { DataQualityHUD } from "@/components/ui/data-quality-hud";
import { EmptyState } from "@/components/ui/empty-state";
import { SmartSearch } from "@/components/ui/smart-search";
import { ScraperControl } from "@/components/ui/scraper-control";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSport } from "@/contexts/sport-context";
// Live data only - no mock imports
import type { Prop, AiInsight } from "@shared/schema";

interface DashboardStats {
  publicWins: string;
  trapsDetected: number;
  sharpMoves: number;
  fadeRecs: number;
  weeklyAccuracy: string;
}

type PropSort = 'public-percent' | 'risk-level' | 'line-movement' | 'hit-rate';

export default function Dashboard() {
  const [filteredProps, setFilteredProps] = useState<Prop[]>([]);
  const [sortBy, setSortBy] = useState<PropSort>('public-percent');
  const { selectedSport } = useSport();

  const { data: props, isLoading: propsLoading } = useQuery<Prop[]>({
    queryKey: ["/api/props", selectedSport],
    queryFn: () => fetch(`/api/props?sport=${selectedSport}`).then(res => res.json()),
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<AiInsight[]>({
    queryKey: ["/api/insights"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: sportsContext } = useQuery({
    queryKey: ["/api/sports-insights", selectedSport],
    queryFn: () => fetch(`/api/sports-insights?sport=${selectedSport}`).then(res => res.json()),
  });

  // Live data only - all sports use same live API
  const displayProps = props || [];
  const displayInsights = insights;

  // Sort filtered props
  const sortedProps = useMemo(() => {
    return filteredProps.sort((a, b) => {
      switch (sortBy) {
        case 'public-percent':
          return b.publicPercentage - a.publicPercentage;
        case 'risk-level':
          // Sort by sentiment: public_trap (highest risk) > fade_alert > neutral > sharp_play (lowest risk)
          const riskOrder = { 'public_trap': 4, 'fade_alert': 3, 'neutral': 2, 'sharp_play': 1 };
          return (riskOrder[b.sentiment as keyof typeof riskOrder] || 0) - (riskOrder[a.sentiment as keyof typeof riskOrder] || 0);
        case 'line-movement':
          return Math.abs(parseFloat(b.lineMovement)) - Math.abs(parseFloat(a.lineMovement));
        case 'hit-rate':
          return (b.hitRate || 0) - (a.hitRate || 0);
        default:
          return 0;
      }
    });
  }, [filteredProps, sortBy]);

  // Initialize filtered props when props change
  useMemo(() => {
    if (displayProps.length > 0 && filteredProps.length === 0) {
      setFilteredProps(displayProps);
    }
  }, [displayProps]);

  const featuredProps = sortedProps.slice(0, 3);

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 bg-dark-secondary border-r border-dark-tertiary p-6 space-y-6">
          <PromptBox />
          <ScraperControl />
          <DataQualityHUD />
          <TrendAlerts />
          <AccuracyTracker />
          <AIFeed insights={displayInsights || []} isLoading={insightsLoading} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <DataStatusBanner />
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Today's {selectedSport} Prop Trends</h1>
              <p className="text-text-secondary">Real-time analysis of where the public money is going</p>
              
              {/* Live Stats Cards - Only display when data is available */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                  <div className="text-2xl font-bold text-text-primary">
                    {statsLoading ? "..." : (stats?.publicWins && stats.publicWins !== "NaN%" ? stats.publicWins : "--")}
                  </div>
                  <div className="text-sm text-text-secondary">Public Win Rate</div>
                </Card>
                <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                  <div className="text-2xl font-bold text-accent-amber">
                    {statsLoading ? "..." : (stats?.trapsDetected || 0)}
                  </div>
                  <div className="text-sm text-text-secondary">AI Traps Detected</div>
                </Card>
                <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                  <div className="text-2xl font-bold text-accent-green">
                    {statsLoading ? "..." : (stats?.sharpMoves || 0)}
                  </div>
                  <div className="text-sm text-text-secondary">Sharp Moves</div>
                </Card>
                <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                  <div className="text-2xl font-bold text-accent-red">
                    {statsLoading ? "..." : (stats?.fadeRecs || 0)}
                  </div>
                  <div className="text-sm text-text-secondary">Fade Opportunities</div>
                </Card>
                <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                  <div className="text-2xl font-bold text-text-primary">
                    {sortedProps.length}
                  </div>
                  <div className="text-sm text-text-secondary">Live Props</div>
                </Card>
              </div>
            </div>

            {/* Smart Search and Sort */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <SmartSearch 
                  props={displayProps} 
                  onFilter={setFilteredProps}
                />
                <div className="ml-auto">
                  <Select value={sortBy} onValueChange={(value: PropSort) => setSortBy(value)}>
                    <SelectTrigger className="w-48 bg-dark-secondary border-dark-tertiary text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-secondary border-dark-tertiary">
                      <SelectItem value="public-percent">Sort by Public %</SelectItem>
                      <SelectItem value="risk-level">Sort by Risk Level</SelectItem>
                      <SelectItem value="line-movement">Sort by Line Movement</SelectItem>
                      <SelectItem value="hit-rate">Sort by Hit Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Heatmap Table */}
            <HeatmapTable props={sortedProps} isLoading={propsLoading} />

            {/* Featured Props Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Featured Props Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="bg-dark-secondary border border-dark-tertiary p-6 animate-pulse">
                      <div className="h-4 bg-dark-tertiary rounded mb-4"></div>
                      <div className="h-8 bg-dark-tertiary rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-dark-tertiary rounded"></div>
                        <div className="h-3 bg-dark-tertiary rounded"></div>
                        <div className="h-3 bg-dark-tertiary rounded"></div>
                      </div>
                    </Card>
                  ))
                ) : (
                  featuredProps.map((prop) => (
                    <PropCard key={prop.id} prop={prop} />
                  ))
                )}
              </div>
            </div>

            {/* Mobile AI Prompt */}
            <div className="lg:hidden mb-6">
              <Card className="bg-dark-secondary border border-dark-tertiary p-4">
                <h3 className="text-lg font-semibold mb-3 text-text-primary">Ask AI</h3>
                <PromptBox />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
