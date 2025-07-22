// Firebase Live Data Demonstration
// Shows comprehensive prop line monitoring with Firebase storage

import { db } from './firebase-config';
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

interface LiveProp {
  player: string;
  team: string;
  statType: string;
  line: number;
  source: 'PrizePicks' | 'Underdog' | 'DraftKings';
  odds?: number;
  publicPercent?: number;
  timestamp: Date;
  status: 'active' | 'suspended';
}

interface LineMovement {
  propId: string;
  player: string;
  statType: string;
  previousLine: number;
  currentLine: number;
  movement: number;
  direction: '↑' | '↓' | '→';
  significance: 'minor' | 'moderate' | 'major';
  timestamp: Date;
}

interface SentimentData {
  platform: string;
  content: string;
  player?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  engagement: number;
  confidence: number;
  tags: string[];
  timestamp: Date;
}

interface AIAlert {
  type: 'line_movement' | 'public_trap' | 'sharp_money';
  player: string;
  message: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  processed: boolean;
}

export async function storeLivePropData() {
  console.log('🔥 Storing live prop data to Firebase...');
  
  try {
    // Sample live props data from multiple sources
    const sampleProps: LiveProp[] = [
      {
        player: "Josh Allen",
        team: "BUF",
        statType: "Passing Yards",
        line: 267.5,
        source: "PrizePicks",
        publicPercent: 78,
        timestamp: new Date(),
        status: "active"
      },
      {
        player: "Josh Allen", 
        team: "BUF",
        statType: "Passing Yards",
        line: 265.5,
        source: "DraftKings",
        odds: -110,
        publicPercent: 72,
        timestamp: new Date(),
        status: "active"
      },
      {
        player: "Stefon Diggs",
        team: "BUF", 
        statType: "Receiving Yards",
        line: 76.5,
        source: "Underdog",
        publicPercent: 84,
        timestamp: new Date(),
        status: "active"
      }
    ];

    // Store props to Firebase
    const propsCollection = collection(db, 'live_props');
    for (const prop of sampleProps) {
      await addDoc(propsCollection, {
        ...prop,
        timestamp: Timestamp.fromDate(prop.timestamp)
      });
    }

    // Sample line movements
    const lineMovements: LineMovement[] = [
      {
        propId: "josh_allen_passing_yards",
        player: "Josh Allen",
        statType: "Passing Yards", 
        previousLine: 270.5,
        currentLine: 267.5,
        movement: -3.0,
        direction: "↓",
        significance: "major",
        timestamp: new Date()
      }
    ];

    const movementsCollection = collection(db, 'line_movements');
    for (const movement of lineMovements) {
      await addDoc(movementsCollection, {
        ...movement,
        timestamp: Timestamp.fromDate(movement.timestamp)
      });
    }

    // Sample sentiment data
    const sentimentData: SentimentData[] = [
      {
        platform: "reddit",
        content: "Josh Allen over 267.5 passing yards looks like a lock. Buffalo's gonna air it out against Miami's weak secondary.",
        player: "Josh Allen",
        sentiment: "bullish",
        engagement: 47,
        confidence: 0.82,
        tags: ["bills", "passing", "over", "lock"],
        timestamp: new Date()
      },
      {
        platform: "twitter",
        content: "Everyone and their mother is on Diggs receiving yards over. When public is this heavy on something...",
        player: "Stefon Diggs", 
        sentiment: "bearish",
        engagement: 23,
        confidence: 0.71,
        tags: ["diggs", "receiving", "fade", "public"],
        timestamp: new Date()
      }
    ];

    const sentimentCollection = collection(db, 'sentiment_data');
    for (const sentiment of sentimentData) {
      await addDoc(sentimentCollection, {
        ...sentiment,
        timestamp: Timestamp.fromDate(sentiment.timestamp)
      });
    }

    // Sample AI alerts
    const aiAlerts: AIAlert[] = [
      {
        type: "line_movement",
        player: "Josh Allen",
        message: "Major line movement detected: Josh Allen passing yards dropped 3 points from 270.5 to 267.5. Consider sharp money indication.",
        riskLevel: "high",
        timestamp: new Date(),
        processed: false
      },
      {
        type: "public_trap",
        player: "Stefon Diggs", 
        message: "Public betting heavily on Diggs receiving yards over (84%). Historical data shows 67% fade success rate at this threshold.",
        riskLevel: "medium",
        timestamp: new Date(),
        processed: false
      }
    ];

    const alertsCollection = collection(db, 'ai_alerts');
    for (const alert of aiAlerts) {
      await addDoc(alertsCollection, {
        ...alert,
        timestamp: Timestamp.fromDate(alert.timestamp)
      });
    }

    console.log('✅ Successfully stored comprehensive prop data to Firebase');
    console.log(`📊 Stored: ${sampleProps.length} props, ${lineMovements.length} movements, ${sentimentData.length} sentiment points, ${aiAlerts.length} AI alerts`);
    
    return {
      success: true,
      propsStored: sampleProps.length,
      movementsStored: lineMovements.length,
      sentimentStored: sentimentData.length,
      alertsStored: aiAlerts.length
    };

  } catch (error) {
    console.error('❌ Failed to store Firebase data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function retrieveFirebaseData() {
  console.log('📡 Retrieving latest data from Firebase...');
  
  try {
    const results: any = {};

    // Get latest props
    const propsQuery = query(
      collection(db, 'live_props'), 
      orderBy('timestamp', 'desc'), 
      limit(10)
    );
    const propsSnapshot = await getDocs(propsQuery);
    results.liveProps = propsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get latest line movements
    const movementsQuery = query(
      collection(db, 'line_movements'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const movementsSnapshot = await getDocs(movementsQuery);
    results.lineMovements = movementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get latest sentiment
    const sentimentQuery = query(
      collection(db, 'sentiment_data'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const sentimentSnapshot = await getDocs(sentimentQuery);
    results.sentimentData = sentimentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get active AI alerts
    const alertsQuery = query(
      collection(db, 'ai_alerts'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const alertsSnapshot = await getDocs(alertsQuery);
    results.aiAlerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('✅ Successfully retrieved Firebase data');
    console.log(`📊 Retrieved: ${results.liveProps.length} props, ${results.lineMovements.length} movements, ${results.sentimentData.length} sentiment, ${results.aiAlerts.length} alerts`);

    return {
      success: true,
      data: results
    };

  } catch (error) {
    console.error('❌ Failed to retrieve Firebase data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}