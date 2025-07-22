// Test script to validate live data sources
import { socialSentimentProvider } from './social-sentiment-providers.js';
import { liveDataProvider } from './live-data-providers.js';

async function testLiveDataSources() {
  console.log('🔍 Testing WAY Live Data Sources...\n');
  
  // Test 1: Reddit API Access
  console.log('1. Testing Reddit API Access:');
  try {
    const picks = await socialSentimentProvider.fetchRedditSentiment('NFL');
    console.log(`✅ Reddit API: Retrieved ${picks.length} picks`);
    
    if (picks.length > 0) {
      const firstPick = picks[0];
      console.log(`   - Sample pick: "${firstPick.content}" by ${firstPick.author}`);
      console.log(`   - Confidence: ${firstPick.confidence}, Engagement: ${firstPick.engagement}`);
      console.log(`   - Sport: ${firstPick.sport}, Bet Type: ${firstPick.betType}`);
    }
  } catch (error) {
    console.log(`❌ Reddit API failed: ${error}`);
  }
  
  // Test 2: Tailing Sentiment Analysis
  console.log('\n2. Testing Tailing Sentiment Analysis:');
  try {
    const sentiment = await socialSentimentProvider.generateTailingSentiment('NFL');
    console.log(`✅ Sentiment Analysis: Generated ${sentiment.length} tailing insights`);
    
    const riskLevels = sentiment.map(s => s.riskLevel);
    const overtailed = riskLevels.filter(r => r === 'overtailed').length;
    const consensus = riskLevels.filter(r => r === 'consensus').length;
    const contrarian = riskLevels.filter(r => r === 'contrarian').length;
    
    console.log(`   - Overtailed: ${overtailed}, Consensus: ${consensus}, Contrarian: ${contrarian}`);
    
    if (sentiment.length > 0) {
      const sample = sentiment[0];
      console.log(`   - Sample: ${sample.player} ${sample.propType} (${sample.tailRate}% tailed, ${sample.riskLevel})`);
    }
  } catch (error) {
    console.log(`❌ Sentiment Analysis failed: ${error}`);
  }
  
  // Test 3: Sports API Health Check
  console.log('\n3. Testing Sports API Health:');
  try {
    const health = await liveDataProvider.checkDataSourceHealth();
    console.log(`✅ Sports APIs Health Check: ${health.timestamp}`);
    console.log(`   - ESPN NFL: ${health.espnNFL ? '✅' : '❌'}`);
    console.log(`   - ESPN NBA: ${health.espnNBA ? '✅' : '❌'}`);
    console.log(`   - ESPN MLB: ${health.espnMLB ? '✅' : '❌'}`);
    console.log(`   - NBA Stats: ${health.nbaStats ? '✅' : '❌'}`);
    console.log(`   - MLB Stats: ${health.mlbStats ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`❌ Sports API Health Check failed: ${error}`);
  }
  
  // Test 4: Live Props Generation
  console.log('\n4. Testing Live Props Generation:');
  try {
    const props = await liveDataProvider.generateLiveProps('NFL');
    console.log(`✅ Live Props: Generated ${props.length} props`);
    
    if (props.length > 0) {
      const sample = props[0];
      console.log(`   - Sample: ${sample.playerName} ${sample.propType} ${sample.line} (${sample.odds})`);
    }
  } catch (error) {
    console.log(`❌ Live Props Generation failed: ${error}`);
  }
  
  console.log('\n🎯 Live Data Validation Complete!');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLiveDataSources().catch(console.error);
}

export { testLiveDataSources };