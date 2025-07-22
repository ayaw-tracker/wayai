// Firebase Configuration for WAY - Who's Actually Winning
// Handles: User auth, prop history, AI insights, real-time updates

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.GOOGLE_API_KEY,
  authDomain: "wayprojections.firebaseapp.com",
  projectId: "wayprojections",
  storageBucket: "wayprojections.firebasestorage.app",
  messagingSenderId: "900026975792",
  appId: "1:900026975792:web:fd620f1cc1ccc209f48ff5",
  measurementId: "G-NJ6581DTXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Firestore Collections Structure for WAY
export const COLLECTIONS = {
  // Live Props (current session only - cleared daily)
  LIVE_PROPS: 'live_props',
  
  // Historical Data (persistent)
  PROP_HISTORY: 'prop_history',
  AI_INSIGHTS: 'ai_insights',
  AI_QUERIES: 'ai_queries',
  TREND_ALERTS: 'trend_alerts',
  
  // User Data
  USER_PREFERENCES: 'user_preferences',
  USER_SESSIONS: 'user_sessions',
  
  // Analytics
  PROP_PERFORMANCE: 'prop_performance',
  USER_ANALYTICS: 'user_analytics'
} as const;

export default app;