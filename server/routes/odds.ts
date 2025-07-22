import express from 'express';
import { sportsbookProvider } from '../sportsbook-providers';

const router = express.Router();

// Get sportsbook API usage stats
router.get('/usage', async (req, res) => {
  try {
    const usage = await sportsbookProvider.getApiUsage();
    res.json(usage);
  } catch (error) {
    console.error('Error fetching API usage:', error);
    res.status(500).json({ error: 'Failed to fetch API usage' });
  }
});

// Get live odds for specific sport
router.get('/live/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const props = await sportsbookProvider.getSportsbookProps(sport.toUpperCase());
    res.json(props);
  } catch (error) {
    console.error(`Error fetching live odds for ${req.params.sport}:`, error);
    res.status(500).json({ error: 'Failed to fetch live odds' });
  }
});

export default router;