// Data Status Banner - Shows when using fallback data
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMockFallback } from "@/hooks/use-mock-fallback";

export function DataStatusBanner() {
  const { isUsingMock, reason, lastChecked } = useMockFallback();

  // Don't show banner in development or when using live data
  if (!isUsingMock || reason === 'development') {
    return null;
  }

  const getStatusInfo = () => {
    switch (reason) {
      case 'api_failure':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          title: "Using Demo Data",
          message: "Live data temporarily unavailable. Showing demonstration data.",
          variant: "default" as const
        };
      case 'rate_limit':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Rate Limit Reached",
          message: "API quota exceeded. Showing demonstration data until reset.",
          variant: "destructive" as const
        };
      default:
        return {
          icon: <Wifi className="h-4 w-4" />,
          title: "Demo Mode",
          message: "Currently showing demonstration data.",
          variant: "default" as const
        };
    }
  };

  const { icon, title, message, variant } = getStatusInfo();
  const timeString = lastChecked ? lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <Alert variant={variant} className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="font-medium text-sm">{title}</div>
            <AlertDescription className="text-xs">{message}</AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Demo Data
          </Badge>
          {timeString && (
            <span className="text-xs text-muted-foreground">
              {timeString}
            </span>
          )}
        </div>
      </div>
    </Alert>
  );
}