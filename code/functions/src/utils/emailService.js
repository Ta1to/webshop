/**
 * Email Service using Gmail SMTP
 * Handles sending emails via Nodemailer
 */

import nodemailer from 'nodemailer';
import { createHmac } from 'crypto';
import Handlebars from 'handlebars';
import { baseTemplate } from './emailTemplates.js';

/**
 * Create nodemailer transporter with Gmail SMTP
 */
export const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
};

/**
 * Compile email template with Handlebars
 * @param {string} bodyTemplate - Email body HTML template
 * @param {object} data - Data to inject into template
 * @returns {string} Compiled HTML
 */
export const compileEmailTemplate = (bodyTemplate, data) => {
  const baseCompiledTemplate = Handlebars.compile(baseTemplate);
  const bodyCompiledTemplate = Handlebars.compile(bodyTemplate);
  
  const compiledBody = bodyCompiledTemplate(data);
  
  const fullData = {
    ...data,
    body: compiledBody,
    appName: process.env.APP_NAME || 'WebShop',
    appUrl: process.env.APP_URL || 'https://your-domain.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@your-domain.com'
  };
  
  return baseCompiledTemplate(fullData);
};

/**
 * Send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<object>} Send result
 */
export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || `${process.env.APP_NAME || 'WebShop'} <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject
    });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generate a signed unsubscribe token to prevent IDOR attacks.
 * Token = HMAC-SHA256(userId, UNSUBSCRIBE_SECRET), hex-encoded.
 * @param {string} userId
 * @returns {string}
 */
const generateUnsubscribeToken = (userId) => {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error('UNSUBSCRIBE_SECRET environment variable is not set.');
  }
  return createHmac('sha256', secret).update(userId).digest('hex');
};

/**
 * Send newsletter email
 * @param {object} options - Newsletter options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @param {Array} options.offers - Array of active offers
 * @param {string} options.userId - User ID for unsubscribe link
 * @returns {Promise<object>} Send result
 */
export const sendNewsletterEmail = async ({ to, userName, offers, userId }) => {
  const { weeklyNewsletterBody } = await import('./emailTemplates.js');
  
  const appUrl = process.env.APP_URL || 'https://your-domain.com';
  const unsubscribeToken = generateUnsubscribeToken(userId);
  
  const templateData = {
    subject: `Wöchentliche Angebote - ${new Date().toLocaleDateString('de-DE')}`,
    headerSubtitle: 'Ihre wöchentlichen Top-Angebote',
    userName: userName || 'Kunde',
    offers: offers.map(offer => ({
      ...offer,
      productUrl: `${appUrl}/product/${offer.productId}`,
      endDate: offer.endDate ? new Date(offer.endDate).toLocaleDateString('de-DE') : null
    })),
    appUrl,
    unsubscribeUrl: `${appUrl}/unsubscribe?userId=${userId}&token=${unsubscribeToken}`
  };

  const html = compileEmailTemplate(weeklyNewsletterBody, templateData);

  return sendEmail({
    to,
    subject: templateData.subject,
    html
  });
};

/**
 * Send order status change email
 * @param {object} options - Order status email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @param {string} options.status - New order status
 * @param {object} options.order - Order object
 * @returns {Promise<object>} Send result
 */
export const sendOrderStatusEmail = async ({ to, userName, status, order }) => {
  const { orderStatusTemplates } = await import('./emailTemplates.js');
  
  const statusTemplate = orderStatusTemplates[status];
  
  if (!statusTemplate) {
    throw new Error(`No email template found for status: ${status}`);
  }

  const appUrl = process.env.APP_URL || 'https://evaris.eu';
  
  const statusTitles = {
    processing: 'Bestellung wird bearbeitet',
    shipped: 'Bestellung versandt',
    delivered: 'Bestellung zugestellt',
    cancelled: 'Bestellung storniert'
  };

  const templateData = {
    subject: `${statusTitles[status]} - Bestellung #${order.id}`,
    headerSubtitle: statusTitles[status],
    userName: userName || 'Kunde',
    orderId: order.id,
    items: order.items || [],
    total: typeof order.total === 'number' ? order.total.toFixed(2) : order.total,
    shippingAddress: order.shippingAddress || {},
    trackingNumber: order.trackingNumber || null,
    appUrl
  };

  const html = compileEmailTemplate(statusTemplate, templateData);

  return sendEmail({
    to,
    subject: templateData.subject,
    html
  });
};

/**
 * Send welcome email to new users
 * @param {object} options - Welcome email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @returns {Promise<object>} Send result
 */
export const sendWelcomeEmail = async ({ to, userName }) => {
  const { welcomeEmailBody } = await import('./emailTemplates.js');
  
  const appUrl = process.env.APP_URL || 'https://evaris.eu';
  
  const templateData = {
    subject: `Willkommen bei ${process.env.APP_NAME || 'WebShop'}! 🎉`,
    headerSubtitle: 'Schön, dass Sie dabei sind!',
    userName: userName || 'Kunde',
    appUrl
  };

  const html = compileEmailTemplate(welcomeEmailBody, templateData);

  return sendEmail({
    to,
    subject: templateData.subject,
    html
  });
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if configuration is valid
 */
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
