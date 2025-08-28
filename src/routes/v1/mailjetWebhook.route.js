const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mailjetWebhookController = require('../../controllers/mailjetWebhook.controller');
const { mailjetWebhookValidation } = require('../../validations');

const router = express.Router();

/**
 * Webhook endpoint for Mailjet events
 * This endpoint receives webhook events from Mailjet for email delivery status,
 * bounces, complaints, opens, clicks, etc.
 */
router.post(
  '/webhook',
  // Note: No authentication required for webhook endpoint
  // Webhook signature verification is handled in the controller
  mailjetWebhookController.processWebhook
);

/**
 * Get webhook statistics and health check
 * Requires authentication
 */
router.get(
  '/stats',
  auth('manageEmails'),
  validate(mailjetWebhookValidation.getStats),
  mailjetWebhookController.getWebhookStats
);

/**
 * Test webhook endpoint for development and debugging
 * Requires authentication
 */
router.post(
  '/test',
  auth('manageEmails'),
  mailjetWebhookController.testWebhook
);

/**
 * Get email suppression list with pagination and filtering
 * Requires authentication
 */
router.get(
  '/suppressions',
  auth('manageEmails'),
  validate(mailjetWebhookValidation.getSuppressionList),
  mailjetWebhookController.getSuppressionList
);

/**
 * Remove email from suppression list
 * Requires authentication and admin privileges
 */
router.delete(
  '/suppressions/:email',
  auth('manageUsers'), // Higher privilege required for removing suppressions
  validate(mailjetWebhookValidation.removeFromSuppressionList),
  mailjetWebhookController.removeFromSuppressionList
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Mailjet Webhooks
 *   description: Mailjet webhook management and email suppression
 */

/**
 * @swagger
 * /mailjet/webhook:
 *   post:
 *     summary: Process Mailjet webhook events
 *     description: Endpoint for receiving webhook events from Mailjet including email delivery status, bounces, complaints, opens, clicks, etc.
 *     tags: [Mailjet Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 event:
 *                   type: string
 *                   enum: [sent, delivered, open, click, bounce, blocked, spam, unsub]
 *                 time:
 *                   type: integer
 *                   description: Unix timestamp
 *                 MessageID:
 *                   type: string
 *                 CampaignID:
 *                   type: string
 *     responses:
 *       "200":
 *         description: Webhook events processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /mailjet/stats:
 *   get:
 *     summary: Get webhook statistics
 *     description: Retrieve webhook processing statistics and email event metrics
 *     tags: [Mailjet Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d]
 *           default: 7d
 *         description: Time period for statistics
 *     responses:
 *       "200":
 *         description: Webhook statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 period:
 *                   type: string
 *                 stats:
 *                   type: object
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /mailjet/suppressions:
 *   get:
 *     summary: Get email suppression list
 *     description: Retrieve paginated list of suppressed email addresses
 *     tags: [Mailjet Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of results per page
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *           enum: [bounce, complaint, manual, unsubscribe, spam]
 *         description: Filter by suppression reason
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search email addresses
 *     responses:
 *       "200":
 *         description: Suppression list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suppressions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmailSuppression'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResult'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /mailjet/suppressions/{email}:
 *   delete:
 *     summary: Remove email from suppression list
 *     description: Remove an email address from the suppression list to allow future emails
 *     tags: [Mailjet Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to remove from suppression
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *           enum: [bounce, complaint, manual, unsubscribe, spam]
 *         description: Specific suppression reason to remove (optional)
 *     responses:
 *       "200":
 *         description: Email removed from suppression list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */