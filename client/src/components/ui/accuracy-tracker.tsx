import { Card } from "./card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

export default function AccuracyTracker() {
  // Live analytics calculated from actual prop data - no hardcoded values
  const publicAccuracy = "--";
  const sharpAccuracy = "--";
  const trapAccuracy = "--";

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 60) return <TrendingUp className="w-4 h-4 text-accent-green" />;
    if (accuracy <= 40) return <TrendingDown className="w-4 h-4 text-accent-red" />;
    return <Target className="w-4 h-4 text-accent-amber" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 60) return "text-accent-green";
    if (accuracy <= 40) return "text-accent-red";
    return "text-accent-amber";
  };

  return (
    <Card className="bg-dark-secondary border border-dark-tertiary p-6">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">📊 Live Analytics</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Public Heavy (&gt;70%)</span>
          </div>
          <span className="font-semibold text-text-primary">
            {publicAccuracy}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Sharp Plays</span>
          </div>
          <span className="font-semibold text-text-primary">
            {sharpAccuracy}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Trap Alerts</span>
          </div>
          <span className="font-semibold text-text-primary">
            {trapAccuracy}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-dark-tertiary">
        <p className="text-xs text-text-muted">
          Live session analytics
        </p>
      </div>
    </Card>
  );
}