import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataStatusBanner } from "@/components/ui/data-status-banner";
import { Calendar, Filter, TrendingUp, TrendingDown, Search, Target } from "lucide-react";
import { useSport } from "@/contexts/sport-context";

interface HistoricalProp {
  id: number;
  date: string;
  playerName: string;
  propType: string;
  line: string;
  odds: number;
  result: 'hit' | 'miss';
  actualValue?: number;
  publicPercentage: number;
  outcome: string;
}

interface PropHistory {
  date: string;
  totalProps: number;
  publicHeavyHits: number;
  publicHeavyTotal: number;
  sharpPlayHits: number;
  sharpPlayTotal: number;
  trapAlertsCorrect: number;
  trapAlertsTotal: number;
}

export default function History() {
  const { selectedSport: globalSport } = useSport();
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [playerSearch, setPlayerSearch] = useState<string>('');

  const { data: propHistory, isLoading: historyLoading } = useQuery<PropHistory[]>({
    queryKey: ["/api/history"],
  });

  // Live historical data only - no mock data
  const historicalProps: HistoricalProp[] = [];

  const filteredProps = historicalProps.filter(prop => {
    // Filter by outcome
    if (selectedOutcome !== 'all' && prop.result !== selectedOutcome) return false;
    
    // Filter by player name search
    if (playerSearch && !prop.playerName.toLowerCase().includes(playerSearch.toLowerCase())) return false;
    
    // Filter by date range
    if (dateRange !== 'all') {
      const propDate = new Date(prop.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - propDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case '7d':
          if (daysDiff > 7) return false;
          break;
        case '30d':
          if (daysDiff > 30) return false;
          break;
        case '90d':
          if (daysDiff > 90) return false;
          break;
      }
    }
    
    return true;
  });

  // Calculate insights from filtered data
  const getInsights = () => {
    const total = filteredProps.length;
    const hits = filteredProps.filter(p => p.result === 'hit').length;
    const publicHeavy = filteredProps.filter(p => p.publicPercentage >= 70);
    const publicHeavyHits = publicHeavy.filter(p => p.result === 'hit').length;
    const sharpPlays = filteredProps.filter(p => p.publicPercentage <= 30);
    const sharpHits = sharpPlays.filter(p => p.result === 'hit').length;
    
    return {
      totalHitRate: total ? Math.round((hits / total) * 100) : 0,
      publicHeavyRate: publicHeavy.length ? Math.round((publicHeavyHits / publicHeavy.length) * 100) : 0,
      sharpRate: sharpPlays.length ? Math.round((sharpHits / sharpPlays.length) * 100) : 0,
      totalProps: total,
      publicHeavyProps: publicHeavy.length,
      sharpProps: sharpPlays.length
    };
  };

  const insights = getInsights();

  const getResultBadge = (result: string, publicPercentage: number) => {
    if (result === 'hit') {
      return publicPercentage > 60 
        ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Public Win</Badge>
        : <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sharp Win</Badge>;
    } else {
      return publicPercentage > 60
        ? <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Public Trap</Badge>
        : <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Sharp Miss</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <DataStatusBanner />
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-accent-blue" />
              <h1 className="text-3xl font-bold text-text-primary">{globalSport} Historical Analysis</h1>
            </div>
            <p className="text-text-secondary">Analyze historical prop performance to identify betting patterns and edges</p>
          </div>

          {/* Enhanced Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent-green" />
              <span className="text-text-primary font-medium">Analyzing {globalSport} Data</span>
              <Badge variant="outline" className="text-text-secondary">
                {filteredProps.length} of {historicalProps.length} props
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Player Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="pl-10 w-48 bg-dark-secondary border-dark-tertiary text-text-primary"
                />
              </div>

              {/* Date Range Filter */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-dark-secondary border-dark-tertiary text-text-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-dark-tertiary">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Outcome Filter */}
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="w-40 bg-dark-secondary border-dark-tertiary text-text-primary">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-dark-tertiary">
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="hit">Hits Only</SelectItem>
                  <SelectItem value="miss">Misses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Historical Performance Summary */}
          {historyLoading ? (
            <div className="animate-pulse mb-6">
              <div className="bg-dark-secondary h-32 rounded-lg"></div>
            </div>
          ) : propHistory && propHistory.length > 0 ? (
            <Card className="mb-6 bg-dark-secondary border-dark-tertiary">
              <CardHeader>
                <CardTitle className="text-text-primary">7-Day Performance Summary</CardTitle>
                <CardDescription className="text-text-secondary">
                  Accuracy rates for different betting patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-green">
                      {propHistory[0] ? Math.round((propHistory[0].publicHeavyHits / propHistory[0].publicHeavyTotal) * 100) : 0}%
                    </div>
                    <div className="text-sm text-text-secondary">Public Heavy (&gt;70%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-blue">
                      {propHistory[0] ? Math.round((propHistory[0].sharpPlayHits / propHistory[0].sharpPlayTotal) * 100) : 0}%
                    </div>
                    <div className="text-sm text-text-secondary">Sharp Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-amber">
                      {propHistory[0] ? Math.round((propHistory[0].trapAlertsCorrect / propHistory[0].trapAlertsTotal) * 100) : 0}%
                    </div>
                    <div className="text-sm text-text-secondary">Trap Alert Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">
                      {propHistory[0]?.totalProps || 0}
                    </div>
                    <div className="text-sm text-text-secondary">Total Props Tracked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Historical Props List */}
          <div className="space-y-4">
            {filteredProps.map((prop) => (
              <Card key={prop.id} className="bg-dark-secondary border-dark-tertiary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-text-primary">
                          {prop.playerName} {prop.propType}
                        </h3>
                        {getResultBadge(prop.result, prop.publicPercentage)}
                        <Badge variant="outline" className="text-xs">
                          {prop.date}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Line: </span>
                          <span className="text-text-primary font-medium">
                            {prop.line} ({prop.odds > 0 ? '+' : ''}{prop.odds})
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Result: </span>
                          <span className={`font-medium ${
                            prop.result === 'hit' ? 'text-accent-green' : 'text-accent-red'
                          }`}>
                            {prop.actualValue !== undefined ? prop.actualValue : prop.result.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Public: </span>
                          <span className="text-text-primary font-medium">{prop.publicPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {prop.result === 'hit' ? (
                            <TrendingUp className="h-3 w-3 text-accent-green" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-accent-red" />
                          )}
                          <span className="text-text-secondary text-xs">{prop.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProps.length === 0 && (
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Historical Data</h3>
                <p className="text-text-secondary">
                  No props match your current filter criteria. Try adjusting your filters above.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Load More Button */}
          <div className="text-center mt-6">
            <Button variant="outline" className="border-dark-tertiary text-text-primary hover:bg-dark-tertiary">
              Load More History
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}