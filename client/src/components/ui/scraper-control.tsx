// WAY Scraper Control Panel
// Firebase-powered prop line monitoring controls

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RefreshCw, Database, TrendingUp, MessageCircle } from 'lucide-react';

interface ScraperStatus {
  isRunning: boolean;
  isPeakTime: boolean;
  nextScrape: string;
  sources: string[];
  firebaseStatus: string;
  collections: string[];
  timestamp: string;
}

interface ScraperResults {
  propsScraped: number;
  sentimentPoints: number;
  lineMovements: number;
  aiAlerts: number;
  sources: string[];
  timestamp: string;
}

export function ScraperControl() {
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<ScraperResults | null>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scraper/status');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
      } else {
        toast({
          title: "Status Check Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to fetch scraper status",
        variant: "destructive"
      });
    }
  };

  const triggerScraping = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastResults(result.data);
        toast({
          title: "Scraping Complete",
          description: `Collected ${result.data.propsScraped} props and ${result.data.sentimentPoints} sentiment points`,
          variant: "default"
        });
        
        // Refresh status after scraping
        await fetchStatus();
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Trigger Error",
        description: "Failed to trigger scraping",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <Card className="p-6 bg-dark-secondary border-dark-tertiary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Firebase Scraper Control</h3>
            <p className="text-sm text-text-secondary">Multi-source prop line monitoring</p>
          </div>
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            className="border-dark-tertiary text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Display */}
        {status && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-green" />
                <span className="text-sm text-text-secondary">Firebase Status</span>
                <Badge 
                  variant={status.firebaseStatus === 'connected' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {status.firebaseStatus}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-amber" />
                <span className="text-sm text-text-secondary">Peak Time</span>
                <Badge 
                  variant={status.isPeakTime ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {status.isPeakTime ? 'Active' : 'Off-Peak'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-text-secondary">
                Next Scrape: <span className="text-text-primary">{status.nextScrape}</span>
              </div>
              <div className="text-sm text-text-secondary">
                Sources: <span className="text-text-primary">{status.sources.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Sources */}
        {status && status.sources && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Active Sources</h4>
            <div className="flex flex-wrap gap-2">
              {status.sources.map((source) => (
                <Badge 
                  key={source}
                  variant="secondary"
                  className="text-xs bg-dark-tertiary text-text-secondary"
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Firebase Collections */}
        {status && status.collections && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Firebase Collections</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {status.collections.map((collection) => (
                <div 
                  key={collection}
                  className="p-2 bg-dark-tertiary rounded text-text-secondary text-center"
                >
                  {collection.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={triggerScraping}
            disabled={isLoading}
            className="flex-1 bg-accent-green hover:bg-accent-green/80 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Trigger Scrape
              </>
            )}
          </Button>
        </div>

        {/* Last Results */}
        {lastResults && (
          <div className="space-y-3 p-4 bg-dark-tertiary rounded-lg">
            <h4 className="text-sm font-medium text-text-primary">Last Scrape Results</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Props Collected:</span>
                <span className="text-accent-green font-medium">{lastResults.propsScraped}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Sentiment Points:</span>
                <span className="text-accent-blue font-medium">{lastResults.sentimentPoints}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Line Movements:</span>
                <span className="text-accent-amber font-medium">{lastResults.lineMovements}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">AI Alerts:</span>
                <span className="text-accent-red font-medium">{lastResults.aiAlerts}</span>
              </div>
            </div>
            
            <div className="text-xs text-text-secondary">
              Completed: {new Date(lastResults.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}