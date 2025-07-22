import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, CheckCircle, AlertCircle } from "lucide-react";

interface DataSourceStatus {
  reddit: boolean;
  espn: boolean;
  liveDataAvailable: boolean;
  currentDataSource: 'live' | 'mock';
}

export function DataSourceStatus() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    refetchInterval: 30000,
    select: (data: any) => data as { dataSource: 'live' | 'mock'; notifications: boolean; autoRefresh: boolean; }
  });

  const { data: liveStatus } = useQuery({
    queryKey: ["/api/live-data-status"],
    refetchInterval: 60000,
    select: (data: any) => ({
      reddit: false, // Reddit is currently blocked
      espn: data?.espnNFL || data?.espnNBA || data?.espnMLB || false,
      liveDataAvailable: (data?.espnNFL && data?.espnNBA && data?.espnMLB) || false,
      currentDataSource: settings?.dataSource || 'mock'
    })
  });

  if (!liveStatus) return null;

  const { reddit, espn, liveDataAvailable, currentDataSource } = liveStatus;

  return (
    <Alert className="bg-dark-secondary border-dark-tertiary mb-4">
      <InfoIcon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-text-secondary text-sm">Data Sources:</span>
          
          <div className="flex items-center gap-2">
            {espn ? (
              <CheckCircle className="w-4 h-4 text-accent-green" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <Badge variant={espn ? "default" : "destructive"} className="text-xs">
              ESPN Sports API
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {reddit ? (
              <CheckCircle className="w-4 h-4 text-accent-green" />
            ) : (
              <AlertCircle className="w-4 h-4 text-accent-amber" />
            )}
            <Badge variant={reddit ? "default" : "outline"} className="text-xs">
              {reddit ? "Reddit Live" : "Reddit Mock"}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-text-muted">
          {currentDataSource === 'live' && liveDataAvailable ? (
            "Live data active - ESPN + Sports APIs"
          ) : currentDataSource === 'live' ? (
            "Live data selected - partial sources available"
          ) : (
            "Mock data mode - realistic demo data"
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}