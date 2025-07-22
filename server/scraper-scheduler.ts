// WAY Scraper Scheduler - Automated Data Collection
// Orchestrates prop line scraping and sentiment analysis
// Handles scheduling, rate limiting, and Firebase storage coordination

import { propLineScraper } from './prop-line-scraper';
import { sentimentScraper } from './sentiment-scraper';
import { db, COLLECTIONS } from './firebase-config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface ScrapingSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  propsScraped: number;
  sentimentPointsCollected: number;
  sources: string[];
  status: 'running' | 'completed' | 'failed';
  errors?: string[];
}

export class ScraperScheduler {
  private isRunning = false;
  private currentSession: ScrapingSession | null = null;
  
  // Scheduling intervals (in minutes)
  private readonly PEAK_INTERVAL = 3;      // Game days: every 3 minutes
  private readonly OFF_PEAK_INTERVAL = 15; // Off-peak: every 15 minutes
  private readonly SENTIMENT_INTERVAL = 10; // Sentiment: every 10 minutes

  private schedulers: NodeJS.Timeout[] = [];

  constructor() {
    this.initializeSchedulers();
  }

  // Initialize automated scraping schedules
  private initializeSchedulers(): void {
    console.log('🕐 Initializing WAY scraper schedulers...');
    
    // Main prop scraping - dynamic frequency
    const propInterval = this.isPeakTime() ? this.PEAK_INTERVAL : this.OFF_PEAK_INTERVAL;
    const propScheduler = setInterval(() => {
      this.runPropScraping();
    }, propInterval * 60 * 1000);

    // Sentiment analysis - consistent frequency  
    const sentimentScheduler = setInterval(() => {
      this.runSentimentAnalysis();
    }, this.SENTIMENT_INTERVAL * 60 * 1000);

    this.schedulers.push(propScheduler, sentimentScheduler);
    
    console.log(`✅ Schedulers active - Props: ${propInterval}min, Sentiment: ${this.SENTIMENT_INTERVAL}min`);
  }

  // Determine if current time is peak betting hours
  private isPeakTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Peak times: Game days (Thu-Mon) between 1 PM - 11 PM ET
    const isGameDay = day >= 4 || day <= 1; // Thursday (4) through Monday (1)
    const isPeakHour = hour >= 13 && hour <= 23; // 1 PM - 11 PM
    
    return isGameDay && isPeakHour;
  }

  // Run comprehensive prop line scraping
  async runPropScraping(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Scraping session already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const sessionId = `prop-session-${Date.now()}`;
    
    this.currentSession = {
      sessionId,
      startTime: new Date(),
      propsScraped: 0,
      sentimentPointsCollected: 0,
      sources: [],
      status: 'running'
    };

    console.log(`🚀 Starting prop scraping session: ${sessionId}`);

    try {
      // Scrape all prop sources
      const allProps = await propLineScraper.scrapeAllSources();
      
      this.currentSession.propsScraped = allProps.length;
      this.currentSession.sources = [...new Set(allProps.map(p => p.source))];
      this.currentSession.status = 'completed';
      this.currentSession.endTime = new Date();

      // Log session results
      await this.logScrapingSession(this.currentSession);
      
      console.log(`✅ Prop scraping completed: ${allProps.length} props from ${this.currentSession.sources.length} sources`);

    } catch (error) {
      console.error('❌ Prop scraping session failed:', error);
      
      if (this.currentSession) {
        this.currentSession.status = 'failed';
        this.currentSession.errors = [error instanceof Error ? error.message : 'Unknown error'];
        this.currentSession.endTime = new Date();
        
        await this.logScrapingSession(this.currentSession);
      }
    } finally {
      this.isRunning = false;
      this.currentSession = null;
    }
  }

  // Run sentiment analysis and tailing detection
  async runSentimentAnalysis(): Promise<void> {
    const sessionId = `sentiment-session-${Date.now()}`;
    
    console.log(`🔍 Starting sentiment analysis: ${sessionId}`);

    try {
      // Scrape Reddit sentiment
      const redditSentiment = await sentimentScraper.scrapeRedditSentiment();
      
      // Scrape Twitter sentiment (if API available)
      const twitterSentiment = await sentimentScraper.scrapeTwitterSentiment();
      
      // Analyze tailing patterns
      const tailingAlerts = await sentimentScraper.analyzeTailingPatterns();
      
      const totalPoints = redditSentiment.length + twitterSentiment.length;
      
      console.log(`✅ Sentiment analysis completed: ${totalPoints} data points, ${tailingAlerts.length} tailing alerts`);

      // Log sentiment session
      await this.logSentimentSession({
        sessionId,
        timestamp: new Date(),
        sentimentPointsCollected: totalPoints,
        tailingAlertsGenerated: tailingAlerts.length,
        sources: ['Reddit', 'Twitter']
      });

    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
    }
  }

  // Manual trigger for immediate scraping
  async triggerImmediateScraping(): Promise<{ props: number, sentiment: number }> {
    console.log('⚡ Manual trigger: Running immediate comprehensive scraping...');
    
    try {
      // Run both prop and sentiment scraping simultaneously
      const [props, redditSentiment, twitterSentiment] = await Promise.all([
        propLineScraper.scrapeAllSources(),
        sentimentScraper.scrapeRedditSentiment(),
        sentimentScraper.scrapeTwitterSentiment()
      ]);

      const totalSentiment = redditSentiment.length + twitterSentiment.length;
      
      console.log(`⚡ Immediate scraping completed: ${props.length} props, ${totalSentiment} sentiment points`);
      
      return {
        props: props.length,
        sentiment: totalSentiment
      };

    } catch (error) {
      console.error('❌ Immediate scraping failed:', error);
      throw error;
    }
  }

  // Get current scraping status
  getStatus(): {
    isRunning: boolean;
    currentSession: ScrapingSession | null;
    isPeakTime: boolean;
    nextPropScrape: string;
    nextSentimentScrape: string;
  } {
    const propInterval = this.isPeakTime() ? this.PEAK_INTERVAL : this.OFF_PEAK_INTERVAL;
    
    return {
      isRunning: this.isRunning,
      currentSession: this.currentSession,
      isPeakTime: this.isPeakTime(),
      nextPropScrape: `${propInterval} minutes`,
      nextSentimentScrape: `${this.SENTIMENT_INTERVAL} minutes`
    };
  }

  // Log scraping session to Firebase
  private async logScrapingSession(session: ScrapingSession): Promise<void> {
    try {
      const sessionsRef = collection(db, 'scraping_sessions');
      await addDoc(sessionsRef, {
        ...session,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null
      });
    } catch (error) {
      console.error('❌ Failed to log scraping session:', error);
    }
  }

  // Log sentiment session to Firebase
  private async logSentimentSession(session: {
    sessionId: string;
    timestamp: Date;
    sentimentPointsCollected: number;
    tailingAlertsGenerated: number;
    sources: string[];
  }): Promise<void> {
    try {
      const sessionsRef = collection(db, 'sentiment_sessions');
      await addDoc(sessionsRef, {
        ...session,
        timestamp: Timestamp.fromDate(session.timestamp)
      });
    } catch (error) {
      console.error('❌ Failed to log sentiment session:', error);
    }
  }

  // Update scraping frequency based on time
  updateSchedulingFrequency(): void {
    const newInterval = this.isPeakTime() ? this.PEAK_INTERVAL : this.OFF_PEAK_INTERVAL;
    
    // Clear existing schedulers
    this.schedulers.forEach(scheduler => clearInterval(scheduler));
    this.schedulers = [];
    
    // Reinitialize with new frequency
    this.initializeSchedulers();
    
    console.log(`🔄 Scheduling frequency updated: ${newInterval} minutes (Peak: ${this.isPeakTime()})`);
  }

  // Cleanup schedulers
  destroy(): void {
    this.schedulers.forEach(scheduler => clearInterval(scheduler));
    this.schedulers = [];
    console.log('🛑 Scraper schedulers stopped');
  }
}

// Export singleton instance
export const scraperScheduler = new ScraperScheduler();