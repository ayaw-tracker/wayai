// WAY Social Sentiment Scraper
// Monitors Reddit, Twitter, and betting community sentiment
// Tracks public tailing patterns and sharp money indicators

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, COLLECTIONS } from './firebase-config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface SentimentData {
  source: 'Reddit' | 'Twitter' | 'BettingForum';
  platform: string;
  content: string;
  author: string;
  player?: string;
  propType?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  engagement: number; // upvotes, likes, etc.
  timestamp: Date;
  confidence: number; // 0-100 AI confidence in sentiment
  tags: string[];
}

export interface TailingAlert {
  player: string;
  propType: string;
  tailingPercentage: number;
  publicSentiment: 'hot' | 'cold' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  sources: string[];
  timestamp: Date;
}

export class SentimentScraper {
  private redditHeaders = {
    'User-Agent': 'WAY-PropAnalyzer/1.0'
  };

  // Key betting communities to monitor
  private targetSubreddits = [
    'sportsbook',
    'sportsbetting', 
    'dfsports',
    'nfl',
    'nba',
    'baseball',
    'fantasyfootball'
  ];

  // Key Twitter accounts for sharp money tracking
  private sharpMoneyAccounts = [
    'ActionNetworkHQ',
    'BettingPros',
    'VSiNLive',
    'OddsChecker',
    'TheGameDayBets'
  ];

  // Scrape Reddit for betting sentiment
  async scrapeRedditSentiment(): Promise<SentimentData[]> {
    console.log('🔍 Scraping Reddit for betting sentiment...');
    
    const sentimentData: SentimentData[] = [];

    try {
      for (const subreddit of this.targetSubreddits) {
        await this.delay(1000); // Rate limiting
        
        const response = await axios.get(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
          { headers: this.redditHeaders, timeout: 10000 }
        );

        const posts = response.data?.data?.children || [];
        
        for (const post of posts) {
          const postData = post.data;
          
          // Filter for betting-related content
          if (this.isBettingRelated(postData.title + ' ' + postData.selftext)) {
            const sentiment = this.analyzeSentiment(postData.title + ' ' + postData.selftext);
            const playerMentions = this.extractPlayerMentions(postData.title + ' ' + postData.selftext);
            
            sentimentData.push({
              source: 'Reddit',
              platform: `r/${subreddit}`,
              content: postData.title,
              author: postData.author,
              player: playerMentions[0], // Primary player mentioned
              sentiment: sentiment.sentiment,
              engagement: postData.score + postData.num_comments,
              timestamp: new Date(postData.created_utc * 1000),
              confidence: sentiment.confidence,
              tags: this.extractBettingTags(postData.title + ' ' + postData.selftext)
            });
          }
        }
      }

      // Store sentiment data in Firebase
      await this.storeSentimentData(sentimentData);
      console.log(`✅ Scraped ${sentimentData.length} sentiment data points from Reddit`);
      
      return sentimentData;

    } catch (error) {
      console.error('❌ Reddit sentiment scraping failed:', error);
      return [];
    }
  }

  // Scrape Twitter/X for sharp money indicators
  async scrapeTwitterSentiment(): Promise<SentimentData[]> {
    console.log('🐦 Scraping Twitter for sharp money sentiment...');
    
    // Note: This would require Twitter API v2 access
    // For now, implementing a placeholder structure
    const sentimentData: SentimentData[] = [];

    try {
      // Placeholder for Twitter API integration
      // Would need TWITTER_BEARER_TOKEN environment variable
      
      console.log('⏳ Twitter scraping requires API access - implementing placeholder');
      
      // Mock sharp money indicators for development
      const mockSharpData: SentimentData[] = [
        {
          source: 'Twitter',
          platform: '@ActionNetworkHQ',
          content: 'Sharp money hitting the under on Mahomes passing yards',
          author: 'ActionNetworkHQ',
          player: 'Patrick Mahomes',
          propType: 'Passing Yards',
          sentiment: 'bearish',
          engagement: 150,
          timestamp: new Date(),
          confidence: 85,
          tags: ['sharp-money', 'reverse-line-movement', 'under']
        }
      ];

      await this.storeSentimentData(mockSharpData);
      return mockSharpData;

    } catch (error) {
      console.error('❌ Twitter sentiment scraping failed:', error);
      return [];
    }
  }

  // Analyze betting forum content for tailing patterns
  async analyzeTailingPatterns(): Promise<TailingAlert[]> {
    console.log('📊 Analyzing tailing patterns...');
    
    const tailingAlerts: TailingAlert[] = [];

    try {
      // Query recent sentiment data from Firebase
      const sentimentRef = collection(db, 'sentiment_data');
      // Implementation would query last 24 hours of sentiment data
      
      // Group by player/prop type and calculate tailing percentage
      const playerProps = new Map<string, SentimentData[]>();
      
      // Mock analysis for demonstration
      const mockAlert: TailingAlert = {
        player: 'Jayson Tatum',
        propType: 'Points',
        tailingPercentage: 78,
        publicSentiment: 'hot',
        riskLevel: 'high',
        sources: ['r/sportsbook', 'r/nba', '@BettingPros'],
        timestamp: new Date()
      };

      tailingAlerts.push(mockAlert);

      // Store tailing alerts
      await this.storeTailingAlerts(tailingAlerts);
      console.log(`✅ Generated ${tailingAlerts.length} tailing alerts`);
      
      return tailingAlerts;

    } catch (error) {
      console.error('❌ Tailing pattern analysis failed:', error);
      return [];
    }
  }

  // Smart sentiment analysis using keyword patterns
  private analyzeSentiment(text: string): { sentiment: 'bullish' | 'bearish' | 'neutral', confidence: number } {
    const bullishKeywords = ['lock', 'easy', 'smash', 'bet', 'confident', 'love', 'free money'];
    const bearishKeywords = ['fade', 'avoid', 'trap', 'stay away', 'risky', 'skip'];
    
    const lowerText = text.toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;
    
    bullishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) bullishScore++;
    });
    
    bearishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) bearishScore++;
    });
    
    if (bullishScore > bearishScore) {
      return { sentiment: 'bullish', confidence: Math.min(bullishScore * 20, 90) };
    } else if (bearishScore > bullishScore) {
      return { sentiment: 'bearish', confidence: Math.min(bearishScore * 20, 90) };
    } else {
      return { sentiment: 'neutral', confidence: 50 };
    }
  }

  // Check if content is betting-related
  private isBettingRelated(text: string): boolean {
    const bettingKeywords = [
      'bet', 'prop', 'line', 'odds', 'over', 'under', 'points', 'yards',
      'assists', 'rebounds', 'strikeouts', 'sportsbook', 'parlay', 'pick'
    ];
    
    const lowerText = text.toLowerCase();
    return bettingKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Extract player names from text
  private extractPlayerMentions(text: string): string[] {
    // Simple regex for common name patterns
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const matches = text.match(namePattern) || [];
    
    // Filter out common false positives
    const excluded = ['New York', 'Los Angeles', 'Las Vegas', 'New England'];
    return matches.filter(name => !excluded.includes(name));
  }

  // Extract betting-related tags
  private extractBettingTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('over')) tags.push('over');
    if (lowerText.includes('under')) tags.push('under');
    if (lowerText.includes('parlay')) tags.push('parlay');
    if (lowerText.includes('lock')) tags.push('lock');
    if (lowerText.includes('fade')) tags.push('fade');
    if (lowerText.includes('sharp')) tags.push('sharp-money');
    
    return tags;
  }

  // Store sentiment data in Firebase
  private async storeSentimentData(data: SentimentData[]): Promise<void> {
    try {
      const batch = data.map(async (sentiment) => {
        const sentimentRef = collection(db, 'sentiment_data');
        return addDoc(sentimentRef, {
          ...sentiment,
          timestamp: Timestamp.fromDate(sentiment.timestamp)
        });
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('❌ Failed to store sentiment data:', error);
    }
  }

  // Store tailing alerts in Firebase
  private async storeTailingAlerts(alerts: TailingAlert[]): Promise<void> {
    try {
      const batch = alerts.map(async (alert) => {
        const alertsRef = collection(db, 'tailing_alerts');
        return addDoc(alertsRef, {
          ...alert,
          timestamp: Timestamp.fromDate(alert.timestamp)
        });
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('❌ Failed to store tailing alerts:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const sentimentScraper = new SentimentScraper();