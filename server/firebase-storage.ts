// Firebase Storage Implementation for WAY
// Replaces MemStorage with Firestore while maintaining live Odds API data flow

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  Timestamp 
} from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase-config";
import { IStorage, UserPreferences } from "./storage";
import type { 
  Prop, InsertProp, 
  AiInsight, InsertAiInsight,
  AiQuery, InsertAiQuery,
  PropHistory, InsertPropHistory,
  TrendAlert, InsertTrendAlert
} from "@shared/schema";

export class FirebaseStorage implements IStorage {
  
  // Props - Live data from Odds API stored temporarily
  async getProps(): Promise<Prop[]> {
    const propsRef = collection(db, COLLECTIONS.LIVE_PROPS);
    const snapshot = await getDocs(propsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prop));
  }

  async getPropById(id: number): Promise<Prop | undefined> {
    const propRef = doc(db, COLLECTIONS.LIVE_PROPS, id.toString());
    const snapshot = await getDoc(propRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Prop : undefined;
  }

  async createProp(prop: InsertProp): Promise<Prop> {
    const propsRef = collection(db, COLLECTIONS.LIVE_PROPS);
    const docRef = await addDoc(propsRef, {
      ...prop,
      status: prop.status || "active",
      lineMovement: prop.lineMovement || "0",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    const created = await getDoc(docRef);
    return { id: created.id, ...created.data() } as Prop;
  }

  async updateProp(id: number, updates: Partial<InsertProp>): Promise<Prop | undefined> {
    const propRef = doc(db, COLLECTIONS.LIVE_PROPS, id.toString());
    await updateDoc(propRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    const updated = await getDoc(propRef);
    return updated.exists() ? { id: updated.id, ...updated.data() } as Prop : undefined;
  }

  // AI Insights - Persistent analytics
  async getAiInsights(limitCount?: number): Promise<AiInsight[]> {
    const insightsRef = collection(db, COLLECTIONS.AI_INSIGHTS);
    const q = limitCount 
      ? query(insightsRef, orderBy('createdAt', 'desc'), limit(limitCount))
      : query(insightsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AiInsight));
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const insightsRef = collection(db, COLLECTIONS.AI_INSIGHTS);
    const docRef = await addDoc(insightsRef, {
      ...insight,
      propId: insight.propId || null,
      createdAt: Timestamp.now()
    });
    
    const created = await getDoc(docRef);
    return { id: created.id, ...created.data() } as AiInsight;
  }

  // AI Queries - User interaction history
  async createAiQuery(queryData: InsertAiQuery): Promise<AiQuery> {
    const queriesRef = collection(db, COLLECTIONS.AI_QUERIES);
    const docRef = await addDoc(queriesRef, {
      ...queryData,
      createdAt: Timestamp.now()
    });
    
    const created = await getDoc(docRef);
    return { id: created.id, ...created.data() } as AiQuery;
  }

  async getRecentAiQueries(limitCount?: number, userId?: string): Promise<AiQuery[]> {
    const queriesRef = collection(db, COLLECTIONS.AI_QUERIES);
    let q = query(queriesRef, orderBy('createdAt', 'desc'));
    
    if (userId) {
      q = query(queriesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AiQuery));
  }

  // User Preferences - Personalization
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const userRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() as UserPreferences : null;
  }

  async setUserPreferences(userId: string, prefs: UserPreferences): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    await updateDoc(userRef, {
      ...prefs,
      updatedAt: Timestamp.now()
    });
  }

  // Historical Data - Prop tracking over time
  async getPropHistory(days: number = 7): Promise<PropHistory[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const historyRef = collection(db, COLLECTIONS.PROP_HISTORY);
    const q = query(
      historyRef, 
      where('date', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropHistory));
  }

  async createPropHistory(history: InsertPropHistory): Promise<PropHistory> {
    const historyRef = collection(db, COLLECTIONS.PROP_HISTORY);
    const docRef = await addDoc(historyRef, {
      ...history,
      createdAt: Timestamp.now()
    });
    
    const created = await getDoc(docRef);
    return { id: created.id, ...created.data() } as PropHistory;
  }

  // Trend Alerts - Market pattern detection
  async getTrendAlerts(active?: boolean): Promise<TrendAlert[]> {
    const alertsRef = collection(db, COLLECTIONS.TREND_ALERTS);
    let q = query(alertsRef, orderBy('createdAt', 'desc'));
    
    if (active !== undefined) {
      q = query(alertsRef, where('active', '==', active), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrendAlert));
  }

  async createTrendAlert(alert: InsertTrendAlert): Promise<TrendAlert> {
    const alertsRef = collection(db, COLLECTIONS.TREND_ALERTS);
    const docRef = await addDoc(alertsRef, {
      ...alert,
      active: true,
      createdAt: Timestamp.now()
    });
    
    const created = await getDoc(docRef);
    return { id: created.id, ...created.data() } as TrendAlert;
  }

  async updateTrendAlert(id: number, updates: Partial<InsertTrendAlert>): Promise<TrendAlert | undefined> {
    const alertRef = doc(db, COLLECTIONS.TREND_ALERTS, id.toString());
    await updateDoc(alertRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    const updated = await getDoc(alertRef);
    return updated.exists() ? { id: updated.id, ...updated.data() } as TrendAlert : undefined;
  }
}