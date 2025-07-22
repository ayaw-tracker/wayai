import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./button";
import { Input } from "./input";
import { Card } from "./card";
import { Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PromptBox() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const aiQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/ai/query", { query });
      return await res.json();
    },
    onSuccess: (data) => {
      setResponse(data.response);
      setQuery("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    aiQueryMutation.mutate(query);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">AI Analysis</h3>
      <Card className="bg-dark border border-dark-tertiary p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Bot className="w-4 h-4 text-accent-green" />
          <span className="text-sm text-text-secondary">Ask about today's props</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What's the riskiest over today?"
            className="w-full bg-dark-tertiary border border-dark-tertiary text-text-primary placeholder-text-muted mb-3"
            disabled={aiQueryMutation.isPending}
          />
          <Button 
            type="submit"
            className="w-full bg-accent-green hover:bg-green-600 text-white"
            disabled={aiQueryMutation.isPending || !query.trim()}
          >
            {aiQueryMutation.isPending ? "Analyzing..." : "Analyze Trends"}
          </Button>
        </form>

        {response && (
          <div className="mt-4 p-3 bg-dark-tertiary rounded-lg">
            <div className="flex items-start space-x-2">
              <Bot className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
              <p className="text-sm text-text-primary leading-relaxed">{response}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
