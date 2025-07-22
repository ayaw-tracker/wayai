import { useQuery } from "@tanstack/react-query";
import { Card } from "./card";
import { TriangleAlert, TrendingDown, Target, Ban } from "lucide-react";
import type { TrendAlert } from "@shared/schema";

export default function TrendAlerts() {
  const { data: alerts, isLoading } = useQuery<TrendAlert[]>({
    queryKey: ["/api/alerts"],
  });

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "crowd_trap":
        return <TriangleAlert className="w-4 h-4" />;
      case "sharp_pivot":
        return <Target className="w-4 h-4" />;
      case "losing_streak":
        return <TrendingDown className="w-4 h-4" />;
      case "reverse_line":
        return <Ban className="w-4 h-4" />;
      default:
        return <TriangleAlert className="w-4 h-4" />;
    }
  };

  const getAlertColor = (alertType: string, severity: string) => {
    const baseColors = {
      crowd_trap: "bg-accent-amber text-dark",
      sharp_pivot: "bg-accent-green text-dark", 
      losing_streak: "bg-accent-red text-dark",
      reverse_line: "bg-blue-500 text-white",
    };
    
    return baseColors[alertType as keyof typeof baseColors] || "bg-accent-amber text-dark";
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: "bg-red-500 text-white",
      medium: "bg-yellow-500 text-dark",
      low: "bg-gray-500 text-white",
    };
    
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border border-dark-tertiary p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">🚨 Active Trend Alerts</h3>
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-dark-tertiary rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-dark-tertiary rounded w-3/4"></div>
                  <div className="h-3 bg-dark-tertiary rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-dark-secondary border border-dark-tertiary p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">🚨 Active Trend Alerts</h3>
        <p className="text-text-secondary text-sm">No active alerts - market looks clean</p>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border border-dark-tertiary p-6">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">🚨 Active Trend Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-dark rounded-lg">
            <div className={`p-1.5 rounded ${getAlertColor(alert.alertType, alert.severity)}`}>
              {getAlertIcon(alert.alertType)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-text-primary capitalize">
                  {alert.alertType.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {alert.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}