/**
 * Firebase Cloud Functions Entry Point
 * Main index file that exports all cloud functions
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import newsletter functions
export { 
  sendWeeklyNewsletter,
 
} from './src/newsletter/weeklyOffers.js';

// Import notification functions
export { 
  onOrderStatusChange,
  onUserCreate,
} from './src/notifications/orderStatusChanged.js';
