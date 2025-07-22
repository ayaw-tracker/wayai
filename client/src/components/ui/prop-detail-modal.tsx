// Prop Detail Modal - Deep dive into individual prop analysis
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Wind, Thermometer } from "lucide-react";
import type { Prop } from "@shared/schema";

interface PropDetailModalProps {
  prop: Prop;
  children: React.ReactNode;
}

export function PropDetailModal({ prop, children }: PropDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'public_trap':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'sharp_play':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'fade_alert':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'public_trap':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sharp_play':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fade_alert':
        return 'bg-red-400/20 text-red-300 border-red-400/30';
      default:
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
    }
  };

  const riskLevel = prop.sentiment === 'public_trap' ? 'High Risk' : 
                   prop.sentiment === 'fade_alert' ? 'Medium Risk' : 
                   prop.sentiment === 'sharp_play' ? 'Low Risk' : 'Medium Risk';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-dark-secondary border-dark-tertiary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary flex items-center gap-2">
            {getSentimentIcon(prop.sentiment)}
            {prop.playerName} - {prop.propType} ({prop.team})
          </DialogTitle>
          <p className="text-sm text-text-secondary">{prop.matchup}</p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Prop Details */}
          <div className="space-y-4">
            <Card className="bg-dark border-dark-tertiary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Prop Details
                  <Badge className={`${getSentimentColor(prop.sentiment)} border`}>
                    {riskLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-text-secondary">Line</span>
                    <div className="text-lg font-semibold text-text-primary">{prop.line}</div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Odds</span>
                    <div className="text-lg font-semibold text-text-primary">{prop.odds}</div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Matchup</span>
                    <div className="text-sm font-medium text-text-primary">{prop.matchup}</div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Game Time</span>
                    <div className="text-sm font-medium text-text-primary">
                      {new Date(prop.gameTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark border-dark-tertiary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Betting Percentages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">Public Betting</span>
                    <span className="text-sm font-semibold text-text-primary">{prop.publicPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-tertiary rounded-full h-2">
                    <div 
                      className="bg-accent-amber h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prop.publicPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">Money Percentage</span>
                    <span className="text-sm font-semibold text-text-primary">{prop.moneyPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-tertiary rounded-full h-2">
                    <div 
                      className="bg-accent-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prop.moneyPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dark-tertiary">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Discrepancy</span>
                    <span className={`text-sm font-semibold ${
                      Math.abs(prop.publicPercentage - prop.moneyPercentage) > 15 
                        ? 'text-red-400' 
                        : Math.abs(prop.publicPercentage - prop.moneyPercentage) > 10 
                          ? 'text-amber-400' 
                          : 'text-green-400'
                    }`}>
                      {Math.abs(prop.publicPercentage - prop.moneyPercentage)}% gap
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis */}
          <div className="space-y-4">
            <Card className="bg-dark border-dark-tertiary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-primary leading-relaxed">
                  {prop.aiInsight || "No specific analysis available for this prop."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark border-dark-tertiary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-text-secondary">Hit Rate</span>
                    <div className="text-lg font-semibold text-text-primary">
                      {prop.hitRate ? `${prop.hitRate}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Line Movement</span>
                    <div className={`text-lg font-semibold ${
                      parseFloat(prop.lineMovement) > 0 ? 'text-green-400' : 
                      parseFloat(prop.lineMovement) < 0 ? 'text-red-400' : 'text-text-primary'
                    }`}>
                      {parseFloat(prop.lineMovement) > 0 ? '+' : ''}{prop.lineMovement}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Defense Rank</span>
                    <div className="text-lg font-semibold text-text-primary">#{prop.defenseRank}</div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Trend Flag</span>
                    <Badge variant="outline" className="text-xs">
                      {prop.trendFlag || 'stable'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {prop.weatherConditions && (
              <Card className="bg-dark border-dark-tertiary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Weather Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-text-primary capitalize">{prop.weatherConditions}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Weather conditions can significantly impact prop betting outcomes, especially for passing and kicking props.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-dark-tertiary">
          <Button variant="outline" className="flex-1">
            Track This Prop
          </Button>
          <Button variant="outline" className="flex-1">
            Share Analysis
          </Button>
          <Button 
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-accent-green hover:bg-green-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}