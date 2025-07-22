import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, Database, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataQualityMetrics {
  timestamp: string;
  sources: {
    [key: string]: {
      totalGamesFound: number;
      propsExtracted: number;
      extractionRate: number;
      responseTime: number;
      status: 'healthy' | 'degraded' | 'failed';
      errors: string[];
    }
  };
  aggregateStats: {
    totalProps: number;
    activeSources: number;
    averageResponseTime: number;
    overallHealth: 'healthy' | 'degraded' | 'failed';
  };
}

interface DataQualityDiagnostics {
  criticalIssues: string[];
  recommendations: string[];
  performanceInsights: string[];
}

export function DataQualityHUD() {
  const { data: metrics, isLoading } = useQuery<DataQualityMetrics>({
    queryKey: ["/api/data-quality-metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: diagnostics } = useQuery<DataQualityDiagnostics>({
    queryKey: ["/api/data-quality-diagnostics"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !metrics) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Quality Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400">Loading diagnostics...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'degraded': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-3 w-3" />;
      case 'degraded': return <AlertTriangle className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Live Data Quality Monitor
          <Badge variant="outline" className={cn("text-xs", getStatusColor(metrics.aggregateStats.overallHealth))}>
            {getStatusIcon(metrics.aggregateStats.overallHealth)}
            {metrics.aggregateStats.overallHealth.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{metrics.aggregateStats.totalProps}</div>
            <div className="text-gray-400">Total Props</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{metrics.aggregateStats.activeSources}</div>
            <div className="text-gray-400">Active Sources</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{Math.round(metrics.aggregateStats.averageResponseTime)}ms</div>
            <div className="text-gray-400">Avg Response</div>
          </div>
        </div>

        {/* Source Details */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Source Performance</h4>
          {Object.entries(metrics.sources).map(([sourceName, sourceMetrics]) => (
            <div key={sourceName} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", getStatusColor(sourceMetrics.status))}>
                  {getStatusIcon(sourceMetrics.status)}
                  {sourceName}
                </Badge>
                <span className="text-xs text-gray-400">
                  {sourceMetrics.propsExtracted}/{sourceMetrics.totalGamesFound} games
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">{sourceMetrics.extractionRate.toFixed(1)}%</div>
                <Progress 
                  value={sourceMetrics.extractionRate} 
                  className="w-16 h-1" 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Critical Issues */}
        {diagnostics?.criticalIssues && diagnostics.criticalIssues.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical Issues
            </h4>
            {diagnostics.criticalIssues.map((issue, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                {issue}
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-yellow-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Optimization Tips
            </h4>
            {diagnostics.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded">
                {rec}
              </div>
            ))}
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}