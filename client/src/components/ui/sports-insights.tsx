import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Info, TrendingUp } from "lucide-react";

interface SportSeasonInfo {
  sport: string;
  isInSeason: boolean;
  seasonPhase: 'preseason' | 'regular' | 'playoffs' | 'offseason';
  nextGameDate?: string;
  contextMessage: string;
}

interface SportsInsightsProps {
  sport?: string;
  showOnEmpty?: boolean;
}

export function SportsInsights({ sport, showOnEmpty = false }: SportsInsightsProps) {
  const { data: insights } = useQuery({
    queryKey: ["/api/sports-insights", sport].filter(Boolean),
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000 // 4 minutes
  });

  const { data: props } = useQuery({
    queryKey: ["/api/props", ...(sport ? [{ sport }] : [])],
    select: (data: any[]) => data?.length || 0
  });

  // Only show when there are no props and showOnEmpty is true, or when explicitly requested
  if (!showOnEmpty && (props || 0) > 0) return null;
  if (!insights) return null;

  const renderSeasonInfo = (seasonInfo: SportSeasonInfo) => {
    const getSeasonColor = (phase: string, inSeason: boolean) => {
      if (!inSeason) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      if (phase === 'playoffs') return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      if (phase === 'regular') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    };

    return (
      <Alert key={seasonInfo.sport} className="bg-dark-secondary border-dark-tertiary">
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-text-primary">{seasonInfo.sport}</span>
            <Badge variant="secondary" className={getSeasonColor(seasonInfo.seasonPhase, seasonInfo.isInSeason)}>
              {seasonInfo.isInSeason ? seasonInfo.seasonPhase : 'offseason'}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">{seasonInfo.contextMessage}</p>
        </AlertDescription>
      </Alert>
    );
  };

  // Single sport view
  if (sport && (insights as any)?.sport) {
    return renderSeasonInfo(insights as SportSeasonInfo);
  }

  // Multi-sport overview
  if ((insights as any)?.leagues) {
    const { overview, leagues } = insights as any;
    
    return (
      <div className="space-y-4">
        <Alert className="bg-dark-secondary border-dark-tertiary">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-text-primary">Sports Calendar Overview</span>
            </div>
            <p className="text-sm text-text-muted">{overview}</p>
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-3">
          {renderSeasonInfo(leagues.nfl)}
          {renderSeasonInfo(leagues.nba)}
          {renderSeasonInfo(leagues.mlb)}
        </div>
      </div>
    );
  }

  return null;
}

export function EmptyPropsMessage({ sport }: { sport: string }) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No {sport} Props Available
        </h3>
        <p className="text-text-muted mb-6">
          This could be due to the current sports calendar or scheduled breaks.
        </p>
        <SportsInsights sport={sport} showOnEmpty={true} />
      </div>
    </div>
  );
}