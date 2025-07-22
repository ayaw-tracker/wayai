// Smart mock data fallback hook - handles development mode and live data failures
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MockFallbackState {
  isUsingMock: boolean;
  reason: 'development' | 'api_failure' | 'rate_limit' | null;
  lastChecked: Date | null;
  environment: string;
}

export function useMockFallback() {
  const [state, setState] = useState<MockFallbackState>({
    isUsingMock: false,
    reason: null,
    lastChecked: null,
    environment: 'development'
  });
  const { toast } = useToast();

  const checkLiveDataAvailability = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/data-source');
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.current === 'live' && data.status === 'available';
    } catch {
      return false;
    }
  };

  const shouldUseMockData = async (): Promise<{ useMock: boolean; reason: MockFallbackState['reason'] }> => {
    // Always use mock in development
    if (import.meta.env.DEV) {
      return { useMock: true, reason: 'development' };
    }

    // Check if live data is available
    const isLiveAvailable = await checkLiveDataAvailability();
    if (!isLiveAvailable) {
      return { useMock: true, reason: 'api_failure' };
    }

    return { useMock: false, reason: null };
  };

  useEffect(() => {
    const checkStatus = async () => {
      const { useMock, reason } = await shouldUseMockData();
      
      setState(prev => {
        const newState = {
          isUsingMock: useMock,
          reason,
          lastChecked: new Date(),
          environment: import.meta.env.DEV ? 'development' : 'production'
        };

        // Show toast notification if switching to mock due to failure
        if (useMock && reason === 'api_failure' && !prev.isUsingMock) {
          toast({
            title: "Using Demo Data",
            description: "Live data temporarily unavailable. Showing demo data.",
            variant: "default",
          });
        }

        // Show toast when live data is restored
        if (!useMock && prev.isUsingMock && prev.reason === 'api_failure') {
          toast({
            title: "Live Data Restored",
            description: "Connected to live betting data sources.",
            variant: "default",
          });
        }

        return newState;
      });
    };

    checkStatus();
    
    // Check status every 30 seconds in production
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  return state;
}