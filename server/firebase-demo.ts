// WAY Firebase Integration Demo
// Demonstrates the complete data flow for prop line monitoring and storage

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.GOOGLE_API_KEY || "demo-key",
  authDomain: "wayprojections.firebaseapp.com",
  projectId: "wayprojections",
  storageBucket: "wayprojections.firebasestorage.app",
  messagingSenderId: "900026975792",
  appId: "1:900026975792:web:fd620f1cc1ccc209f48ff5",
  measurementId: "G-NJ6581DTXH"
};

// Initialize Firebase (for demo purposes)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface PropLineRecord {
  player: string;
  team: string;
  statType: string;
  line: number;
  source: 'PrizePicks' | 'Underdog' | 'DraftKings' | 'FanDuel';
  odds?: number;
  publicPercent?: number;
  timestamp: Date;
  gameInfo?: string;
}

export interface LineMovementRecord {
  propId: string;
  player: string;
  statType: string;
  previousLine: number;
  currentLine: number;
  movement: number;
  direction: '↑' | '↓' | '→';
  source: string;
  timestamp: Date;
  significance: 'minor' | 'moderate' | 'major';
}

export interface SentimentRecord {
  platform: string;
  content: string;
  player?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  engagement: number;
  confidence: number;
  tags: string[];
  timestamp: Date;
}

export class FirebasePropsManager {
  
  // Store scraped prop lines with automatic timestamping
  async storePropLines(props: PropLineRecord[]): Promise<void> {
    console.log(`📊 Storing ${props.length} prop lines in Firebase...`);
    
    try {
      const batch = props.map(async (prop) => {
        const propData = {
          ...prop,
          timestamp: Timestamp.fromDate(prop.timestamp),
          createdAt: Timestamp.now(),
          propId: `${prop.source}-${prop.player}-${prop.statType}`,
          status: 'active'
        };
        
        return addDoc(collection(db, 'live_props'), propData);
      });

      await Promise.all(batch);
      console.log(`✅ Successfully stored ${props.length} prop lines`);
      
    } catch (error) {
      console.error('❌ Failed to store prop lines:', error);
    }
  }

  // Track line movements for AI analysis
  async trackLineMovement(movement: LineMovementRecord): Promise<void> {
    console.log(`📈 Tracking line movement: ${movement.player} ${movement.direction} ${Math.abs(movement.movement)}`);
    
    try {
      const movementData = {
        ...movement,
        timestamp: Timestamp.fromDate(movement.timestamp),
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'line_movements'), movementData);
      
      // Generate AI alert for significant movements
      if (movement.significance === 'major') {
        await this.generateLineMovementAlert(movement);
      }
      
    } catch (error) {
      console.error('❌ Failed to track line movement:', error);
    }
  }

  // Store social sentiment data
  async storeSentimentData(sentiments: SentimentRecord[]): Promise<void> {
    console.log(`🔍 Storing ${sentiments.length} sentiment records...`);
    
    try {
      const batch = sentiments.map(async (sentiment) => {
        const sentimentData = {
          ...sentiment,
          timestamp: Timestamp.fromDate(sentiment.timestamp),
          createdAt: Timestamp.now()
        };
        
        return addDoc(collection(db, 'sentiment_data'), sentimentData);
      });

      await Promise.all(batch);
      console.log(`✅ Successfully stored ${sentiments.length} sentiment records`);
      
    } catch (error) {
      console.error('❌ Failed to store sentiment data:', error);
    }
  }

  // Retrieve recent prop history for analysis
  async getRecentPropHistory(player: string, statType: string, hours: number = 24): Promise<PropLineRecord[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);
      
      const q = query(
        collection(db, 'live_props'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const props = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PropLineRecord[];
      
      // Filter by player and stat type
      return props.filter(prop => 
        prop.player === player && 
        prop.statType === statType &&
        prop.timestamp >= cutoffTime
      );
      
    } catch (error) {
      console.error('❌ Failed to retrieve prop history:', error);
      return [];
    }
  }

  // Generate AI alert for significant line movements
  private async generateLineMovementAlert(movement: LineMovementRecord): Promise<void> {
    try {
      const alert = {
        type: 'line_movement_alert',
        player: movement.player,
        statType: movement.statType,
        message: `🚨 Major line movement: ${movement.player} ${movement.statType} moved ${movement.direction} ${Math.abs(movement.movement)} points`,
        movement: movement.movement,
        direction: movement.direction,
        source: movement.source,
        riskLevel: 'high',
        timestamp: Timestamp.now(),
        processed: false
      };
      
      await addDoc(collection(db, 'ai_alerts'), alert);
      console.log(`🚨 Generated line movement alert: ${alert.message}`);
      
    } catch (error) {
      console.error('❌ Failed to generate line movement alert:', error);
    }
  }

  // Analytics: Get most volatile props
  async getMostVolatileProps(timeframe: number = 6): Promise<any[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - timeframe);
      
      const q = query(
        collection(db, 'line_movements'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const movements = snapshot.docs.map(doc => doc.data());
      
      // Group by player/stat and calculate volatility
      const volatilityMap = new Map();
      
      movements.forEach((movement: any) => {
        const key = `${movement.player}-${movement.statType}`;
        if (!volatilityMap.has(key)) {
          volatilityMap.set(key, {
            player: movement.player,
            statType: movement.statType,
            movements: [],
            totalVolatility: 0
          });
        }
        
        const data = volatilityMap.get(key);
        data.movements.push(movement);
        data.totalVolatility += Math.abs(movement.movement);
      });
      
      // Sort by volatility and return top 10
      return Array.from(volatilityMap.values())
        .sort((a, b) => b.totalVolatility - a.totalVolatility)
        .slice(0, 10);
        
    } catch (error) {
      console.error('❌ Failed to get volatile props:', error);
      return [];
    }
  }
}

// Demo function to show complete data flow
export async function demonstrateFirebaseIntegration(): Promise<void> {
  console.log('🔥 WAY Firebase Integration Demo Starting...');
  
  const firebaseManager = new FirebasePropsManager();
  
  // Example prop lines from scraping
  const sampleProps: PropLineRecord[] = [
    {
      player: 'Patrick Mahomes',
      team: 'Kansas City Chiefs',
      statType: 'Passing Yards',
      line: 275.5,
      source: 'PrizePicks',
      odds: -110,
      publicPercent: 67,
      timestamp: new Date(),
      gameInfo: 'KC vs LAC'
    },
    {
      player: 'Aaron Judge',
      team: 'New York Yankees',
      statType: 'Total Bases',
      line: 1.5,
      source: 'Underdog',
      odds: -115,
      publicPercent: 72,
      timestamp: new Date(),
      gameInfo: 'NYY vs BOS'
    }
  ];
  
  // Example line movement
  const sampleMovement: LineMovementRecord = {
    propId: 'PrizePicks-PatrickMahomes-PassingYards',
    player: 'Patrick Mahomes',
    statType: 'Passing Yards',
    previousLine: 275.5,
    currentLine: 278.5,
    movement: 3.0,
    direction: '↑',
    source: 'PrizePicks',
    timestamp: new Date(),
    significance: 'major'
  };
  
  // Example sentiment data
  const sampleSentiment: SentimentRecord[] = [
    {
      platform: 'r/sportsbook',
      content: 'Mahomes passing yards over 275.5 is a lock tonight',
      player: 'Patrick Mahomes',
      sentiment: 'bullish',
      engagement: 45,
      confidence: 85,
      tags: ['lock', 'passing-yards', 'over'],
      timestamp: new Date()
    }
  ];
  
  try {
    // Store all data types
    await firebaseManager.storePropLines(sampleProps);
    await firebaseManager.trackLineMovement(sampleMovement);
    await firebaseManager.storeSentimentData(sampleSentiment);
    
    // Retrieve analytics
    const volatileProps = await firebaseManager.getMostVolatileProps();
    console.log('📊 Most volatile props:', volatileProps.length);
    
    console.log('✅ Firebase integration demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase demo failed:', error);
  }
}

export const firebasePropsManager = new FirebasePropsManager();