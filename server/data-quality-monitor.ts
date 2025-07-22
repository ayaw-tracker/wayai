// Real-time data quality monitoring and diagnostics for WAY
import type { Prop } from "@shared/schema";

export interface DataQualityMetrics {
  timestamp: Date;
  sources: {
    [key: string]: {
      totalGamesFound: number;
      propsExtracted: number;
      extractionRate: number;
      responseTime: number;
      status: 'healthy' | 'degraded' | 'failed';
      errors: string[];
    }
  };
  aggregateStats: {
    totalProps: number;
    activeSources: number;
    averageResponseTime: number;
    overallHealth: 'healthy' | 'degraded' | 'failed';
  };
}

export class DataQualityMonitor {
  private metrics: DataQualityMetrics = {
    timestamp: new Date(),
    sources: {},
    aggregateStats: {
      totalProps: 0,
      activeSources: 0,
      averageResponseTime: 0,
      overallHealth: 'healthy'
    }
  };

  // Track source performance in real-time
  recordSourceMetrics(sourceName: string, gamesFound: number, propsExtracted: number, responseTime: number, errors: string[] = []) {
    const extractionRate = gamesFound > 0 ? (propsExtracted / gamesFound) * 100 : 0;
    const status = errors.length > 0 ? 'failed' : 
                   extractionRate < 50 ? 'degraded' : 'healthy';

    this.metrics.sources[sourceName] = {
      totalGamesFound: gamesFound,
      propsExtracted,
      extractionRate,
      responseTime,
      status,
      errors
    };

    this.updateAggregateStats();
    this.metrics.timestamp = new Date();
  }

  private updateAggregateStats() {
    const sources = Object.values(this.metrics.sources);
    this.metrics.aggregateStats = {
      totalProps: sources.reduce((sum, source) => sum + source.propsExtracted, 0),
      activeSources: sources.filter(s => s.status !== 'failed').length,
      averageResponseTime: sources.reduce((sum, source) => sum + source.responseTime, 0) / sources.length || 0,
      overallHealth: this.calculateOverallHealth(sources)
    };
  }

  private calculateOverallHealth(sources: any[]): 'healthy' | 'degraded' | 'failed' {
    const healthyCount = sources.filter(s => s.status === 'healthy').length;
    const totalCount = sources.length;
    
    if (totalCount === 0) return 'failed';
    if (healthyCount === 0) return 'failed';
    if (healthyCount / totalCount >= 0.7) return 'healthy';
    return 'degraded';
  }

  // Get diagnostic insights for specific issues
  getDiagnostics(): {
    criticalIssues: string[];
    recommendations: string[];
    performanceInsights: string[];
  } {
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    const performanceInsights: string[] = [];

    Object.entries(this.metrics.sources).forEach(([sourceName, metrics]) => {
      if (metrics.status === 'failed') {
        criticalIssues.push(`${sourceName}: Complete failure - ${metrics.errors.join(', ')}`);
      }
      
      if (metrics.extractionRate < 30 && metrics.totalGamesFound > 0) {
        criticalIssues.push(`${sourceName}: Low extraction rate ${metrics.extractionRate.toFixed(1)}% (${metrics.propsExtracted}/${metrics.totalGamesFound} games)`);
        recommendations.push(`Investigate ${sourceName} parsing logic - may be missing nested data structures`);
      }

      if (metrics.responseTime > 1000) {
        performanceInsights.push(`${sourceName}: Slow response time ${metrics.responseTime}ms - consider caching or rate limiting`);
      }

      if (metrics.totalGamesFound > 10 && metrics.propsExtracted < 5) {
        recommendations.push(`${sourceName}: Found ${metrics.totalGamesFound} games but only ${metrics.propsExtracted} props - check endpoint depth`);
      }
    });

    return { criticalIssues, recommendations, performanceInsights };
  }

  getCurrentMetrics(): DataQualityMetrics {
    return { ...this.metrics };
  }

  // Generate actionable insights for feed improvement
  getActionableInsights(): string[] {
    const insights: string[] = [];
    const diagnostics = this.getDiagnostics();

    if (diagnostics.criticalIssues.length > 0) {
      insights.push(`🔴 CRITICAL: ${diagnostics.criticalIssues.length} source(s) failing`);
    }

    if (this.metrics.aggregateStats.totalProps < 10) {
      insights.push(`📊 LOW COVERAGE: Only ${this.metrics.aggregateStats.totalProps} props across all sources`);
    }

    if (this.metrics.aggregateStats.averageResponseTime > 800) {
      insights.push(`⏱️ PERFORMANCE: Average response time ${this.metrics.aggregateStats.averageResponseTime.toFixed(0)}ms`);
    }

    return insights;
  }
}

export const dataQualityMonitor = new DataQualityMonitor();