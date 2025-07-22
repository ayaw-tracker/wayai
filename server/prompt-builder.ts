// Smart Prompt Builder for WAY AI - Creates context-aware prompts for betting analysis
import type { Prop, AiInsight } from '../shared/schema';

export interface PromptContext {
  props: Prop[];
  insights: AiInsight[];
  userQuery: string;
}

export interface PromptConfig {
  maxTokens: number;
  temperature: number;
  includeRiskLevel: boolean;
  includeFormatting: boolean;
}

export enum QueryCategory {
  TRAP_DETECTION = 'trap_detection',
  SHARP_MONEY = 'sharp_money',
  LINE_MOVEMENT = 'line_movement',
  WEATHER_IMPACT = 'weather_impact',
  GENERAL_ANALYSIS = 'general_analysis',
  FADE_RECOMMENDATIONS = 'fade_recommendations'
}

export class PromptBuilder {
  private detectQueryCategory(query: string): QueryCategory {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('trap') || lowerQuery.includes('public') || lowerQuery.includes('crowd')) {
      return QueryCategory.TRAP_DETECTION;
    }
    
    if (lowerQuery.includes('sharp') || lowerQuery.includes('professional') || lowerQuery.includes('smart money')) {
      return QueryCategory.SHARP_MONEY;
    }
    
    if (lowerQuery.includes('line') || lowerQuery.includes('movement') || lowerQuery.includes('move')) {
      return QueryCategory.LINE_MOVEMENT;
    }
    
    if (lowerQuery.includes('weather') || lowerQuery.includes('wind') || lowerQuery.includes('rain')) {
      return QueryCategory.WEATHER_IMPACT;
    }
    
    if (lowerQuery.includes('fade') || lowerQuery.includes('avoid') || lowerQuery.includes('stay away')) {
      return QueryCategory.FADE_RECOMMENDATIONS;
    }
    
    return QueryCategory.GENERAL_ANALYSIS;
  }

  private buildSystemPrompt(category: QueryCategory): string {
    const baseRole = "You are WAY - an elite prop betting analyst with 15+ years of experience identifying where public money goes wrong. You work for a sharp betting syndicate and your job is to find edges by analyzing betting patterns, line movements, and market inefficiencies.";
    
    const categorySpecificInstructions = {
      [QueryCategory.TRAP_DETECTION]: "Focus on identifying props where high public backing doesn't align with actual value. Look for weather factors, matchup concerns, or recent form that the public is overlooking.",
      
      [QueryCategory.SHARP_MONEY]: "Analyze betting percentages vs money percentages to identify where professional bettors are placing action. Sharp money often moves lines despite low public backing.",
      
      [QueryCategory.LINE_MOVEMENT]: "Examine how lines have moved and what that indicates about where the smart money is flowing. Reverse line movement (line moves against public betting) is a key indicator.",
      
      [QueryCategory.WEATHER_IMPACT]: "Assess how weather conditions affect specific prop types. Wind impacts passing games, rain affects ball security, cold affects kicking accuracy.",
      
      [QueryCategory.FADE_RECOMMENDATIONS]: "Identify the strongest fade opportunities where public sentiment is clearly wrong. Prioritize props with highest public backing but concerning underlying factors.",
      
      [QueryCategory.GENERAL_ANALYSIS]: "Provide comprehensive analysis of current betting patterns, highlighting the most significant edges and opportunities in today's slate."
    };

    return `${baseRole}

${categorySpecificInstructions[category]}

RESPONSE FORMAT:
- Start with a confidence level (🔴 High Risk, 🟡 Medium Risk, 🟢 Low Risk)
- Use specific percentages and data points
- Provide 1-2 actionable recommendations
- Keep responses under 150 words
- Be direct and decisive - no hedging language`;
  }

  private buildDataContext(context: PromptContext): string {
    const { props, insights } = context;
    
    // Build props context with key metrics
    const propsContext = props
      .slice(0, 5) // Focus on top 5 props to avoid token limits
      .map(p => {
        const publicMoney = Math.abs(p.publicPercentage - p.moneyPercentage);
        const sentiment = p.sentiment;
        return `${p.playerName} ${p.propType} O/U ${p.line}: ${p.publicPercentage}% public, ${p.moneyPercentage}% money (${publicMoney}% gap), sentiment: ${sentiment}`;
      })
      .join('\n');

    // Build insights context
    const insightsContext = insights
      .slice(0, 3)
      .map(i => `• ${i.title}: ${i.description}`)
      .join('\n');

    return `CURRENT MARKET DATA:
${propsContext}

RECENT ALERTS:
${insightsContext}`;
  }

  public buildPrompt(context: PromptContext, config: PromptConfig = {
    maxTokens: 150,
    temperature: 0.7,
    includeRiskLevel: true,
    includeFormatting: true
  }): { systemPrompt: string; userPrompt: string; config: PromptConfig } {
    
    const category = this.detectQueryCategory(context.userQuery);
    const systemPrompt = this.buildSystemPrompt(category);
    const dataContext = this.buildDataContext(context);
    
    const userPrompt = `${dataContext}

ANALYSIS REQUEST: ${context.userQuery}

Provide your expert analysis with specific recommendations based on the data above.`;

    return {
      systemPrompt,
      userPrompt,
      config
    };
  }

  public getQueryCategory(query: string): QueryCategory {
    return this.detectQueryCategory(query);
  }
}

export const promptBuilder = new PromptBuilder();