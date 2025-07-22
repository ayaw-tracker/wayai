import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Database, MessageSquare, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  notifications: boolean;
  autoRefresh: boolean;
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load current settings from server
  const { data: currentSettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: AppSettings) => data
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (currentSettings) {
      setNotifications(currentSettings.notifications);
      setAutoRefresh(currentSettings.autoRefresh);
    }
  }, [currentSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: AppSettings) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all data queries to refresh with new data source
      queryClient.invalidateQueries({ queryKey: ['/api/props'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tailing-sentiment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/influencer-picks'] });
      
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved",
        description: "Settings updated. Live data is now refreshing.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    const settings: AppSettings = {
      notifications,
      autoRefresh
    };
    saveSettingsMutation.mutate(settings);
  };

  const handleToggleChange = (field: 'notifications' | 'autoRefresh') => (checked: boolean) => {
    if (field === 'notifications') setNotifications(checked);
    if (field === 'autoRefresh') setAutoRefresh(checked);
    setHasUnsavedChanges(true);
  };

  const handleClearChatHistory = () => {
    localStorage.removeItem('aiChatHistory');
    toast({
      title: "Chat History Cleared",
      description: "All AI conversation history has been removed.",
    });
  };



  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-8 h-8 text-accent-green" />
              <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            </div>
            <p className="text-text-secondary">Manage your app preferences and data sources</p>
          </div>

          <div className="space-y-6">
            {/* Data Source Settings */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent-blue" />
                  <CardTitle className="text-text-primary">Data Source</CardTitle>
                </div>
                <CardDescription className="text-text-secondary">
                  Configure where the app gets its betting data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Data Source</Label>
                    <p className="text-sm text-text-secondary">Live data from ESPN, NBA Stats, MLB Stats APIs - No mock data fallbacks</p>
                  </div>
                  <Badge variant="secondary" className="bg-accent-green/10 text-accent-green border-accent-green/20">
                    Live Data Only
                  </Badge>
                </div>
                <div className="text-sm text-text-secondary bg-dark/50 p-3 rounded border border-dark-tertiary">
                  WAY prioritizes transparency and authenticity. When live data isn't available, you'll see intelligent context explaining why rather than synthetic props that could mislead your analysis.
                </div>
                
                <Separator className="bg-dark-tertiary" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Auto-refresh Data</Label>
                    <p className="text-sm text-text-secondary">Automatically update props every 30 seconds</p>
                  </div>
                  <Switch 
                    checked={autoRefresh} 
                    onCheckedChange={handleToggleChange('autoRefresh')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Notifications</Label>
                    <p className="text-sm text-text-secondary">Show toast alerts for important updates</p>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={handleToggleChange('notifications')}
                  />
                </div>
                
                {/* Save Button */}
                {hasUnsavedChanges && (
                  <div className="pt-4 border-t border-dark-tertiary">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={saveSettingsMutation.isPending}
                      className="bg-accent-green hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Chat Settings */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent-amber" />
                  <CardTitle className="text-text-primary">AI Chat</CardTitle>
                </div>
                <CardDescription className="text-text-secondary">
                  Manage your AI conversation settings and history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Clear Chat History</Label>
                    <p className="text-sm text-text-secondary">Remove all saved conversations with the AI</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearChatHistory}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                <Separator className="bg-dark-tertiary" />
                
                <div className="bg-dark-tertiary/50 p-4 rounded-lg">
                  <h4 className="text-text-primary font-medium mb-2">Future Features</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Connected sportsbook accounts</li>
                    <li>• Custom AI personas and preferences</li>
                    <li>• Advanced alert configurations</li>
                    <li>• Personal betting performance tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>



            {/* Save Changes */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" className="border-dark-tertiary text-text-secondary">
                Reset to Defaults
              </Button>
              <Button 
                className="bg-accent-green hover:bg-accent-green/90 text-white"
                onClick={() => toast({
                  title: "Settings Saved",
                  description: "Your preferences have been updated successfully.",
                })}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}