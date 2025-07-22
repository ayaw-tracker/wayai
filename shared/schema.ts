import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const props = pgTable("props", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(),
  playerName: text("player_name").notNull(),
  propType: text("prop_type").notNull(), // "passing_tds", "rushing_yards", "receiving_yards", etc.
  line: decimal("line", { precision: 5, scale: 1 }).notNull(),
  odds: integer("odds").notNull(),
  publicPercentage: integer("public_percentage").notNull(),
  moneyPercentage: integer("money_percentage").notNull(),
  lineMovement: decimal("line_movement", { precision: 5, scale: 1 }).notNull().default("0"),
  status: text("status").notNull().default("active"), // "active", "settled", "cancelled"
  sentiment: text("sentiment").notNull(), // "public_trap", "sharp_play", "fade_alert", "neutral"
  matchup: text("matchup").notNull(),
  gameTime: timestamp("game_time").notNull(),
  sport: text("sport").notNull().default("NFL"), // "NFL", "NBA", "MLB"
  aiInsight: text("ai_insight"),
  weatherConditions: text("weather_conditions"),
  defenseRank: integer("defense_rank"),
  result: text("result"), // "hit", "miss", "push", null for active
  actualValue: decimal("actual_value", { precision: 5, scale: 1 }), // actual stat result
  hitRate: integer("hit_rate"), // historical hit rate % for this type of prop
  trendFlag: text("trend_flag"), // "crowd_trap", "sharp_pivot", "reverse_line", "losing_streak"
  team: text("team"), // player's team
  gameId: text("game_id"), // game identifier
  volume: integer("volume"), // betting volume
  bookmaker: text("bookmaker"), // primary sportsbook for this line
  alternateLines: text("alternate_lines"), // JSON string of all book lines
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "trap_alert", "sharp_money", "fade_alert"
  title: text("title").notNull(),
  description: text("description").notNull(),
  propId: integer("prop_id").references(() => props.id),
  severity: text("severity").notNull(), // "high", "medium", "low"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiQueries = pgTable("ai_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propHistory = pgTable("prop_history", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalProps: integer("total_props").notNull(),
  publicHeavyHits: integer("public_heavy_hits").notNull(), // props >70% public that hit
  publicHeavyTotal: integer("public_heavy_total").notNull(), // total props >70% public
  sharpPlayHits: integer("sharp_play_hits").notNull(),
  sharpPlayTotal: integer("sharp_play_total").notNull(),
  trapAlertsCorrect: integer("trap_alerts_correct").notNull(),
  trapAlertsTotal: integer("trap_alerts_total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trendAlerts = pgTable("trend_alerts", {
  id: serial("id").primaryKey(),
  propId: integer("prop_id").references(() => props.id),
  alertType: text("alert_type").notNull(), // "crowd_trap", "sharp_pivot", "reverse_line", "losing_streak"
  severity: text("severity").notNull(), // "high", "medium", "low"
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPropSchema = createInsertSchema(props).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertAiQuerySchema = createInsertSchema(aiQueries).omit({
  id: true,
  createdAt: true,
});

export const insertPropHistorySchema = createInsertSchema(propHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTrendAlertSchema = createInsertSchema(trendAlerts).omit({
  id: true,
  createdAt: true,
});

export type Prop = typeof props.$inferSelect;
export type InsertProp = z.infer<typeof insertPropSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiQuery = typeof aiQueries.$inferSelect;
export type InsertAiQuery = z.infer<typeof insertAiQuerySchema>;
export type PropHistory = typeof propHistory.$inferSelect;
export type InsertPropHistory = z.infer<typeof insertPropHistorySchema>;
export type TrendAlert = typeof trendAlerts.$inferSelect;
export type InsertTrendAlert = z.infer<typeof insertTrendAlertSchema>;
