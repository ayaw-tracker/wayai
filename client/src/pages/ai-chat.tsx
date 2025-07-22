import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataStatusBanner } from "@/components/ui/data-status-banner";
import { Bot, User, MessageSquare, RefreshCw, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export default function AIChat() {
  const [currentQuery, setCurrentQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string>("main");
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "main",
      title: "General Betting Analysis",
      lastMessage: "What props look risky today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      messageCount: 3
    },
    {
      id: "mahomes",
      title: "Mahomes Props Discussion", 
      lastMessage: "His TD props in windy weather",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 7
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "I'm your AI betting analyst. I can help you analyze props, identify public traps, spot sharp money moves, and provide insights on today's betting opportunities. What would you like to know?",
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: "2", 
      role: "user",
      content: "What props look risky today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: "3",
      role: "assistant", 
      content: "I see several concerning props today:\n\n🚨 **Mahomes O2.5 Passing TDs** - 78% public backing but he's historically struggled in windy conditions (weather forecast shows 15+ mph winds)\n\n⚠️ **McCaffrey Anytime TD** - 89% public on this, but red zone touches have been limited recently and the opposing defense ranks #3 against RB TDs\n\n📊 **Key insight**: When public backing exceeds 75% on player props, the hit rate drops to just 42% historically. Consider fading these heavily bet props.",
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    }
  ]);



  const aiQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest(`/api/ai-query`, {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (response: any) => {
      const newUserMessage: ChatMessage = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: currentQuery,
        timestamp: new Date()
      };
      
      const newAssistantMessage: ChatMessage = {
        id: Date.now().toString() + "-assistant", 
        role: "assistant",
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);
      setCurrentQuery("");
      
      // Update conversation
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, lastMessage: currentQuery, timestamp: new Date(), messageCount: conv.messageCount + 2 }
          : conv
      ));
    },
    onError: (error) => {
      console.error("AI query failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim() || aiQueryMutation.isPending) return;
    aiQueryMutation.mutate(currentQuery);
  };

  const startNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([{
      id: "welcome",
      role: "assistant", 
      content: "Starting a new conversation. What betting analysis can I help you with?",
      timestamp: new Date()
    }]);
  };

  const switchConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // In a real app, this would load messages for that conversation
    if (conversationId === "main") {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "I'm your AI betting analyst. I can help you analyze props, identify public traps, spot sharp money moves, and provide insights on today's betting opportunities. What would you like to know?",
          timestamp: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: "2", 
          role: "user",
          content: "What props look risky today?",
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: "3",
          role: "assistant", 
          content: "I see several concerning props today:\n\n🚨 **Mahomes O2.5 Passing TDs** - 78% public backing but he's historically struggled in windy conditions (weather forecast shows 15+ mph winds)\n\n⚠️ **McCaffrey Anytime TD** - 89% public on this, but red zone touches have been limited recently and the opposing defense ranks #3 against RB TDs\n\n📊 **Key insight**: When public backing exceeds 75% on player props, the hit rate drops to just 42% historically. Consider fading these heavily bet props.",
          timestamp: new Date(Date.now() - 2 * 60 * 1000)
        }
      ]);
    } else {
      setMessages([
        {
          id: "mahomes-1",
          role: "user",
          content: "Tell me about Mahomes props in windy weather",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: "mahomes-2",
          role: "assistant",
          content: "Mahomes in windy conditions (15+ mph) shows significant statistical drops:\n\n📉 **Passing TDs**: 2.8 avg vs 3.4 avg in normal conditions\n📉 **Passing Yards**: 267 avg vs 298 avg normally\n📉 **Completions**: 68% vs 71% completion rate\n\nWhen wind exceeds 20 mph, his props hit at just 31% rate. Today's forecast shows consistent 18 mph winds - borderline concern territory.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <DataStatusBanner />
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-text-primary mb-2">AI Chat</h1>
            <p className="text-text-secondary">Persistent conversations with your AI betting analyst</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Conversation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-text-primary text-lg">Conversations</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={startNewConversation}
                      className="bg-accent-green hover:bg-green-600 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => switchConversation(conv.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeConversationId === conv.id
                          ? 'bg-accent-green/20 border border-accent-green/30'
                          : 'bg-dark hover:bg-dark-tertiary border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-3 w-3 text-accent-green" />
                        <span className="text-sm font-medium text-text-primary truncate">
                          {conv.title}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {conv.messageCount} msgs
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-dark-secondary border-dark-tertiary h-[600px] flex flex-col">
                <CardHeader className="pb-3 border-b border-dark-tertiary">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-text-primary">
                      {conversations.find(c => c.id === activeConversationId)?.title || "AI Chat"}
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-accent-green text-white' 
                            : 'bg-dark border border-dark-tertiary text-text-primary'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                        <div className={`text-xs text-text-muted mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <div className="flex-shrink-0 order-2">
                          <div className="w-8 h-8 bg-dark-tertiary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-text-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {aiQueryMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-dark border border-dark-tertiary p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-text-secondary">AI is analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Input Form */}
                <div className="border-t border-dark-tertiary p-4">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <Input
                      value={currentQuery}
                      onChange={(e) => setCurrentQuery(e.target.value)}
                      placeholder="Ask about props, trends, or betting strategies..."
                      className="flex-1 bg-dark border-dark-tertiary text-text-primary placeholder-text-muted"
                      disabled={aiQueryMutation.isPending}
                    />
                    <Button 
                      type="submit"
                      disabled={aiQueryMutation.isPending || !currentQuery.trim()}
                      className="bg-accent-green hover:bg-green-600 text-white px-6"
                    >
                      {aiQueryMutation.isPending ? "..." : "Send"}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}