import { 
  type Prop, type InsertProp, 
  type AiInsight, type InsertAiInsight, 
  type AiQuery, type InsertAiQuery,
  type PropHistory, type InsertPropHistory,
  type TrendAlert, type InsertTrendAlert
} from "@shared/schema";

export interface IStorage {
  // Props - live data only
  getProps(): Promise<Prop[]>;
  getPropById(id: number): Promise<Prop | undefined>;
  createProp(prop: InsertProp): Promise<Prop>;
  updateProp(id: number, updates: Partial<InsertProp>): Promise<Prop | undefined>;
  
  // AI Insights
  getAiInsights(limit?: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  // AI Queries with user context
  createAiQuery(query: InsertAiQuery): Promise<AiQuery>;
  getRecentAiQueries(limit?: number, userId?: string): Promise<AiQuery[]>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  setUserPreferences(userId: string, prefs: UserPreferences): Promise<void>;
  
  // Historical Tracking
  getPropHistory(days?: number): Promise<PropHistory[]>;
  createPropHistory(history: InsertPropHistory): Promise<PropHistory>;
  
  // Trend Alerts
  getTrendAlerts(active?: boolean): Promise<TrendAlert[]>;
  createTrendAlert(alert: InsertTrendAlert): Promise<TrendAlert>;
  updateTrendAlert(id: number, updates: Partial<InsertTrendAlert>): Promise<TrendAlert | undefined>;
}

export interface UserPreferences {
  sports?: string[];
  riskLevel?: 'conservative' | 'moderate' | 'aggressive';
  favoriteProps?: string[];
  recentQueries?: string[];
}

export class MemStorage implements IStorage {
  private props: Map<number, Prop> = new Map();
  private aiInsights: Map<number, AiInsight> = new Map();
  private aiQueries: Map<number, AiQuery> = new Map();
  private propHistory: Map<number, PropHistory> = new Map();
  private trendAlerts: Map<number, TrendAlert> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  
  private currentPropId: number = 1;
  private currentInsightId: number = 1;
  private currentQueryId: number = 1;
  private currentHistoryId: number = 1;
  private currentAlertId: number = 1;

  constructor() {
    // Live data only - no mock data initialization
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  async setUserPreferences(userId: string, prefs: UserPreferences): Promise<void> {
    this.userPreferences.set(userId, prefs);
  }

  // Props methods
  async getProps(): Promise<Prop[]> {
    return Array.from(this.props.values());
  }

  async getPropById(id: number): Promise<Prop | undefined> {
    return this.props.get(id);
  }

  async createProp(insertProp: InsertProp): Promise<Prop> {
    const id = this.currentPropId++;
    const prop: Prop = {
      id,
      ...insertProp,
      status: insertProp.status || "active",
      lineMovement: insertProp.lineMovement || "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.props.set(id, prop);
    return prop;
  }

  async updateProp(id: number, updates: Partial<InsertProp>): Promise<Prop | undefined> {
    const existing = this.props.get(id);
    if (!existing) return undefined;
    
    const updated: Prop = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.props.set(id, updated);
    return updated;
  }

  // AI Insights methods
  async getAiInsights(limit?: number): Promise<AiInsight[]> {
    const insights = Array.from(this.aiInsights.values());
    return limit ? insights.slice(0, limit) : insights;
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.currentInsightId++;
    const insight: AiInsight = {
      id,
      ...insertInsight,
      propId: insertInsight.propId || null,
      createdAt: new Date(),
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  // AI Queries methods
  async createAiQuery(insertQuery: InsertAiQuery): Promise<AiQuery> {
    const id = this.currentQueryId++;
    const query: AiQuery = {
      id,
      ...insertQuery,
      createdAt: new Date(),
    };
    this.aiQueries.set(id, query);
    return query;
  }

  async getRecentAiQueries(limit?: number, userId?: string): Promise<AiQuery[]> {
    let queries = Array.from(this.aiQueries.values());
    
    if (userId) {
      queries = queries.filter(q => (q as any).userId === userId);
    }
    
    queries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? queries.slice(0, limit) : queries;
  }

  // History methods
  async getPropHistory(days: number = 7): Promise<PropHistory[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Array.from(this.propHistory.values())
      .filter(h => h.date >= cutoff)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createPropHistory(insertHistory: InsertPropHistory): Promise<PropHistory> {
    const id = this.currentHistoryId++;
    const history: PropHistory = {
      id,
      ...insertHistory,
      createdAt: new Date(),
    };
    this.propHistory.set(id, history);
    return history;
  }

  // Trend Alerts methods
  async getTrendAlerts(active?: boolean): Promise<TrendAlert[]> {
    let alerts = Array.from(this.trendAlerts.values());
    
    if (active !== undefined) {
      alerts = alerts.filter(a => a.isActive === active);
    }
    
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTrendAlert(insertAlert: InsertTrendAlert): Promise<TrendAlert> {
    const id = this.currentAlertId++;
    const alert: TrendAlert = {
      id,
      ...insertAlert,
      propId: insertAlert.propId || null,
      isActive: insertAlert.isActive ?? true,
      createdAt: new Date(),
    };
    this.trendAlerts.set(id, alert);
    return alert;
  }

  async updateTrendAlert(id: number, updates: Partial<InsertTrendAlert>): Promise<TrendAlert | undefined> {
    const existing = this.trendAlerts.get(id);
    if (!existing) return undefined;
    
    const updated: TrendAlert = {
      ...existing,
      ...updates,
    };
    this.trendAlerts.set(id, updated);
    return updated;
  }
}

// Export singleton instance
export const storage = new MemStorage();