import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataStatusBanner } from "@/components/ui/data-status-banner";
import { TrendingUp, TrendingDown, Target, AlertTriangle, Clock } from "lucide-react";
import { useSport } from "@/contexts/sport-context";
// Live data only - no mock imports
import type { Prop } from "@shared/schema";

interface TrendData {
  mostBetProps: Prop[];
  highestHitRateProps: Prop[];
  sharpPublicDivergence: Prop[];
  recentLineMovements: Prop[];
}

export default function Trends() {
  const { selectedSport } = useSport();
  
  const { data: props, isLoading: propsLoading } = useQuery<Prop[]>({
    queryKey: ["/api/props", selectedSport],
    queryFn: () => fetch(`/api/props?sport=${selectedSport}`).then(res => res.json()),
  });

  // Live data only - all sports use same live API
  const displayProps = props;

  // Process trends from props data with safe property access
  const trendsData: TrendData = {
    mostBetProps: displayProps?.slice().sort((a, b) => (b.publicPercentage || 0) - (a.publicPercentage || 0)).slice(0, 5) || [],
    highestHitRateProps: displayProps?.filter(p => p.hitRate && p.hitRate > 0).sort((a, b) => (b.hitRate || 0) - (a.hitRate || 0)).slice(0, 5) || [],
    sharpPublicDivergence: displayProps?.filter(p => p.publicPercentage && p.moneyPercentage && Math.abs((p.publicPercentage || 0) - (p.moneyPercentage || 0)) > 15).slice(0, 5) || [],
    recentLineMovements: displayProps?.filter(p => p.lineMovement && Math.abs(parseFloat(p.lineMovement.toString()) || 0) > 0.5).slice(0, 5) || []
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <DataStatusBanner />
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">{selectedSport} Market Trends</h1>
            <p className="text-text-secondary">Real-time analysis of betting patterns and market movements</p>
          </div>

          {propsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-dark-secondary h-64 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Most Bet Props */}
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-primary">
                    <TrendingUp className="h-5 w-5 text-accent-green" />
                    Most Bet Props
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Props with highest public betting percentages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendsData.mostBetProps.map((prop, index) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 bg-dark rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary text-sm">
                          {prop.playerName} {prop.propType}
                        </div>
                        <div className="text-xs text-text-secondary">{prop.matchup}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-accent-amber border-accent-amber">
                          #{index + 1}
                        </Badge>
                        <span className="text-lg font-bold text-text-primary">
                          {prop.publicPercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Highest Hit Rate */}
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-primary">
                    <Target className="h-5 w-5 text-accent-green" />
                    Highest Hit Rate (7 Days)
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Props with best recent performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendsData.highestHitRateProps.map((prop, index) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 bg-dark rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary text-sm">
                          {prop.playerName} {prop.propType}
                        </div>
                        <div className="text-xs text-text-secondary">O/U {prop.line}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-accent-green border-accent-green">
                          #{index + 1}
                        </Badge>
                        <span className="text-lg font-bold text-accent-green">
                          {prop.hitRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sharp vs Public Divergence */}
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-primary">
                    <AlertTriangle className="h-5 w-5 text-accent-red" />
                    Sharp vs Public Divergence
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Biggest gaps between public and money percentages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendsData.sharpPublicDivergence.map((prop) => (
                    <div key={prop.id} className="p-3 bg-dark rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-text-primary text-sm">
                          {prop.playerName} {prop.propType}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${
                            prop.sentiment === 'public_trap' 
                              ? 'text-accent-red border-accent-red' 
                              : 'text-accent-amber border-accent-amber'
                          }`}
                        >
                          {Math.abs(prop.publicPercentage - prop.moneyPercentage)}% gap
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">
                          Public: {prop.publicPercentage}%
                        </span>
                        <span className="text-text-secondary">
                          Money: {prop.moneyPercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Line Movements */}
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-primary">
                    <Clock className="h-5 w-5 text-accent-amber" />
                    Recent Line Movements
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Significant line changes in the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendsData.recentLineMovements.map((prop) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 bg-dark rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary text-sm">
                          {prop.playerName} {prop.propType}
                        </div>
                        <div className="text-xs text-text-secondary">
                          Current: O/U {prop.line}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {parseFloat(prop.lineMovement) > 0 ? (
                          <TrendingUp className="h-4 w-4 text-accent-red" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-accent-green" />
                        )}
                        <span className={`font-bold ${
                          parseFloat(prop.lineMovement) > 0 ? 'text-accent-red' : 'text-accent-green'
                        }`}>
                          {parseFloat(prop.lineMovement) > 0 ? '+' : ''}{prop.lineMovement}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trends Summary */}
          <Card className="mt-6 bg-dark-secondary border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-text-primary">Market Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent-green">
                    {trendsData.mostBetProps[0]?.publicPercentage || 0}%
                  </div>
                  <div className="text-sm text-text-secondary">Highest Public %</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-green">
                    {trendsData.highestHitRateProps[0]?.hitRate || 0}%
                  </div>
                  <div className="text-sm text-text-secondary">Best Hit Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-red">
                    {trendsData.sharpPublicDivergence.length}
                  </div>
                  <div className="text-sm text-text-secondary">Trap Alerts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-amber">
                    {trendsData.recentLineMovements.length}
                  </div>
                  <div className="text-sm text-text-secondary">Line Moves</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}