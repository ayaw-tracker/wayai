// AI service utilities for handling AI responses and processing

export interface AIQueryRequest {
  query: string;
}

export interface AIQueryResponse {
  response: string;
  id: number;
}

export const generateMockResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("risk") || lowerQuery.includes("trap")) {
    return "Based on current data, Mahomes O2.5 passing TDs looks like the biggest public trap. 76% backing but weather conditions and defensive matchup suggest caution. Consider the under or fade this line.";
  }
  
  if (lowerQuery.includes("fade") || lowerQuery.includes("avoid")) {
    return "Top fade recommendation is CMC anytime TD - 89% public backing but weather reports show potential for heavy rain affecting red zone efficiency. Sharp money notably absent.";
  }
  
  if (lowerQuery.includes("sharp") || lowerQuery.includes("winning")) {
    return "Sharp money is heavily on Tyreek Hill receiving yards under. Only 31% public backing but line moved down 2.5 points, indicating professional action on the under.";
  }
  
  if (lowerQuery.includes("weather") || lowerQuery.includes("condition")) {
    return "Weather is a major factor today. Buffalo-NYJ expecting 15+ mph winds, which historically reduces QB rushing yards by 18%. Public hasn't adjusted their Allen rushing prop expectations.";
  }
  
  return "I'm analyzing current prop betting patterns. The most notable trend is the disconnect between public sentiment and sharp money on player props. Focus on line movement despite low public backing - that's where the value typically lies.";
};

export const commonQueries = [
  "What's the riskiest over today?",
  "Which top prop lost yesterday?",
  "Who is everyone fading?",
  "What props have the most sharp money?",
  "Which weather games should I avoid?",
  "Show me the biggest public traps",
];
