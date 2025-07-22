import { Card } from "./card";
import { TriangleAlert, TrendingUp, TrendingDown } from "lucide-react";
import type { AiInsight } from "@shared/schema";

interface AIFeedProps {
  insights: AiInsight[];
  isLoading: boolean;
}

export default function AIFeed({ insights, isLoading }: AIFeedProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trap_alert":
        return <TriangleAlert className="w-3 h-3" />;
      case "sharp_money":
        return <TrendingUp className="w-3 h-3" />;
      case "fade_alert":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <TriangleAlert className="w-3 h-3" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "trap_alert":
        return "bg-accent-amber text-dark";
      case "sharp_money":
        return "bg-accent-green text-dark";
      case "fade_alert":
        return "bg-accent-red text-dark";
      default:
        return "bg-accent-amber text-dark";
    }
  };

  const getTimeAgo = (createdAt: Date | string) => {
    const now = new Date();
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const diffInMinutes = Math.floor((now.getTime() - createdAtDate.getTime()) / (1000 * 60));
    return `${diffInMinutes}m ago`;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Latest Insights</h3>
        <Card className="bg-dark border border-dark-tertiary p-4">
          <p className="text-sm text-text-secondary">Loading insights...</p>
        </Card>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Latest Insights</h3>
        <Card className="bg-dark border border-dark-tertiary p-4">
          <p className="text-sm text-text-secondary">No AI insights available</p>
          <p className="text-xs text-text-muted mt-1">Insights will appear as patterns are detected</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Latest Insights</h3>
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="bg-dark border border-dark-tertiary p-4">
            <div className="flex items-start space-x-3">
              <div className={`p-1 rounded ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary font-medium">{insight.title}</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {insight.description}
                </p>
                <span className={`text-xs mt-2 inline-block ${
                  insight.type === 'trap_alert' ? 'text-accent-amber' :
                  insight.type === 'sharp_money' ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {getTimeAgo(insight.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
