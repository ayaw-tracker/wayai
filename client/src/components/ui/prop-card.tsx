import { Card } from "./card";
import { PropDetailModal } from "./prop-detail-modal";
import type { Prop } from "@shared/schema";
import { Bot } from "lucide-react";

interface PropCardProps {
  prop: Prop;
}

export default function PropCard({ prop }: PropCardProps) {
  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case "public_trap": return "Trap Risk";
      case "fade_alert": return "Fade Alert";
      case "sharp_play": return "Sharp Play";
      default: return "Neutral";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "public_trap": return "text-accent-amber";
      case "fade_alert": return "text-accent-red";
      case "sharp_play": return "text-accent-green";
      default: return "text-text-muted";
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage > 70) return "red";
    if (percentage < 40) return "green";
    return "amber";
  };

  return (
    <PropDetailModal prop={prop}>
      <Card className="bg-dark-secondary border border-dark-tertiary p-6 hover:border-accent-green/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">
            {prop.playerName}
          </h3>
          <p className="text-sm font-medium text-accent-green">{prop.propType}</p>
          <p className="text-xs text-text-secondary">{prop.matchup}</p>
        </div>
        <span className={`sentiment-badge ${prop.sentiment} ${getSentimentColor(prop.sentiment)}`}>
          {getSentimentLabel(prop.sentiment)}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            O {prop.line} ({prop.odds > 0 ? '+' : ''}{prop.odds})
          </span>
          <span className="text-lg font-bold text-text-primary">
            {prop.publicPercentage}% Public
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${getProgressBarColor(prop.publicPercentage)}`}
            style={{ width: `${prop.publicPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Money %:</span>
          <span className="text-text-primary">{prop.moneyPercentage}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Line Movement:</span>
          <span className={`${parseFloat(prop.lineMovement) > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
            {parseFloat(prop.lineMovement) > 0 ? '+' : ''}{prop.lineMovement}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Hit Rate:</span>
          <span className={`${prop.hitRate && prop.hitRate < 45 ? 'text-accent-red' : prop.hitRate && prop.hitRate > 60 ? 'text-accent-green' : 'text-accent-amber'}`}>
            {prop.hitRate ? `${prop.hitRate}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Weather:</span>
          <span className={`${prop.weatherConditions === 'rain' ? 'text-accent-red' : 'text-accent-green'}`}>
            {prop.weatherConditions === 'rain' ? 'Windy/Rain' : 'Clear'}
          </span>
        </div>
      </div>
      
      {prop.trendFlag && (
        <div className="mt-3 p-2 bg-dark-tertiary rounded-lg">
          <span className="text-xs text-accent-amber font-medium">
            🔍 {prop.trendFlag.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}
      
      {prop.aiInsight && (
        <div className="mt-4 p-3 bg-dark rounded-lg">
          <p className="text-xs text-text-secondary">
            <Bot className="inline w-3 h-3 text-accent-green mr-1" />
            {prop.aiInsight}
          </p>
        </div>
      )}
    </Card>
    </PropDetailModal>
  );
}
