// Sports Calendar Intelligence - provides context about why games/props might be limited

export interface SportSeasonInfo {
  sport: string;
  isInSeason: boolean;
  seasonPhase: 'preseason' | 'regular' | 'playoffs' | 'offseason';
  nextGameDate?: string;
  contextMessage: string;
}

export class SportsCalendar {
  
  static getCurrentSeasonInfo(sport: string): SportSeasonInfo {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    
    switch (sport.toUpperCase()) {
      case 'NFL':
        return this.getNFLSeasonInfo(month, day);
      case 'NBA':
        return this.getNBASeasonInfo(month, day);
      case 'MLB':
        return this.getMLBSeasonInfo(month, day);
      default:
        return {
          sport,
          isInSeason: false,
          seasonPhase: 'offseason',
          contextMessage: `${sport} season information not available`
        };
    }
  }

  private static getNFLSeasonInfo(month: number, day: number): SportSeasonInfo {
    // NFL: September to February
    if (month >= 9 || month <= 2) {
      if (month === 2 && day > 15) {
        return {
          sport: 'NFL',
          isInSeason: false,
          seasonPhase: 'offseason',
          contextMessage: 'NFL season ended in February. Next season starts in September with preseason games.'
        };
      }
      
      if (month >= 1 && month <= 2) {
        return {
          sport: 'NFL',
          isInSeason: true,
          seasonPhase: 'playoffs',
          contextMessage: 'NFL playoffs season - limited games with intense betting action on conference championships and Super Bowl.'
        };
      }
      
      return {
        sport: 'NFL',
        isInSeason: true,
        seasonPhase: 'regular',
        contextMessage: 'NFL regular season active - peak prop betting season with games Thursday, Sunday, and Monday.'
      };
    }
    
    if (month >= 7 && month <= 8) {
      return {
        sport: 'NFL',
        isInSeason: true,
        seasonPhase: 'preseason',
        contextMessage: 'NFL preseason - limited prop betting markets as teams evaluate rosters and rest starters.'
      };
    }
    
    return {
      sport: 'NFL',
      isInSeason: false,
      seasonPhase: 'offseason',
      contextMessage: 'NFL offseason - no active games. Peak betting season returns in September.'
    };
  }

  private static getNBASeasonInfo(month: number, day: number): SportSeasonInfo {
    // NBA: October to June
    if (month >= 10 || month <= 6) {
      if (month >= 4 && month <= 6) {
        return {
          sport: 'NBA',
          isInSeason: true,
          seasonPhase: 'playoffs',
          contextMessage: 'NBA playoffs season - fewer games but higher stakes betting with conference finals and NBA Finals.'
        };
      }
      
      return {
        sport: 'NBA',
        isInSeason: true,
        seasonPhase: 'regular',
        contextMessage: 'NBA regular season active - high-volume prop betting with games nearly every day.'
      };
    }
    
    return {
      sport: 'NBA',
      isInSeason: false,
      seasonPhase: 'offseason',
      contextMessage: 'NBA offseason - no active games. Season returns in October with preseason, regular season starts late October.'
    };
  }

  private static getMLBSeasonInfo(month: number, day: number): SportSeasonInfo {
    // MLB: March/April to October/November
    if (month >= 3 && month <= 11) {
      if (month >= 10 || (month === 11 && day <= 15)) {
        return {
          sport: 'MLB',
          isInSeason: true,
          seasonPhase: 'playoffs',
          contextMessage: 'MLB playoffs season - limited games but intense betting focus on Division Series, Championship Series, and World Series.'
        };
      }
      
      if (month === 3) {
        return {
          sport: 'MLB',
          isInSeason: true,
          seasonPhase: 'preseason',
          contextMessage: 'MLB Spring Training - limited prop betting as teams prepare for regular season in early April.'
        };
      }
      
      return {
        sport: 'MLB',
        isInSeason: true,
        seasonPhase: 'regular',
        contextMessage: 'MLB regular season active - daily games provide consistent prop betting opportunities with 162-game schedule.'
      };
    }
    
    return {
      sport: 'MLB',
      isInSeason: false,
      seasonPhase: 'offseason',
      contextMessage: 'MLB offseason - no active games. Spring Training starts in March, regular season begins in April.'
    };
  }

  static getActiveLeaguesMessage(): string {
    const nfl = this.getCurrentSeasonInfo('NFL');
    const nba = this.getCurrentSeasonInfo('NBA');
    const mlb = this.getCurrentSeasonInfo('MLB');
    
    const activeLeagues = [nfl, nba, mlb].filter(league => league.isInSeason);
    
    if (activeLeagues.length === 0) {
      return 'All major sports are currently in offseason. This is typical during summer months (June-August).';
    }
    
    const activeNames = activeLeagues.map(league => `${league.sport} (${league.seasonPhase})`).join(', ');
    return `Currently active: ${activeNames}. Limited props may indicate scheduled rest days or between-series gaps.`;
  }
}