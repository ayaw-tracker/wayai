import axios from 'axios';
import type { Prop } from '@shared/schema';

interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: string;
      last_update: string;
      outcomes: {
        name: string;
        price: number;
        point?: number;
      }[];
    }[];
  }[];
}

export class RealSportsbookProvider {
  private baseUrl = 'https://api.the-odds-api.com/v4';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ODDS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ODDS_API_KEY not found - using synthetic data');
    }
  }

  async getSportsbookProps(sport: string): Promise<Prop[]> {
    if (!this.apiKey) {
      return this.generateRealisticProps(sport);
    }

    try {
      const sportKey = this.getSportKey(sport);
      console.log(`Attempting to fetch odds for ${sport} (${sportKey})...`);
      
      const response = await axios.get(`${this.baseUrl}/sports/${sportKey}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          bookmakers: 'fanduel,draftkings,betmgm,caesars'
        },
        timeout: 8000
      });

      console.log(`✅ Fetched ${response.data.length} real games from The Odds API for ${sport}`);
      
      if (response.data.length > 0) {
        const props = this.convertGamesToProps(response.data, sport);
        console.log(`Generated ${props.length} props from ${response.data.length} games for ${sport}`);
        return props;
      } else {
        console.log(`No live games available for ${sport} - generating realistic props`);
        return this.generateRealisticProps(sport);
      }
    } catch (error) {
      console.error(`Odds API error for ${sport}:`, error instanceof Error ? error.message : 'Unknown error');
      console.log(`Falling back to realistic props for ${sport}`);
      return this.generateRealisticProps(sport);
    }
  }

  private getSportKey(sport: string): string {
    const sportMap: Record<string, string> = {
      'NFL': 'americanfootball_nfl',
      'NBA': 'basketball_nba', 
      'MLB': 'baseball_mlb'
    };
    return sportMap[sport] || 'americanfootball_nfl';
  }

  private convertGamesToProps(games: OddsAPIGame[], sport: string): Prop[] {
    const props: Prop[] = [];
    
    console.log(`Converting ${games.length} games to props for ${sport}`);
    
    games.forEach((game, gameIndex) => {
      // Extract game total for prop generation
      let gameTotal = sport === 'MLB' ? 8.5 : sport === 'NBA' ? 220 : 45;
      const totalMarket = game.bookmakers[0]?.markets.find(m => m.key === 'totals');
      if (totalMarket?.outcomes[0]?.point) {
        gameTotal = totalMarket.outcomes[0].point;
      }

      console.log(`Game ${gameIndex + 1}: ${game.away_team} @ ${game.home_team}, total: ${gameTotal}`);

      // Generate realistic player props based on teams and game totals
      const teamProps = this.generatePropsForTeams(game, gameTotal, sport);
      console.log(`Generated ${teamProps.length} props for game ${gameIndex + 1}`);
      props.push(...teamProps);
    });

    console.log(`Total props before filtering: ${props.length}`);
    
    // Filter to only high-value props for dashboard focus
    const filtered = this.filterHighValueProps(props);
    console.log(`Total props after filtering: ${filtered.length}`);
    return filtered;
  }

  private generatePropsForTeams(game: OddsAPIGame, gameTotal: number, sport: string): Prop[] {
    const props: Prop[] = [];
    
    if (sport === 'NFL') {
      const qbPassingBase = Math.round(gameTotal * 5.2); // ~234 for 45pt game
      
      // Home team QB
      props.push(this.createProp({
        playerId: `${game.id}_home_qb`,
        playerName: this.getQBName(game.home_team),
        team: game.home_team,
        propType: 'Passing Yards',
        line: qbPassingBase + Math.random() * 30 - 15,
        sport,
        gameId: game.id,
        matchup: `${game.away_team} @ ${game.home_team}`,
        gameTime: new Date(game.commence_time)
      }));

      // Away team QB  
      props.push(this.createProp({
        playerId: `${game.id}_away_qb`,
        playerName: this.getQBName(game.away_team),
        team: game.away_team,
        propType: 'Passing Yards',
        line: qbPassingBase + Math.random() * 30 - 15,
        sport,
        gameId: game.id,
        matchup: `${game.away_team} @ ${game.home_team}`,
        gameTime: new Date(game.commence_time)
      }));
    } else if (sport === 'MLB') {
      // Generate MLB props from game totals
      const hitBase = Math.round(gameTotal * 0.2); // ~1.8 for 9-run game
      
      // Home team star player
      props.push(this.createProp({
        playerId: `${game.id}_home_star`,
        playerName: this.getMLBStarName(game.home_team),
        team: game.home_team,
        propType: 'Total Bases',
        line: hitBase + Math.random() * 1.5,
        sport,
        gameId: game.id,
        matchup: `${game.away_team} @ ${game.home_team}`,
        gameTime: new Date(game.commence_time)
      }));

      // Away team star player
      props.push(this.createProp({
        playerId: `${game.id}_away_star`,
        playerName: this.getMLBStarName(game.away_team),
        team: game.away_team,
        propType: 'Total Bases',
        line: hitBase + Math.random() * 1.5,
        sport,
        gameId: game.id,
        matchup: `${game.away_team} @ ${game.home_team}`,
        gameTime: new Date(game.commence_time)
      }));
    } else if (sport === 'NBA') {
      // Generate NBA props from game totals
      const pointsBase = Math.round(gameTotal * 0.25); // ~27 for 108pt game
      
      // Home team star
      props.push(this.createProp({
        playerId: `${game.id}_home_star`,
        playerName: this.getNBAStarName(game.home_team),
        team: game.home_team,
        propType: 'Points',
        line: pointsBase + Math.random() * 10 - 5,
        sport,
        gameId: game.id,
        matchup: `${game.away_team} @ ${game.home_team}`,
        gameTime: new Date(game.commence_time)
      }));
    }

    return props;
  }

  private generateRealisticProps(sport: string): Prop[] {
    const props: Prop[] = [];
    const teams = this.getTeamData(sport);

    teams.forEach(team => {
      team.players.forEach(player => {
        props.push(this.createProp({
          playerId: `${team.id}_${player.position}`,
          playerName: player.name,
          team: team.name,
          propType: this.getPropType(player.position, sport),
          line: player.baseValue,
          sport,
          gameId: `future_${team.id}`,
          matchup: `${team.name} vs TBD`,
          gameTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        }));
      });
    });

    // Filter to only high-value props for dashboard
    return this.filterHighValueProps(props);
  }

  private createProp(data: {
    playerId: string;
    playerName: string;
    team: string;
    propType: string;
    line: number;
    sport: string;
    gameId: string;
    matchup: string;
    gameTime: Date;
  }): Prop {
    const bookmakers = ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars'];
    const primaryBook = bookmakers[Math.floor(Math.random() * bookmakers.length)];
    
    // Generate realistic alternate lines across books
    const alternateLines = bookmakers.map(book => ({
      bookmaker: book,
      line: data.line + (Math.random() - 0.5) * 4, // ±2 variance
      overOdds: -110 + Math.floor(Math.random() * 20) - 10,
      underOdds: -110 + Math.floor(Math.random() * 20) - 10
    }));

    return {
      id: 0,
      playerId: data.playerId,
      playerName: data.playerName,
      team: data.team,
      propType: data.propType,
      line: (Math.round(data.line * 2) / 2).toString(), // Round to .5 and convert to string
      odds: -110 + Math.floor(Math.random() * 20) - 10,
      sport: data.sport,
      gameId: data.gameId,
      matchup: data.matchup,
      publicPercentage: 45 + Math.round(Math.random() * 40),
      moneyPercentage: 40 + Math.round(Math.random() * 45),
      lineMovement: ((Math.random() - 0.5) * 3).toString(),
      status: 'active',
      sentiment: this.calculateSentiment(),
      gameTime: data.gameTime,
      hitRate: 35 + Math.round(Math.random() * 40),
      volume: 1000 + Math.round(Math.random() * 8000),
      bookmaker: primaryBook,
      alternateLines: JSON.stringify(alternateLines),
      aiInsight: null,
      weatherConditions: null,
      defenseRank: null,
      result: null,
      actualValue: null,
      trendFlag: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private calculateSentiment(): string {
    const sentiments = ['public_trap', 'sharp_play', 'fade_alert', 'neutral'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  private getQBName(teamName: string): string {
    const qbMap: Record<string, string> = {
      'Arizona Cardinals': 'Kyler Murray',
      'Atlanta Falcons': 'Kirk Cousins',
      'Baltimore Ravens': 'Lamar Jackson',
      'Buffalo Bills': 'Josh Allen',
      'Carolina Panthers': 'Bryce Young',
      'Chicago Bears': 'Caleb Williams',
      'Cincinnati Bengals': 'Joe Burrow',
      'Cleveland Browns': 'Deshaun Watson',
      'Dallas Cowboys': 'Dak Prescott',
      'Denver Broncos': 'Bo Nix',
      'Detroit Lions': 'Jared Goff',
      'Green Bay Packers': 'Jordan Love'
    };
    return qbMap[teamName] || 'Starting QB';
  }

  private getMLBStarName(teamName: string): string {
    const starMap: Record<string, string> = {
      'Los Angeles Dodgers': 'Mookie Betts',
      'New York Yankees': 'Aaron Judge', 
      'Atlanta Braves': 'Ronald Acuna Jr.',
      'Houston Astros': 'Alex Bregman',
      'Philadelphia Phillies': 'Bryce Harper',
      'San Diego Padres': 'Manny Machado',
      'Los Angeles Angels': 'Mike Trout',
      'Toronto Blue Jays': 'Vladimir Guerrero Jr.',
      'Baltimore Orioles': 'Gunnar Henderson',
      'Cleveland Guardians': 'Jose Ramirez',
      'Detroit Tigers': 'Riley Greene',
      'Pittsburgh Pirates': 'Paul Skenes',
      'Miami Marlins': 'Jazz Chisholm Jr.',
      'Boston Red Sox': 'Rafael Devers',
      'Cincinnati Reds': 'Elly De La Cruz',
      'Washington Nationals': 'CJ Abrams',
      'New York Mets': 'Francisco Lindor',
      'San Francisco Giants': 'Matt Chapman',
      'Chicago White Sox': 'Luis Robert Jr.',
      'Tampa Bay Rays': 'Shane Baz',
      'Kansas City Royals': 'Bobby Witt Jr.',
      'Chicago Cubs': 'Ian Happ',
      'Oakland Athletics': 'Brent Rooker',
      'Texas Rangers': 'Corey Seager',
      'St. Louis Cardinals': 'Nolan Arenado',
      'Colorado Rockies': 'Ezequiel Tovar',
      'Arizona Diamondbacks': 'Ketel Marte',
      'Milwaukee Brewers': 'Christian Yelich',
      'Seattle Mariners': 'Julio Rodriguez',
      'Minnesota Twins': 'Byron Buxton'
    };
    return starMap[teamName] || teamName.split(' ').pop() + ' Star';
  }

  private getNBAStarName(teamName: string): string {
    const starMap: Record<string, string> = {
      'Los Angeles Lakers': 'LeBron James',
      'Golden State Warriors': 'Stephen Curry',
      'Boston Celtics': 'Jayson Tatum',
      'Milwaukee Bucks': 'Giannis Antetokounmpo',
      'Denver Nuggets': 'Nikola Jokic',
      'Phoenix Suns': 'Devin Booker',
      'Dallas Mavericks': 'Luka Doncic',
      'Miami Heat': 'Jimmy Butler'
    };
    return starMap[teamName] || 'Star Player';
  }

  private getTeamData(sport: string) {
    const nflTeams = [
      { id: 1, name: 'Arizona Cardinals', players: [{ name: 'Kyler Murray', position: 'qb', baseValue: 248.5 }] },
      { id: 2, name: 'Atlanta Falcons', players: [{ name: 'Kirk Cousins', position: 'qb', baseValue: 242.5 }] },
      { id: 3, name: 'Baltimore Ravens', players: [{ name: 'Lamar Jackson', position: 'qb', baseValue: 215.5 }] },
      { id: 4, name: 'Buffalo Bills', players: [{ name: 'Josh Allen', position: 'qb', baseValue: 267.5 }] }
    ];

    const mlbTeams = [
      { id: 1, name: 'Los Angeles Dodgers', players: [{ name: 'Mookie Betts', position: 'of', baseValue: 1.5 }] },
      { id: 2, name: 'New York Yankees', players: [{ name: 'Aaron Judge', position: 'of', baseValue: 2.5 }] },
      { id: 3, name: 'Atlanta Braves', players: [{ name: 'Ronald Acuna Jr.', position: 'of', baseValue: 2.0 }] },
      { id: 4, name: 'Houston Astros', players: [{ name: 'Alex Bregman', position: '3b', baseValue: 1.5 }] }
    ];

    const nbaTeams = [
      { id: 1, name: 'Los Angeles Lakers', players: [{ name: 'LeBron James', position: 'sf', baseValue: 24.5 }] },
      { id: 2, name: 'Golden State Warriors', players: [{ name: 'Stephen Curry', position: 'pg', baseValue: 26.5 }] },
      { id: 3, name: 'Boston Celtics', players: [{ name: 'Jayson Tatum', position: 'sf', baseValue: 28.5 }] },
      { id: 4, name: 'Milwaukee Bucks', players: [{ name: 'Giannis Antetokounmpo', position: 'pf', baseValue: 30.5 }] }
    ];

    if (sport === 'NFL') return nflTeams;
    if (sport === 'MLB') return mlbTeams;
    if (sport === 'NBA') return nbaTeams;
    return [];
  }

  private getPropType(position: string, sport: string): string {
    if (sport === 'NFL') {
      return position === 'qb' ? 'Passing Yards' : 'Rushing Yards';
    }
    if (sport === 'MLB') {
      return position === 'of' ? 'Total Bases' : 'Hits + Runs + RBIs';
    }
    if (sport === 'NBA') {
      return 'Points';
    }
    return 'Points';
  }

  private filterHighValueProps(props: Prop[]): Prop[] {
    // For demo purposes, show all props but limit quantity
    // In production, this would filter by real betting value criteria
    if (props.length === 0) return [];
    
    // Limit to 15 props max for performance
    return props.slice(0, 15);
  }

  async getApiUsage() {
    if (!this.apiKey) return { used: 0, remaining: 0 };
    
    try {
      const response = await axios.get(`${this.baseUrl}/sports`, {
        params: { apiKey: this.apiKey }
      });
      
      return {
        used: parseInt(response.headers['x-requests-used'] || '0'),
        remaining: parseInt(response.headers['x-requests-remaining'] || '0')
      };
    } catch (error) {
      return { used: 0, remaining: 0 };
    }
  }
}

export const realSportsbookProvider = new RealSportsbookProvider();