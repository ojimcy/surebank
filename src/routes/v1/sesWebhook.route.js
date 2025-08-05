const express = require('express');
const { sesWebhookController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const router = express.Router();

// Public endpoint for AWS SNS notifications (no auth required)
router.post('/webhook', sesWebhookController.handleSESWebhook);

// Protected endpoint for viewing email statistics
router.get('/statistics', auth('getEmailStats'), sesWebhookController.getEmailStatistics);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: SESWebhook
 *   description: AWS SES webhook and email statistics management
 */

/**
 * @swagger
 * /ses/webhook:
 *   post:
 *     summary: Handle AWS SES webhook notifications
 *     description: Endpoint for AWS SNS to send SES event notifications (bounce, complaint, delivery, etc.)
 *     tags: [SESWebhook]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: AWS SNS notification message
 *     responses:
 *       "200":
 *         description: Notification processed successfully
 *       "400":
 *         description: Invalid notification format
 *       "401":
 *         description: Invalid message signature
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /ses/statistics:
 *   get:
 *     summary: Get email sending statistics
 *     description: Get email bounce rates, complaint rates, and other sending metrics
 *     tags: [SESWebhook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in statistics
 *     responses:
 *       "200":
 *         description: Email statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         sent:
 *                           type: number
 *                         delivered:
 *                           type: number
 *                         bounced:
 *                           type: number
 *                         complained:
 *                           type: number
 *                         bounceRate:
 *                           type: number
 *                         complaintRate:
 *                           type: number
 *                     suppression:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         bounces:
 *                           type: number
 *                         complaints:
 *                           type: number
 *                         manual:
 *                           type: number
 *                     recentEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                     reportPeriodDays:
 *                       type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */