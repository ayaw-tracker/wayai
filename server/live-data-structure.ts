// Core live data holding structure - only authentic data from trusted sources
import type { LiveProp, LiveGame, LivePlayer } from './live-data-providers.js';

export interface LiveDataCache {
  nfl: {
    games: LiveGame[];
    players: LivePlayer[];
    props: LiveProp[];
    lastUpdated: Date;
  };
  nba: {
    games: LiveGame[];
    players: LivePlayer[];
    props: LiveProp[];
    lastUpdated: Date;
  };
  mlb: {
    games: LiveGame[];
    players: LivePlayer[];
    props: LiveProp[];
    lastUpdated: Date;
  };
}

export interface DataQualityCheck {
  sport: string;
  hasLiveGames: boolean;
  hasRealPlayers: boolean;
  hasAuthenticProps: boolean;
  dataSource: string;
  lastRefresh: Date;
  errors: string[];
}

class LiveDataStructure {
  private cache: LiveDataCache = {
    nfl: { games: [], players: [], props: [], lastUpdated: new Date() },
    nba: { games: [], players: [], props: [], lastUpdated: new Date() },
    mlb: { games: [], players: [], props: [], lastUpdated: new Date() }
  };

  // Store only authentic data - reject any synthetic/mock data
  updateSportData(sport: string, data: { games?: LiveGame[], players?: LivePlayer[], props?: LiveProp[] }) {
    const sportKey = sport.toLowerCase() as keyof LiveDataCache;
    
    if (this.cache[sportKey]) {
      if (data.games) this.cache[sportKey].games = data.games;
      if (data.players) this.cache[sportKey].players = data.players;
      if (data.props) {
        // Filter out any synthetic props - only allow props with real player names
        const authenticProps = data.props.filter(prop => 
          prop.playerName && 
          !prop.playerName.includes('Mock') && 
          !prop.playerName.includes('Fake') &&
          !prop.playerName.includes('Test') &&
          !prop.playerName.includes('Star Player') &&
          !prop.playerName.includes('Sample')
        );
        this.cache[sportKey].props = authenticProps;
      }
      this.cache[sportKey].lastUpdated = new Date();
    }
  }

  // Get clean data for specific sport
  getSportData(sport: string) {
    const sportKey = sport.toLowerCase() as keyof LiveDataCache;
    return this.cache[sportKey] || { games: [], players: [], props: [], lastUpdated: new Date() };
  }

  // Quality check - ensure only authentic data
  performQualityCheck(sport: string): DataQualityCheck {
    const data = this.getSportData(sport);
    
    return {
      sport: sport.toUpperCase(),
      hasLiveGames: data.games.length > 0,
      hasRealPlayers: data.players.length > 0 && data.players.every(p => p.name && !p.name.includes('Mock')),
      hasAuthenticProps: data.props.length > 0 && data.props.every(p => 
        p.playerName && 
        !p.playerName.includes('Mock') && 
        !p.playerName.includes('Star Player')
      ),
      dataSource: 'ESPN + Sports APIs',
      lastRefresh: data.lastUpdated,
      errors: []
    };
  }

  // Clear cache to force fresh data pull
  clearCache(sport?: string) {
    if (sport) {
      const sportKey = sport.toLowerCase() as keyof LiveDataCache;
      if (this.cache[sportKey]) {
        this.cache[sportKey] = { games: [], players: [], props: [], lastUpdated: new Date() };
      }
    } else {
      this.cache = {
        nfl: { games: [], players: [], props: [], lastUpdated: new Date() },
        nba: { games: [], players: [], props: [], lastUpdated: new Date() },
        mlb: { games: [], players: [], props: [], lastUpdated: new Date() }
      };
    }
  }

  // Get all cached data for AI analysis
  getAllData() {
    return this.cache;
  }
}

export const liveDataStructure = new LiveDataStructure();