// WAY Scraper API Routes
// Provides endpoints for manual scraper control and status monitoring

import { Router } from 'express';
import { scraperScheduler } from '../scraper-scheduler';
import { propLineScraper } from '../prop-line-scraper';
import { sentimentScraper } from '../sentiment-scraper';

const router = Router();

// Get scraper status and scheduling info
router.get('/status', async (req, res) => {
  try {
    const status = scraperScheduler.getStatus();
    
    res.json({
      success: true,
      data: {
        ...status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: process.memoryUsage()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Trigger immediate comprehensive scraping
router.post('/trigger', async (req, res) => {
  try {
    console.log('📡 API: Manual scraping triggered');
    
    const results = await scraperScheduler.triggerImmediateScraping();
    
    res.json({
      success: true,
      message: 'Immediate scraping completed',
      data: {
        propsScraped: results.props,
        sentimentPointsCollected: results.sentiment,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ API: Manual scraping failed:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Scraping failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Trigger prop scraping only
router.post('/props', async (req, res) => {
  try {
    console.log('📊 API: Manual prop scraping triggered');
    
    const props = await propLineScraper.scrapeAllSources();
    
    res.json({
      success: true,
      message: 'Prop scraping completed',
      data: {
        propsScraped: props.length,
        sources: [...new Set(props.map(p => p.source))],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ API: Prop scraping failed:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Prop scraping failed'
    });
  }
});

// Trigger sentiment analysis only
router.post('/sentiment', async (req, res) => {
  try {
    console.log('🔍 API: Manual sentiment analysis triggered');
    
    const [redditData, twitterData, tailingAlerts] = await Promise.all([
      sentimentScraper.scrapeRedditSentiment(),
      sentimentScraper.scrapeTwitterSentiment(),
      sentimentScraper.analyzeTailingPatterns()
    ]);
    
    res.json({
      success: true,
      message: 'Sentiment analysis completed',
      data: {
        redditSentimentPoints: redditData.length,
        twitterSentimentPoints: twitterData.length,
        tailingAlerts: tailingAlerts.length,
        totalSentimentPoints: redditData.length + twitterData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ API: Sentiment analysis failed:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Sentiment analysis failed'
    });
  }
});

// Update scraping frequency (peak/off-peak)
router.post('/frequency', async (req, res) => {
  try {
    scraperScheduler.updateSchedulingFrequency();
    
    res.json({
      success: true,
      message: 'Scraping frequency updated',
      data: {
        newStatus: scraperScheduler.getStatus(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update frequency'
    });
  }
});

// Get recent scraping history
router.get('/history', async (req, res) => {
  try {
    // This would query Firebase for recent scraping sessions
    // For now, return current status
    const status = scraperScheduler.getStatus();
    
    res.json({
      success: true,
      message: 'Scraping history retrieved',
      data: {
        currentSession: status.currentSession,
        recentSessions: [], // Would be populated from Firebase
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve history'
    });
  }
});

// Health check for scraper system
router.get('/health', async (req, res) => {
  try {
    const status = scraperScheduler.getStatus();
    const isHealthy = !status.isRunning || status.currentSession?.status !== 'failed';
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      health: isHealthy ? 'healthy' : 'degraded',
      data: {
        scraperRunning: status.isRunning,
        isPeakTime: status.isPeakTime,
        lastError: status.currentSession?.errors?.[0] || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      health: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router;