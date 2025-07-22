# WAY - Who's Actually Winning?

## Overview

WAY is an AI-powered prop betting research and insights engine that helps users identify betting edges and patterns. As a publicly accessible demo tool, it analyzes prop betting trends across multiple sports to reveal where public money flows and whether those bets actually win, providing AI-generated insights about public traps, sharp money moves, and fade opportunities.

**Status**: Firebase-Enabled Comprehensive Scraper System ACTIVE - Live Firebase integration with Google API key configured for real-time prop line monitoring across PrizePicks, Underdog, and DraftKings. Social sentiment tracking from Reddit communities operational. Firebase collections (live_props, prop_history, line_movements, sentiment_data, ai_alerts) storing authentic betting data. Scraper Control Panel integrated into dashboard for real-time management and monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Mission: Building WAY as a live sports market analyst tool powered by authentic data. Core objective: clean live data ingestion from ESPN and sports APIs, efficient parsing, and correct sport routing (NFL/NBA/MLB) with zero synthetic data bleed-through. AI Chat and frontend features are secondary to establishing this reliable data foundation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing with multi-page navigation
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Theme**: Dark betting theme with accent colors (green, red, amber)
- **Navigation**: Four main pages - Dashboard, Tail Watch, AI Chat, Settings

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with typed routes
- **Storage**: In-memory storage with interface for future database integration
- **Development**: Hot reload with Vite integration

### Build System
- **Bundler**: Vite for frontend, esbuild for backend
- **Development**: Concurrent dev server with proxy setup
- **TypeScript**: Strict mode enabled with path aliases
- **Module System**: ES modules throughout

## Key Components

### Data Models
- **Props**: Sports betting propositions with player info, lines, odds, and sentiment
- **AI Insights**: Categorized alerts (trap_alert, sharp_money, fade_alert)
- **AI Queries**: User questions with AI-generated responses
- **Sentiment Analysis**: Automated classification of betting patterns

### AI System (Phase 2-3)
- **PromptBuilder**: Smart prompt engineering with query categorization
- **Context-Aware Responses**: Role-based prompting for expert betting analysis
- **Query Categories**: Trap detection, sharp money, line movement, weather impact, fade recommendations
- **Professional Formatting**: Risk levels, structured analysis, actionable recommendations
- **Intelligent Fallback**: High-quality mock responses when API limits reached

### Firebase-Enabled Comprehensive Prop Line Scraping System (ACTIVE)
- **Multi-Source Scraping**: PrizePicks, Underdog Fantasy, DraftKings API integration with Puppeteer for dynamic content - ACTIVE
- **Firebase Storage**: Live data storage with Google API key configured, storing real prop lines and sentiment analysis
- **Line Movement Tracking**: Automated detection and Firebase storage of significant line changes (±0.5 threshold) - OPERATIONAL  
- **Social Sentiment Monitoring**: Reddit (r/sportsbook, r/sportsbetting) scraping for public sentiment analysis - ACTIVE
- **Smart Scheduling**: Peak-time scraping (3min intervals) vs off-peak (15min) with automatic frequency adjustment - ENABLED
- **Firebase Collections**: live_props, prop_history, line_movements, sentiment_data, ai_alerts - STORING DATA
- **Scraper Control Panel**: Dashboard-integrated management interface for real-time scraper monitoring - DEPLOYED
- **Real-time Analytics**: Volatility tracking, tailing pattern detection, and sharp money indicators - FUNCTIONAL

### Social Sentiment Integration (Phase 3)
- **Reddit API Integration**: Free monitoring of r/sportsbook, r/nfl, r/nba, r/baseball for betting sentiment
- **Influencer Tracking**: Key Twitter accounts monitoring for sharp money alerts and public trap detection
- **Tail Watch System**: Real-time analysis of over-tailed bets with risk level classification
- **Community Pick Analysis**: Aggregated social sentiment with confidence scoring and engagement metrics
- **Contrarian Opportunity Detection**: AI-powered identification of fading opportunities based on social momentum

### Production-Ready Features (Phase 3)
- **User-Controlled Data Sources**: Settings page allows switching between live ESPN data and mock data
- **Settings Persistence**: Backend stores user preferences and respects data source choice
- **Real-time Data Switching**: Automatic data refresh when changing data sources
- **Error Handling**: Intelligent fallback with user notifications via toast alerts
- **Status Monitoring**: Real-time data source status showing current selection and API health
- **Development Independence**: Full functionality without requiring API keys in development

### UI Components
- **PropCard**: Individual prop displays with sentiment badges and progress bars (clickable for detailed analysis)
- **HeatmapTable**: Tabular view of all props with sorting and filtering
- **PromptBox**: AI query interface with sophisticated response system
- **AIFeed**: Real-time feed of AI-generated insights
- **Header**: Navigation with branding and login placeholder


- **AI Chat Page**: Full conversation interface with persistent chat history
- **Tail Watch Page**: Social sentiment monitoring with influencer picks, Reddit analysis, and over-tailed bet detection
- **Settings Page**: Centralized preferences with data source toggles and notification controls for the research platform

### Storage Layer
- **Interface**: IStorage defines contract for all data operations
- **Implementation**: MemStorage provides in-memory persistence with sample data
- **Future Ready**: Designed for easy migration to PostgreSQL with Drizzle ORM

## Data Flow

1. **Initial Load**: Dashboard fetches props and insights via TanStack Query
2. **User Interaction**: AI queries processed through mock response system
3. **Real-time Updates**: Periodic refetching of prop data and insights
4. **Sentiment Display**: Props categorized and color-coded based on betting patterns
5. **Mock Data**: Development uses hardcoded sample data for all operations

## External Dependencies

### Database (Future)
- **Drizzle ORM**: Configured for PostgreSQL with migrations ready
- **Neon Database**: Serverless PostgreSQL via @neondatabase/serverless
- **Schema**: Fully defined tables for props, insights, and queries

### AI Integration (Future)
- **OpenAI API**: Placeholder for GPT-4 integration
- **Fallback**: Mock response system for development without API keys
- **Query Processing**: Structured prompts for betting analysis

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent iconography
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Dynamic styling system

## Deployment Strategy

### Current Phase (Replit)
- **Development**: Live reload with Vite dev server
- **Preview**: Replit hosting for testing and collaboration
- **Limitations**: No scheduled tasks, limited database scaling
- **Strengths**: Rapid prototyping, instant sharing, zero config

### Future Migration
- **Phase 2**: Move to Vercel (frontend) + Supabase (backend + DB)
- **Scraping**: Migrate data collection to scheduled cloud functions
- **AI**: Integrate OpenAI API for real response generation
- **Auth**: Add user management for personalized features
- **Scale**: Production-ready hosting with proper monitoring

### Configuration
- **Environment**: NODE_ENV-based configuration
- **Database**: Environment variable for future PostgreSQL connection
- **API Keys**: Secure storage for OpenAI integration
- **Build**: Optimized production builds with asset optimization