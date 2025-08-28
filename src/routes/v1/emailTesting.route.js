const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const emailTestingController = require('../../controllers/emailTesting.controller');
const { emailTestingValidation } = require('../../validations');

const router = express.Router();

/**
 * Email testing routes - only available for authenticated users with email management permissions
 * These routes are primarily for development, testing, and debugging purposes
 */

/**
 * Send test verification email
 */
router.post(
  '/verification',
  auth('manageEmails'),
  validate(emailTestingValidation.sendTestEmail),
  emailTestingController.sendTestVerificationEmail
);

/**
 * Send test password reset email
 */
router.post(
  '/password-reset',
  auth('manageEmails'),
  validate(emailTestingValidation.sendTestEmail),
  emailTestingController.sendTestPasswordResetEmail
);

/**
 * Send test package creation email
 */
router.post(
  '/package-creation',
  auth('manageEmails'),
  validate(emailTestingValidation.sendTestPackageEmail),
  emailTestingController.sendTestPackageCreationEmail
);

/**
 * Send test welcome email
 */
router.post(
  '/welcome',
  auth('manageEmails'),
  validate(emailTestingValidation.sendTestEmail),
  emailTestingController.sendTestWelcomeEmail
);

/**
 * Send test security alert email
 */
router.post(
  '/security-alert',
  auth('manageEmails'),
  validate(emailTestingValidation.sendTestSecurityAlertEmail),
  emailTestingController.sendTestSecurityAlertEmail
);

/**
 * Test email queue functionality
 */
router.post(
  '/queue',
  auth('manageEmails'),
  validate(emailTestingValidation.testEmailQueue),
  emailTestingController.testEmailQueue
);

/**
 * Test scheduled email functionality
 */
router.post(
  '/scheduled',
  auth('manageEmails'),
  validate(emailTestingValidation.testScheduledEmail),
  emailTestingController.testScheduledEmail
);

/**
 * Send custom test email
 */
router.post(
  '/custom',
  auth('manageEmails'),
  validate(emailTestingValidation.sendCustomTestEmail),
  emailTestingController.sendCustomTestEmail
);

/**
 * Get email queue statistics
 */
router.get(
  '/queue/stats',
  auth('manageEmails'),
  emailTestingController.getEmailQueueStats
);

/**
 * Preview email template in browser
 */
router.post(
  '/preview',
  auth('manageEmails'),
  validate(emailTestingValidation.previewEmailTemplate),
  emailTestingController.previewEmailTemplate
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Email Testing
 *   description: Email testing and debugging endpoints (development use)
 */

/**
 * @swagger
 * /email-testing/verification:
 *   post:
 *     summary: Send test verification email
 *     description: Send a test email verification message for testing purposes
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *               otp:
 *                 type: string
 *                 description: Custom OTP (defaults to 123456)
 *     responses:
 *       "200":
 *         description: Test verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /email-testing/queue:
 *   post:
 *     summary: Test email queue functionality
 *     description: Queue multiple test emails with different priorities and delays
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 1
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, NORMAL, LOW, BULK]
 *                 default: NORMAL
 *               delay:
 *                 type: integer
 *                 description: Delay in seconds
 *                 default: 0
 *               template:
 *                 type: string
 *                 default: VERIFY_EMAIL
 *     responses:
 *       "200":
 *         description: Test emails queued successfully
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /email-testing/preview:
 *   post:
 *     summary: Preview email template
 *     description: Generate HTML preview of email template for testing
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 description: Template name (e.g., 'verify-email-mjml')
 *               templateData:
 *                 type: object
 *                 description: Data to populate template
 *     responses:
 *       "200":
 *         description: HTML email template preview
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /email-testing/queue/stats:
 *   get:
 *     summary: Get email queue statistics
 *     description: Retrieve current email queue status and statistics
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Email queue statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 queueStats:
 *                   type: object
 *                 recentFailures:
 *                   type: array
 */