/**
 * Order Status Change Notification
 * Triggers when order status changes and sends email notification
 */

import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { sendOrderStatusEmail } from '../utils/emailService.js';

/**
 * Get user details by ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} User data
 */
const getUserById = async (userId) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error(`User not found: ${userId}`);
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Log order notification
 * @param {string} orderId - Order ID
 * @param {string} recipientEmail - Recipient email
 * @param {string} status - Order status
 * @param {string} result - Result (sent/failed)
 * @param {string} error - Error message if failed
 */
const logOrderNotification = async (orderId, recipientEmail, status, result, error = null) => {
  try {
    const db = admin.firestore();
    
    await db.collection('notificationLogs').add({
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      type: 'order_status',
      recipientEmail,
      orderId,
      orderStatus: status,
      status: result,
      error
    });
  } catch (logError) {
    console.error('Error logging order notification:', logError);
  }
};

/**
 * Firestore trigger: Send email when order status changes
 * Triggers on any update to orders collection documents
 */
export const onOrderStatusChange = functions
  .region('europe-west1')
  .firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    try {
      const orderId = context.params.orderId;
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      // Check if status has changed
      const oldStatus = beforeData.status;
      const newStatus = afterData.status;
      
      if (oldStatus === newStatus) {
        console.log(`No status change for order ${orderId}. Skipping notification.`);
        return null;
      }
      
      console.log(`Order ${orderId} status changed: ${oldStatus} -> ${newStatus}`);
      
      // Only send emails for specific status changes
      const notifiableStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!notifiableStatuses.includes(newStatus)) {
        console.log(`Status ${newStatus} is not notifiable. Skipping.`);
        return null;
      }
      
      // Get user details
      const user = await getUserById(afterData.userId);
      
      if (!user.email) {
        console.error(`User ${afterData.userId} has no email address`);
        return null;
      }
      
      // Prepare order data for email
      const orderData = {
        id: orderId,
        items: afterData.items || [],
        total: afterData.total || afterData.totalAmount || 0,
        shippingAddress: afterData.shippingAddress || {},
        trackingNumber: afterData.trackingNumber || null
      };
      
      // Send email notification
      try {
        await sendOrderStatusEmail({
          to: user.email,
          userName: user.displayName || user.email.split('@')[0],
          status: newStatus,
          order: orderData
        });
        
        await logOrderNotification(orderId, user.email, newStatus, 'sent');
        
        console.log(`Order status email sent to ${user.email} for order ${orderId}`);
        
        return {
          success: true,
          orderId,
          recipient: user.email,
          status: newStatus
        };
      } catch (emailError) {
        console.error(`Failed to send order status email for ${orderId}:`, emailError);
        
        await logOrderNotification(orderId, user.email, newStatus, 'failed', emailError.message);
        
        // Don't throw error - just log it
        return {
          success: false,
          error: emailError.message
        };
      }
    } catch (error) {
      console.error('Error in onOrderStatusChange:', error);
      throw error;
    }
  });

/**
 * Firestore trigger: Send welcome email when new user is created
 * Optional: Send welcome email to new users
 */
export const onUserCreate = functions
  .region('europe-west1')
  .firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    try {
      const userId = context.params.userId;
      const userData = snap.data();
      
      console.log(`New user created: ${userId}`);
      
      if (!userData.email) {
        console.log('User has no email. Skipping welcome email.');
        return null;
      }
      
      // Import sendWelcomeEmail
      const { sendWelcomeEmail } = await import('../utils/emailService.js');
      
      try {
        await sendWelcomeEmail({
          to: userData.email,
          userName: userData.displayName || userData.email.split('@')[0]
        });
        
        console.log(`Welcome email sent to ${userData.email}`);
        
        return {
          success: true,
          userId,
          email: userData.email
        };
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${userData.email}:`, emailError);
        
        return {
          success: false,
          error: emailError.message
        };
      }
    } catch (error) {
      console.error('Error in onUserCreate:', error);
      throw error;
    }
  });
