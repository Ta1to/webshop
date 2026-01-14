/**
 * Weekly Newsletter Cloud Function
 * Sends weekly newsletter with active offers to subscribed users
 */

import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { sendNewsletterEmail } from '../utils/emailService.js';

/**
 * Get all active offers from Firestore
 * @returns {Promise<Array>} Array of active offers with product details
 */
const getActiveOffers = async () => {
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    // Get all offers
    const offersSnapshot = await db.collection('offers').get();
    
    const activeOffers = [];
    
    for (const offerDoc of offersSnapshot.docs) {
      const offer = offerDoc.data();
      offer.id = offerDoc.id;
      
      // Check if offer is active
      const startDate = offer.startDate;
      const endDate = offer.endDate;
      
      const isStarted = !startDate || startDate.toMillis() <= now.toMillis();
      const isNotEnded = !endDate || endDate.toMillis() >= now.toMillis();
      
      if (isStarted && isNotEnded) {
        // Get product details
        const productDoc = await db.collection('products').doc(offer.productId).get();
        
        if (productDoc.exists) {
          const product = productDoc.data();
          
          const originalPrice = product.price || 0;
          const discountPercentage = offer.discountPercentage || 0;
          const discountedPrice = originalPrice * (1 - discountPercentage / 100);
          
          activeOffers.push({
            id: offer.id,
            productId: offer.productId,
            productName: product.name || 'Produkt',
            discountPercentage,
            originalPrice: originalPrice.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            startDate: startDate ? startDate.toDate().toISOString() : null,
            endDate: endDate ? endDate.toDate().toISOString() : null
          });
        }
      }
    }
    
    return activeOffers;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error;
  }
};

/**
 * Get all users subscribed to newsletter
 * @returns {Promise<Array>} Array of subscribed users
 */
const getSubscribedUsers = async () => {
  try {
    const db = admin.firestore();
    
    const usersSnapshot = await db
      .collection('users')
      .where('newsletter', '==', true)
      .get();
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    throw error;
  }
};

/**
 * Log newsletter sending attempt
 * @param {string} recipientEmail - Recipient email
 * @param {number} offersCount - Number of offers sent
 * @param {string} status - Status (sent/failed)
 * @param {string} error - Error message if failed
 */
const logNewsletterSent = async (recipientEmail, offersCount, status, error = null) => {
  try {
    const db = admin.firestore();
    
    await db.collection('newsletterLogs').add({
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      type: 'weekly_offers',
      recipientEmail,
      offersCount,
      status,
      error
    });
  } catch (logError) {
    console.error('Error logging newsletter:', logError);
  }
};

/**
 * Send weekly newsletter to all subscribed users
 * Scheduled to run every Monday at 9:00 AM (Europe/Berlin timezone)
 */
export const sendWeeklyNewsletter = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 * * 1') // Every Monday at 9:00 AM
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    try {
      console.log('Starting weekly newsletter sending...');
      
      // Get active offers
      const activeOffers = await getActiveOffers();
      console.log(`Found ${activeOffers.length} active offers`);
      
      // Get subscribed users
      const subscribedUsers = await getSubscribedUsers();
      console.log(`Found ${subscribedUsers.length} subscribed users`);
      
      if (subscribedUsers.length === 0) {
        console.log('No subscribed users found. Exiting.');
        return null;
      }
      
      // Send emails to all subscribed users
      const results = {
        sent: 0,
        failed: 0,
        errors: []
      };
      
      // Process in batches to avoid overwhelming the email service
      const BATCH_SIZE = 10;
      const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
      
      for (let i = 0; i < subscribedUsers.length; i += BATCH_SIZE) {
        const batch = subscribedUsers.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (user) => {
          try {
            await sendNewsletterEmail({
              to: user.email,
              userName: user.displayName || user.email.split('@')[0],
              offers: activeOffers,
              userId: user.id
            });
            
            await logNewsletterSent(user.email, activeOffers.length, 'sent');
            results.sent++;
            
            console.log(`Newsletter sent to: ${user.email}`);
          } catch (error) {
            console.error(`Failed to send newsletter to ${user.email}:`, error);
            results.failed++;
            results.errors.push({
              email: user.email,
              error: error.message
            });
            
            await logNewsletterSent(user.email, activeOffers.length, 'failed', error.message);
          }
        });
        
        await Promise.all(batchPromises);
        
        // Wait between batches to avoid rate limiting
        if (i + BATCH_SIZE < subscribedUsers.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
      
      console.log('Weekly newsletter sending completed:', results);
      
      return {
        success: true,
        totalOffers: activeOffers.length,
        totalRecipients: subscribedUsers.length,
        sent: results.sent,
        failed: results.failed
      };
    } catch (error) {
      console.error('Error in sendWeeklyNewsletter:', error);
      throw error;
    }
  });
