// WAY Prop Line & Sentiment Scraper System
// Scrapes real-time prop lines, public percentages, and line movement
// Stores data in Firebase for comprehensive market analysis

import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import { db, COLLECTIONS } from './firebase-config';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface ScrapedProp {
  player: string;
  team: string;
  statType: string;
  line: number;
  source: 'PrizePicks' | 'Underdog' | 'DraftKings' | 'FanDuel';
  status: 'active' | 'suspended' | 'closed';
  timestamp: Date;
  gameInfo?: string;
  odds?: number;
  publicPercent?: number;
  moneyPercent?: number;
}

export interface LineMovement {
  propId: string;
  previousLine: number;
  currentLine: number;
  movement: number;
  direction: '↑' | '↓' | '→';
  timestamp: Date;
  source: string;
}

export class PropLineScraper {
  private browser: any = null;
  private userAgent = new UserAgent();
  private rateLimitDelay = 3000; // 3 seconds between requests
  
  constructor() {
    this.initializeBrowser();
  }

  private async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
      });
    }
  }

  // PrizePicks Scraper - Dynamic content
  async scrapePrizePicks(): Promise<ScrapedProp[]> {
    console.log('🎯 Scraping PrizePicks for prop lines...');
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(this.userAgent.toString());
      
      await page.goto('https://app.prizepicks.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for React components to load
      await page.waitForSelector('[data-testid="pick-card"], .pick-card, .prop-card', { timeout: 15000 });
      
      const props = await page.evaluate(() => {
        const propCards = document.querySelectorAll('[data-testid="pick-card"], .pick-card, .prop-card');
        const scrapedProps: any[] = [];
        
        propCards.forEach(card => {
          try {
            const playerElement = card.querySelector('.player-name, .name, [data-testid="player-name"]');
            const statElement = card.querySelector('.stat-type, .category, [data-testid="stat-type"]');
            const lineElement = card.querySelector('.line, .projection, [data-testid="line"]');
            const teamElement = card.querySelector('.team, [data-testid="team"]');
            
            if (playerElement && statElement && lineElement) {
              scrapedProps.push({
                player: playerElement.textContent?.trim() || 'Unknown Player',
                statType: statElement.textContent?.trim() || 'Unknown Stat',
                line: parseFloat(lineElement.textContent?.replace(/[^\d.]/g, '') || '0'),
                team: teamElement?.textContent?.trim() || 'Unknown Team',
                status: 'active',
                source: 'PrizePicks'
              });
            }
          } catch (err) {
            console.warn('Error parsing prop card:', err);
          }
        });
        
        return scrapedProps;
      });

      await page.close();
      
      // Add timestamps and store in Firebase
      const timestampedProps = props.map(prop => ({
        ...prop,
        timestamp: new Date(),
        propId: `${prop.source}-${prop.player}-${prop.statType}-${Date.now()}`
      }));

      await this.storeProps(timestampedProps);
      console.log(`✅ Scraped ${timestampedProps.length} props from PrizePicks`);
      
      return timestampedProps;
      
    } catch (error) {
      console.error('❌ PrizePicks scraping failed:', error);
      return [];
    }
  }

  // Underdog Fantasy Scraper  
  async scrapeUnderdog(): Promise<ScrapedProp[]> {
    console.log('🎯 Scraping Underdog Fantasy for prop lines...');
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(this.userAgent.toString());
      
      await page.goto('https://underdogfantasy.com/pick-em', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await page.waitForSelector('.pick-card, [data-testid="pick"], .prop-selection', { timeout: 15000 });
      
      const props = await page.evaluate(() => {
        const propCards = document.querySelectorAll('.pick-card, [data-testid="pick"], .prop-selection');
        const scrapedProps: any[] = [];
        
        propCards.forEach(card => {
          try {
            const playerElement = card.querySelector('.player-name, .athlete-name');
            const statElement = card.querySelector('.stat-type, .pick-type');
            const lineElement = card.querySelector('.line, .target');
            
            if (playerElement && statElement && lineElement) {
              scrapedProps.push({
                player: playerElement.textContent?.trim() || 'Unknown Player',
                statType: statElement.textContent?.trim() || 'Unknown Stat',
                line: parseFloat(lineElement.textContent?.replace(/[^\d.]/g, '') || '0'),
                team: 'Unknown Team', // Extract from context if available
                status: 'active',
                source: 'Underdog'
              });
            }
          } catch (err) {
            console.warn('Error parsing Underdog prop:', err);
          }
        });
        
        return scrapedProps;
      });

      await page.close();
      
      const timestampedProps = props.map(prop => ({
        ...prop,
        timestamp: new Date(),
        propId: `${prop.source}-${prop.player}-${prop.statType}-${Date.now()}`
      }));

      await this.storeProps(timestampedProps);
      console.log(`✅ Scraped ${timestampedProps.length} props from Underdog`);
      
      return timestampedProps;
      
    } catch (error) {
      console.error('❌ Underdog scraping failed:', error);
      return [];
    }
  }

  // DraftKings API Scraper (lighter approach)
  async scrapeDraftKings(): Promise<ScrapedProp[]> {
    console.log('🎯 Scraping DraftKings for prop lines...');
    
    try {
      const response = await axios.get('https://sportsbook-us-nh.draftkings.com/sites/US-NH-SB/api/v5/eventgroups/88808/categories/1215/subcategories', {
        headers: {
          'User-Agent': this.userAgent.toString(),
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      // Parse DraftKings API response for prop data
      const props: ScrapedProp[] = [];
      const events = response.data?.eventGroup?.events || [];
      
      events.forEach((event: any) => {
        event.displayGroups?.forEach((group: any) => {
          group.markets?.forEach((market: any) => {
            market.outcomes?.forEach((outcome: any) => {
              if (outcome.participant && outcome.line) {
                props.push({
                  player: outcome.participant,
                  team: event.teamName1 || 'Unknown Team',
                  statType: market.name || 'Unknown Stat',
                  line: parseFloat(outcome.line),
                  source: 'DraftKings',
                  status: outcome.oddsAmerican ? 'active' : 'suspended',
                  timestamp: new Date(),
                  odds: outcome.oddsAmerican,
                  publicPercent: outcome.percentOfSpread
                });
              }
            });
          });
        });
      });

      await this.storeProps(props);
      console.log(`✅ Scraped ${props.length} props from DraftKings API`);
      
      return props;
      
    } catch (error) {
      console.error('❌ DraftKings scraping failed:', error);
      return [];
    }
  }

  // Store props in Firebase with line movement tracking
  private async storeProps(props: ScrapedProp[]): Promise<void> {
    try {
      const batch = props.map(async (prop) => {
        // Check for line movement
        await this.trackLineMovement(prop);
        
        // Store current prop
        const propsRef = collection(db, COLLECTIONS.LIVE_PROPS);
        return addDoc(propsRef, {
          ...prop,
          timestamp: Timestamp.fromDate(prop.timestamp),
          createdAt: Timestamp.now()
        });
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('❌ Failed to store props in Firebase:', error);
    }
  }

  // Track line movement for AI alerts
  private async trackLineMovement(currentProp: ScrapedProp): Promise<void> {
    try {
      // Query for previous prop with same player/stat/source
      const historyRef = collection(db, COLLECTIONS.PROP_HISTORY);
      const q = query(
        historyRef,
        where('player', '==', currentProp.player),
        where('statType', '==', currentProp.statType),
        where('source', '==', currentProp.source),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const previousProp = snapshot.docs[0].data();
        const movement = currentProp.line - previousProp.line;
        
        if (Math.abs(movement) >= 0.5) { // Significant movement threshold
          const lineMovement: LineMovement = {
            propId: `${currentProp.player}-${currentProp.statType}`,
            previousLine: previousProp.line,
            currentLine: currentProp.line,
            movement,
            direction: movement > 0 ? '↑' : movement < 0 ? '↓' : '→',
            timestamp: new Date(),
            source: currentProp.source
          };

          // Store line movement for AI analysis
          const movementRef = collection(db, 'line_movements');
          await addDoc(movementRef, {
            ...lineMovement,
            timestamp: Timestamp.fromDate(lineMovement.timestamp)
          });

          console.log(`📈 Line movement detected: ${lineMovement.propId} ${lineMovement.direction} ${Math.abs(movement)}`);
        }
      }

      // Store current prop in history
      const historyRef = collection(db, COLLECTIONS.PROP_HISTORY);
      await addDoc(historyRef, {
        ...currentProp,
        timestamp: Timestamp.fromDate(currentProp.timestamp)
      });

    } catch (error) {
      console.error('❌ Failed to track line movement:', error);
    }
  }

  // Scrape all sources in sequence
  async scrapeAllSources(): Promise<ScrapedProp[]> {
    console.log('🚀 Starting comprehensive prop scraping...');
    
    const allProps: ScrapedProp[] = [];
    
    try {
      // Scrape with delays to avoid rate limiting
      const prizePicksProps = await this.scrapePrizePicks();
      allProps.push(...prizePicksProps);
      
      await this.delay(this.rateLimitDelay);
      
      const underdogProps = await this.scrapeUnderdog();
      allProps.push(...underdogProps);
      
      await this.delay(this.rateLimitDelay);
      
      const draftKingsProps = await this.scrapeDraftKings();
      allProps.push(...draftKingsProps);
      
      console.log(`✅ Total props scraped: ${allProps.length}`);
      return allProps;
      
    } catch (error) {
      console.error('❌ Comprehensive scraping failed:', error);
      return allProps;
    }
  }

  // Cleanup browser resources
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const propLineScraper = new PropLineScraper();