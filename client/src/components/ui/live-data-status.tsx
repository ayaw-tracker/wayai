import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, Database, AlertCircle } from "lucide-react";

interface LiveDataStatus {
  espnNFL: boolean;
  espnNBA: boolean;
  espnMLB: boolean;
  nbaStats: boolean;
  mlbStats: boolean;
  timestamp: string;
}

export function LiveDataStatus() {
  const { data: status, isLoading } = useQuery<LiveDataStatus>({
    queryKey: ["/api/live-data-status"],
    refetchInterval: 60000, // Check every minute
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  if (isLoading || !status) {
    return (
      <Card className="bg-dark-secondary border-dark-tertiary mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-text-secondary">
            <Database className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Checking live data sources...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSources = 5;
  const activeSources = Object.values(status).filter(val => typeof val === 'boolean' && val).length;
  const allHealthy = activeSources === totalSources;

  return (
    <Card className="bg-dark-secondary border-dark-tertiary mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allHealthy ? (
              <Wifi className="w-4 h-4 text-accent-green" />
            ) : activeSources > 0 ? (
              <AlertCircle className="w-4 h-4 text-accent-amber" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            
            <div>
              <span className="text-text-primary font-medium text-sm">
                Live Data Sources
              </span>
              <div className="text-xs text-text-secondary">
                {activeSources}/{totalSources} active • Last check: {new Date(status.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <Badge 
              variant={status.espnNFL ? "default" : "destructive"}
              className={`text-xs ${status.espnNFL ? 'bg-accent-green' : 'bg-red-600'}`}
            >
              NFL
            </Badge>
            <Badge 
              variant={status.espnNBA ? "default" : "destructive"}
              className={`text-xs ${status.espnNBA ? 'bg-accent-green' : 'bg-red-600'}`}
            >
              NBA
            </Badge>
            <Badge 
              variant={status.espnMLB ? "default" : "destructive"}
              className={`text-xs ${status.espnMLB ? 'bg-accent-green' : 'bg-red-600'}`}
            >
              MLB
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}