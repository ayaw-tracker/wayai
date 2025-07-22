import { Card } from "./card";
import { TriangleAlert, Ban, CheckCircle, Minus } from "lucide-react";
import type { Prop } from "@shared/schema";

interface HeatmapTableProps {
  props: Prop[];
  isLoading: boolean;
}

export default function HeatmapTable({ props, isLoading }: HeatmapTableProps) {
  const getProgressBarColor = (percentage: number) => {
    if (percentage > 70) return "bg-accent-red";
    if (percentage < 40) return "bg-accent-green";
    return "bg-accent-amber";
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "public_trap":
        return { label: "Public Trap", className: "sentiment-badge public-trap" };
      case "fade_alert":
        return { label: "Fade Alert", className: "sentiment-badge fade-alert" };
      case "sharp_play":
        return { label: "Sharp Play", className: "sentiment-badge sharp-play" };
      default:
        return { label: "Neutral", className: "sentiment-badge neutral" };
    }
  };

  const getAIIcon = (sentiment: string) => {
    switch (sentiment) {
      case "public_trap":
        return <TriangleAlert className="w-4 h-4 text-accent-amber" />;
      case "fade_alert":
        return <Ban className="w-4 h-4 text-accent-red" />;
      case "sharp_play":
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      default:
        return <Minus className="w-4 h-4 text-text-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Public Betting Heatmap</h2>
        <Card className="bg-dark-secondary border border-dark-tertiary p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-tertiary rounded mb-4"></div>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-dark-tertiary rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Public Betting Heatmap</h2>
      <Card className="bg-dark-secondary border border-dark-tertiary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-tertiary">
              <tr>
                <th className="px-4 py-3 text-left text-text-secondary font-medium">Player/Prop</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">Line</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">Public %</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">Money %</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">Movement</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">Status</th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium">AI Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-tertiary">
              {props.map((prop, index) => {
                const sentimentBadge = getSentimentBadge(prop.sentiment);
                return (
                  <tr key={`${prop.playerId}-${index}`} className="hover:bg-dark-tertiary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">
                        {prop.playerName} {prop.propType}
                      </div>
                      <div className="text-xs text-text-secondary">{prop.matchup}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">
                      O {prop.line} ({prop.odds > 0 ? '+' : ''}{prop.odds})
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center">
                        <div className="w-16 h-2 bg-dark-tertiary rounded-full mr-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(prop.publicPercentage)}`}
                            style={{ width: `${prop.publicPercentage}%` }}
                          />
                        </div>
                        <span className={`font-medium ${getProgressBarColor(prop.publicPercentage).replace('bg-', 'text-')}`}>
                          {prop.publicPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">{prop.moneyPercentage}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${parseFloat(prop.lineMovement) > 0 ? 'text-accent-red' : parseFloat(prop.lineMovement) < 0 ? 'text-accent-green' : 'text-text-secondary'}`}>
                        {parseFloat(prop.lineMovement) === 0 ? '-' : `${parseFloat(prop.lineMovement) > 0 ? '+' : ''}${prop.lineMovement}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={sentimentBadge.className}>
                        {sentimentBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getAIIcon(prop.sentiment)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
