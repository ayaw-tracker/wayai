import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingDown } from "lucide-react";

interface EmptyStateProps {
  sport: string;
  context?: {
    isInSeason: boolean;
    seasonPhase: string;
    contextMessage: string;
  };
}

export function EmptyState({ sport, context }: EmptyStateProps) {
  if (!context) {
    return (
      <Card className="bg-gray-900 border-gray-700 p-8 text-center">
        <div className="space-y-4">
          <TrendingDown className="h-12 w-12 text-gray-500 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-300">No {sport} Props Available</h3>
            <p className="text-gray-400 text-sm mt-2">
              Live data sources are not providing {sport} props at this time
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700 p-8 text-center">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-blue-400" />
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {context.seasonPhase}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-300">
            {sport} {context.seasonPhase === 'offseason' ? 'Offseason' : 'Season Info'}
          </h3>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            {context.contextMessage}
          </p>
        </div>

        {context.seasonPhase === 'offseason' && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
            <Clock className="h-3 w-3" />
            Authentic data only - no synthetic props during offseason
          </div>
        )}
      </div>
    </Card>
  );
}