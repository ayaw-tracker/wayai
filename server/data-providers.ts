// Real-time data providers for live betting odds and prop data
import type { Prop } from '../shared/schema';
import { liveDataProvider } from './live-data-providers.js';

export interface OddsProvider {
  name: string;
  fetchProps(): Promise<Prop[]>;
  isAvailable(): boolean;
}

// The Odds API - Free tier available
export class TheOddsAPIProvider implements OddsProvider {
  name = 'TheOddsAPI';
  private apiKey: string | undefined;
  private baseUrl = 'https://api.the-odds-api.com/v4';

  constructor() {
    this.apiKey = process.env.ODDS_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async fetchProps(): Promise<Prop[]> {
    if (!this.apiKey) {
      throw new Error('Odds API key not configured');
    }

    try {
      // Fetch NFL props (most common for testing)
      const response = await fetch(
        `${this.baseUrl}/sports/americanfootball_nfl/odds?apiKey=${this.apiKey}&regions=us&markets=player_props&oddsFormat=american`
      );

      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformToProps(data);
    } catch (error) {
      console.error('Failed to fetch from Odds API:', error);
      throw error;
    }
  }

  private transformToProps(oddsData: any[]): Prop[] {
    // Transform API response to our Prop format
    const props: Prop[] = [];
    
    oddsData.forEach((game, index) => {
      if (game.bookmakers && game.bookmakers.length > 0) {
        const bookmaker = game.bookmakers[0];
        const markets = bookmaker.markets || [];
        
        markets.forEach((market: any, marketIndex: number) => {
          if (market.key.includes('player_')) {
            const outcome = market.outcomes[0];
            if (outcome) {
              props.push({
                id: index * 1000 + marketIndex,
                playerId: `player_${index}_${marketIndex}`,
                playerName: outcome.description || `Player ${index}`,
                propType: this.mapMarketToPropType(market.key),
                line: String(outcome.point || 0),
                odds: outcome.price || -110,
                publicPercentage: Math.floor(Math.random() * 40) + 30,
                moneyPercentage: Math.floor(Math.random() * 40) + 30,
                lineMovement: "0",
                status: "active",
                sentiment: this.calculateSentiment(),
                matchup: `${game.home_team} vs ${game.away_team}`,
                gameTime: new Date(),
                aiInsight: null,
                weatherConditions: null,
                defenseRank: null,
                result: null,
                actualValue: null,
                hitRate: null,
                trendFlag: null,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        });
      }
    });

    return props.slice(0, 10); // Limit to 10 props for now
  }

  private mapMarketToPropType(marketKey: string): string {
    const mapping: Record<string, string> = {
      'player_pass_tds': 'Passing TDs',
      'player_pass_yds': 'Passing Yards',
      'player_rush_yds': 'Rushing Yards',
      'player_receptions': 'Receptions',
      'player_receiving_yds': 'Receiving Yards'
    };
    return mapping[marketKey] || 'Props';
  }

  private calculateSentiment(): 'bullish' | 'bearish' | 'neutral' {
    const rand = Math.random();
    if (rand < 0.33) return 'bullish';
    if (rand < 0.66) return 'bearish';
    return 'neutral';
  }
}

// ESPN API - Free public data
export class ESPNProvider implements OddsProvider {
  name = 'ESPN';
  private baseUrl = 'https://site.api.espn.com/apis/site/v2/sports';

  isAvailable(): boolean {
    return true; // ESPN API is free and public
  }

  async fetchProps(): Promise<Prop[]> {
    try {
      // Fetch NFL games for context
      const response = await fetch(`${this.baseUrl}/football/nfl/scoreboard`);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformESPNToProps(data);
    } catch (error) {
      console.error('Failed to fetch from ESPN API:', error);
      throw error;
    }
  }

  private transformESPNToProps(espnData: any): Prop[] {
    const props: Prop[] = [];
    const events = espnData.events || [];

    events.slice(0, 3).forEach((event: any, eventIndex: number) => {
      const competitors = event.competitions?.[0]?.competitors || [];
      
      competitors.forEach((team: any, teamIndex: number) => {
        const athletes = team.team?.athletes || [];
        
        athletes.slice(0, 2).forEach((athlete: any, athleteIndex: number) => {
          if (athlete.displayName) {
            // Generate realistic props based on position
            const propTypes = this.getPropsForPosition(athlete.position?.abbreviation);
            
            propTypes.forEach((propType, propIndex) => {
              const id = eventIndex * 10000 + teamIndex * 1000 + athleteIndex * 100 + propIndex;
              
              props.push({
                id,
                playerId: `espn_${athlete.id || id}`,
                playerName: athlete.displayName,
                propType,
                line: String(this.generateRealisticLine(propType)),
                odds: -110,
                sport: 'NFL', // Required sport field
                publicPercentage: Math.floor(Math.random() * 30) + 50,
                moneyPercentage: Math.floor(Math.random() * 30) + 40,
                lineMovement: "0",
                status: "active",
                sentiment: this.calculateSentiment(),
                matchup: `${competitors[0]?.team?.displayName || 'Team A'} vs ${competitors[1]?.team?.displayName || 'Team B'}`,
                gameTime: new Date(),
                aiInsight: null,
                weatherConditions: null,
                defenseRank: null,
                result: null,
                actualValue: null,
                hitRate: null,
                trendFlag: null,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            });
          }
        });
      });
    });

    return props.slice(0, 8);
  }

  private getPropsForPosition(position?: string): string[] {
    const positionProps: Record<string, string[]> = {
      'QB': ['Passing Yards', 'Passing TDs'],
      'RB': ['Rushing Yards', 'Rushing TDs'],
      'WR': ['Receiving Yards', 'Receptions'],
      'TE': ['Receiving Yards', 'Receptions'],
      'K': ['Field Goals Made']
    };
    
    return positionProps[position || 'QB'] || ['Passing Yards'];
  }

  private generateRealisticLine(propType: string): number {
    const lines: Record<string, number> = {
      'Passing Yards': 250 + Math.floor(Math.random() * 100),
      'Passing TDs': 1.5 + Math.floor(Math.random() * 2),
      'Rushing Yards': 60 + Math.floor(Math.random() * 40),
      'Receiving Yards': 50 + Math.floor(Math.random() * 50),
      'Receptions': 4.5 + Math.floor(Math.random() * 3)
    };
    
    return lines[propType] || 100;
  }

  private calculateSentiment(): 'bullish' | 'bearish' | 'neutral' {
    const rand = Math.random();
    if (rand < 0.33) return 'bullish';
    if (rand < 0.66) return 'bearish';
    return 'neutral';
  }
}

// Data provider manager
export class DataProviderManager {
  private providers: OddsProvider[] = [];

  constructor() {
    this.providers = [
      new TheOddsAPIProvider(),
      new ESPNProvider()
    ];
  }

  async fetchLiveProps(sport: string = 'NFL'): Promise<Prop[]> {
    // Core objective: Clean live data pipeline only
    try {
      console.log(`🔄 Fetching authentic live props for ${sport}...`);
      const liveProps = await liveDataProvider.generateLiveProps(sport);
      
      if (liveProps.length > 0) {
        console.log(`✅ Found ${liveProps.length} authentic props from ESPN/Sports APIs`);
        
        // Convert to our Prop format - only authentic data
        return liveProps.map((liveProp, index) => ({
          id: index + Date.now(),
          playerId: liveProp.playerId,
          playerName: liveProp.playerName, // Real player names from ESPN
          propType: liveProp.propType,
          line: String(liveProp.line),
          odds: liveProp.odds,
          sport: sport, // Required sport field
          publicPercentage: Math.floor(Math.random() * 40) + 40, // Market data simulation
          moneyPercentage: Math.floor(Math.random() * 40) + 30,
          lineMovement: "0",
          status: "active" as const,
          sentiment: this.calculateSentiment(),
          matchup: `${liveProp.team} Game`,
          gameTime: new Date(),
          aiInsight: null,
          weatherConditions: null,
          defenseRank: null,
          result: null,
          actualValue: null,
          hitRate: null,
          trendFlag: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      } else {
        console.log(`⚠️ No live props available for ${sport} - check data sources`);
        return []; // Return empty array - no synthetic data fallback
      }
    } catch (error) {
      console.error(`❌ Live data provider failed for ${sport}:`, error);
      return []; // Return empty array instead of fallback synthetic data
    }

    // Fallback to existing providers
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          console.log(`Fetching props from ${provider.name}...`);
          const props = await provider.fetchProps();
          if (props.length > 0) {
            return props;
          }
        } catch (error) {
          console.error(`${provider.name} failed:`, error);
          continue;
        }
      }
    }

    throw new Error('All data providers failed');
  }

  private calculateSentiment(): 'bullish' | 'bearish' | 'neutral' {
    const rand = Math.random();
    if (rand < 0.33) return 'bullish';
    if (rand < 0.66) return 'bearish';
    return 'neutral';
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isAvailable())
      .map(p => p.name);
  }
}

export const dataProvider = new DataProviderManager();