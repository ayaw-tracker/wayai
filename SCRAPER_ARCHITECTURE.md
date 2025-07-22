# WAY Prop Line Scraping & Firebase Architecture

## 🎯 System Overview

WAY now includes a comprehensive prop line monitoring system designed to track real-time betting data across multiple sportsbooks and social platforms. The system uses Firebase for data storage and structure, enabling proper line watching and public sentiment analysis.

## 📊 Data Sources & Scraping Targets

### Primary Sportsbooks
- **PrizePicks** - Dynamic scraping with Puppeteer for player props and projections
- **Underdog Fantasy** - Similar structure, pick-em style props  
- **DraftKings** - API integration for official sportsbook data
- **FanDuel** - Future integration planned

### Social Sentiment Sources
- **Reddit Communities**: r/sportsbook, r/sportsbetting, r/dfsports, r/nfl, r/nba, r/baseball
- **Twitter/X**: Sharp money accounts, betting influencers, public sentiment tracking
- **Community Analysis**: Tailing patterns, over-public bet detection

## 🔥 Firebase Data Structure

### Collections Schema
```typescript
// Live prop data (overwritten daily)
live_props: {
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

// Historical tracking (persistent)
prop_history: {
  propId: string;
  player: string;
  statType: string;
  line: number;
  source: string;
  timestamp: Date;
  gameInfo: string;
}

// Line movement alerts
line_movements: {
  propId: string;
  previousLine: number;
  currentLine: number;
  movement: number;
  direction: '↑' | '↓' | '→';
  significance: 'minor' | 'moderate' | 'major';
  timestamp: Date;
}

// Social sentiment data
sentiment_data: {
  platform: string;
  content: string;
  player?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  engagement: number;
  confidence: number;
  tags: string[];
  timestamp: Date;
}

// AI-generated alerts
ai_alerts: {
  type: 'line_movement' | 'public_trap' | 'sharp_money';
  player: string;
  message: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  processed: boolean;
}
```

## ⚙️ Scraper System Components

### 1. PropLineScraper (`prop-line-scraper.ts`)
- **Multi-source scraping** with rate limiting and user-agent rotation
- **Dynamic content handling** using Puppeteer for JavaScript-heavy sites
- **Automatic line movement detection** with Firebase storage
- **Smart filtering** to focus on high-value betting opportunities

### 2. SentimentScraper (`sentiment-scraper.ts`)  
- **Reddit sentiment analysis** using natural language processing
- **Twitter monitoring** for sharp money indicators (when API available)
- **Tailing pattern detection** to identify over-public bets
- **Community sentiment scoring** with confidence levels

### 3. ScraperScheduler (`scraper-scheduler.ts`)
- **Intelligent scheduling**: Peak time (3min) vs off-peak (15min) intervals
- **Session management** with comprehensive logging
- **Error handling** and automatic recovery
- **Manual trigger support** for immediate data collection

## 📡 API Endpoints

### Scraper Management
- `GET /api/scraper/status` - Current scraping status and scheduling info
- `POST /api/scraper/trigger` - Manual trigger for immediate scraping
- `POST /api/scraper/props` - Props-only scraping
- `POST /api/scraper/sentiment` - Sentiment analysis only
- `GET /api/scraper/health` - System health check

## 🚀 Implementation Benefits

### For Line Watching
1. **Real-time Movement Tracking** - Detect significant line changes across multiple books
2. **Historical Pattern Analysis** - Track prop performance over time
3. **Cross-platform Comparison** - Identify line discrepancies between sportsbooks
4. **Automated Alerts** - AI-generated notifications for major movements

### For Public Sentiment Monitoring
1. **Community Pulse** - Track what the public is heavily betting
2. **Contrarian Opportunities** - Identify over-tailed props for fading
3. **Sharp Money Detection** - Monitor for reverse line movement indicators
4. **Engagement Metrics** - Weighted sentiment based on community interaction

### For Data Structure & Storage
1. **Scalable Architecture** - Firebase handles growing data volumes efficiently
2. **Real-time Updates** - Live data synchronization across users
3. **Historical Persistence** - Long-term prop performance tracking
4. **Analytics Ready** - Structured data for advanced AI analysis

## 🔐 Rate Limiting & Safety

### Scraping Best Practices
- **Respectful delays** between requests (3-5 seconds)
- **User-agent rotation** to avoid detection
- **Error handling** with automatic retries
- **Legal compliance** - only public, legally scrapable endpoints

### Firebase Security
- **Environment-based configuration** for development vs production
- **Structured data validation** before storage
- **Optimized queries** with proper indexing
- **Batch operations** for efficient writes

## 📈 Analytics & Insights

### Line Movement Analysis
- **Volatility scoring** for most moved props
- **Direction tracking** (sharp vs public money)
- **Timing analysis** (when movements occur)
- **Cross-book comparison** of line differences

### Sentiment Correlation
- **Public betting patterns** vs actual outcomes
- **Community confidence levels** and accuracy
- **Influencer impact** on line movements
- **Contrarian opportunity identification**

## 🎮 Current Integration Status

The scraper system is implemented and ready for Firebase integration. Current WAY system continues using The Odds API for live data while the comprehensive scraping infrastructure is prepared for expansion.

### Next Steps
1. **Enable Firebase connection** with your provided configuration
2. **Activate automated scraping** with intelligent scheduling
3. **Implement AI alert generation** based on line movements and sentiment
4. **Add user-configurable monitoring** for specific players/props

The architecture provides a solid foundation for comprehensive prop betting market analysis with proper data storage and structure to handle the massive amounts of real-time information from multiple sources.