import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataStatusBanner } from "@/components/ui/data-status-banner";
import { DataSourceStatus } from "@/components/ui/data-source-status";
import { TrendingUp, TrendingDown, Users, AlertTriangle, Target, MessageSquare } from "lucide-react";
import { useSport } from "@/contexts/sport-context";

interface TailingSentiment {
  betId: string;
  player: string;
  propType: string;
  tailRate: number;
  influencerCount: number;
  redditMentions: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'overtailed' | 'consensus' | 'contrarian';
}

interface InfluencerPick {
  id: string;
  source: 'twitter' | 'reddit';
  author: string;
  authorHandle: string;
  content: string;
  betType: string;
  player?: string;
  confidence: 'high' | 'medium' | 'low';
  engagement: number;
  timestamp: string;
  sport: string;
}

export default function TailWatch() {
  const { selectedSport } = useSport();
  const [activeTab, setActiveTab] = useState<'sentiment' | 'picks'>('sentiment');

  const { data: tailingSentiment, isLoading: sentimentLoading } = useQuery<TailingSentiment[]>({
    queryKey: ["/api/tailing-sentiment", selectedSport],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: influencerPicks, isLoading: picksLoading } = useQuery<InfluencerPick[]>({
    queryKey: ["/api/influencer-picks", selectedSport],
    refetchInterval: 600000, // 10 minutes
  });

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'overtailed':
        return <Badge className="bg-red-600 text-white">⚠️ Overtailed</Badge>;
      case 'consensus':
        return <Badge className="bg-accent-amber text-white">📊 Consensus</Badge>;
      case 'contrarian':
        return <Badge className="bg-accent-green text-white">💎 Contrarian</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-accent-green text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-accent-amber text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <DataSourceStatus />
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-accent-blue" />
              <h1 className="text-3xl font-bold text-text-primary">{selectedSport} Tail Watch</h1>
            </div>
            <p className="text-text-secondary">
              Monitor social sentiment, influencer picks, and tailing trends to identify betting edges
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sentiment' | 'picks')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tailing Sentiment
              </TabsTrigger>
              <TabsTrigger value="picks" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Community Picks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sentiment">
              {sentimentLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-dark-secondary border-dark-tertiary">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-dark-tertiary rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-dark-tertiary rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tailingSentiment?.map((item) => (
                    <Card key={item.betId} className="bg-dark-secondary border-dark-tertiary hover:border-accent-blue/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                              {item.player} {item.propType}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {getRiskBadge(item.riskLevel)}
                              <Badge variant="outline" className="text-xs">
                                {item.redditMentions} Reddit mentions
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-accent-blue mb-1">
                              {item.tailRate}%
                            </div>
                            <div className="text-xs text-text-secondary">Tail Rate</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-text-secondary">Tailing Intensity</span>
                            <span className="text-text-primary">{item.tailRate}%</span>
                          </div>
                          <Progress value={item.tailRate} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {item.sentiment === 'bullish' ? (
                                <TrendingUp className="w-4 h-4 text-accent-green" />
                              ) : item.sentiment === 'bearish' ? (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-accent-amber"></div>
                              )}
                              <span className="text-text-secondary capitalize">{item.sentiment}</span>
                            </div>
                            <div className="text-text-secondary">
                              {item.influencerCount} influencer{item.influencerCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <div className="text-xs text-text-muted">
                            {item.riskLevel === 'overtailed' && 'Consider fading - high public interest'}
                            {item.riskLevel === 'consensus' && 'Popular pick - standard risk'}
                            {item.riskLevel === 'contrarian' && 'Low tail rate - potential value'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!tailingSentiment || tailingSentiment.length === 0) && (
                    <Card className="bg-dark-secondary border-dark-tertiary">
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Tailing Data</h3>
                        <p className="text-text-secondary">
                          No significant tailing activity detected for {selectedSport} today.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="picks">
              {picksLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-dark-secondary border-dark-tertiary">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-dark-tertiary rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-dark-tertiary rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {influencerPicks?.map((pick) => (
                    <Card key={pick.id} className="bg-dark-secondary border-dark-tertiary hover:border-accent-green/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {pick.source === 'reddit' ? '🟠' : '🐦'} {pick.authorHandle}
                              </Badge>
                              {getConfidenceBadge(pick.confidence)}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-text-primary">
                              {pick.engagement} interactions
                            </div>
                            <div className="text-xs text-text-secondary">
                              {new Date(pick.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-medium text-text-primary mb-1">{pick.content}</h4>
                          {pick.player && (
                            <div className="text-sm text-text-secondary">
                              {pick.player} • {pick.betType}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {pick.sport}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-accent-blue hover:bg-accent-blue/10">
                            View Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!influencerPicks || influencerPicks.length === 0) && (
                    <Card className="bg-dark-secondary border-dark-tertiary">
                      <CardContent className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Recent Picks</h3>
                        <p className="text-text-secondary">
                          No influencer picks found for {selectedSport} in the last 24 hours.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}