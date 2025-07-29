const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ScheduledContribution, ScheduledPaymentLog, StoredCard, DsPackage, SbPackage, InterestPackage } = require('../models');
const ApiError = require('../utils/ApiError');
const paystackService = require('./paystack.service');
const userService = require('./user.service');
const storedCardService = require('./storedCard.service');
const dailySavingsService = require('./dailySavings.service');
const sbPackageService = require('./sbPackage.service');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const { MAX_RETRIES } = require('../constants/account');

/**
 * Calculate next payment date based on frequency
 * @param {Date} currentDate - Current date
 * @param {string} frequency - Payment frequency
 * @returns {Date} Next payment date
 */
const calculateNextPaymentDate = (currentDate, frequency) => {
    const date = new Date(currentDate);

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'bi-weekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        default:
            throw new Error(`Invalid frequency: ${frequency}`);
    }

    return date;
};

/**
 * Validate package exists and belongs to user
 * @param {string} packageId - Package ID
 * @param {string} userId - User ID
 * @param {string} contributionType - Contribution type
 * @returns {Promise<Object>} Package details
 */
const validatePackage = async (packageId, userId, contributionType) => {
    let PackageModel;
    let packageData;

    switch (contributionType) {
        case 'ds':
            PackageModel = await DsPackage();
            // DS packages use custom 'id' field, not '_id'
            packageData = await PackageModel.findOne({ id: packageId });
            break;
        case 'sb':
            PackageModel = await SbPackage();
            // SB packages use standard MongoDB '_id' field
            packageData = await PackageModel.findById(packageId);
            break;
        case 'ibs':
            PackageModel = await InterestPackage();
            // IB packages use standard MongoDB '_id' field
            packageData = await PackageModel.findById(packageId);
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid contribution type');
    }

    if (!packageData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
    }

    if (packageData.status === 'closed' || packageData.status === 'completed') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot schedule contributions to closed package');
    }

    return packageData;
};

/**
 * Create a scheduled contribution
 * @param {Object} scheduleData - Schedule data
 * @returns {Promise<Object>} Created schedule
 */
const createScheduledContribution = async (scheduleData) => {
    const ScheduledContributionModel = await ScheduledContribution();

    try {
        const {
            userId,
            packageId,
            contributionType,
            amount,
            frequency,
            storedCardId,
            startDate,
            endDate,
        } = scheduleData;

        // Validate the package
        const packageData = await validatePackage(packageId, userId, contributionType);
        
        // Additional validation: ensure package belongs to the user
        if (packageData.userId && packageData.userId.toString() !== userId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create schedule for package that belongs to another user');
        }

        // Validate the stored card
        const storedCard = await storedCardService.getStoredCard(storedCardId, userId);
        if (!storedCard.isActive) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Selected card is not active');
        }

        // Check for existing active schedule for the same package
        const existingSchedule = await ScheduledContributionModel.findOne({
            userId,
            packageId,
            status: { $in: ['active', 'paused'] },
        });

        if (existingSchedule) {
            throw new ApiError(httpStatus.CONFLICT, 'An active schedule already exists for this package');
        }

        // Calculate next payment date
        const nextPaymentDate = calculateNextPaymentDate(new Date(startDate), frequency);

        // Create the schedule
        const scheduleInput = {
            userId,
            packageId,
            contributionType,
            amount,
            frequency,
            storedCardId,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            nextPaymentDate,
            status: 'active',
        };

        const schedule = await ScheduledContributionModel.create(scheduleInput);

        logger.info(`Scheduled contribution created: ${schedule._id} for user ${userId}`);
        return schedule;
    } catch (error) {
        logger.error(`Error creating scheduled contribution for user ${scheduleData.userId}:`, error);
        throw error;
    }
};

/**
 * Get user's scheduled contributions
 * @param {string} userId - User ID
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Scheduled contributions
 */
const getUserScheduledContributions = async (userId, filters = {}) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        // Extract pagination and non-query params
        const { page, limit, ...queryFilters } = filters;
        
        const query = { userId, ...queryFilters };
        
        const schedules = await ScheduledContributionModel.find(query)
            .populate('storedCardId', 'cardType last4 bank')
            .sort({ createdAt: -1 });

        // Transform data to match frontend expectations
        const transformedSchedules = schedules.map(schedule => {
            const scheduleObj = schedule.toObject();
            return {
                ...scheduleObj,
                // Map backend fields to frontend expected fields
                successfulContributions: scheduleObj.totalPayments || 0,
                totalContributions: scheduleObj.totalPayments + (scheduleObj.failedPayments || 0),
                failedContributions: scheduleObj.failedPayments || 0
            };
        });

        return transformedSchedules;
    } catch (error) {
        logger.error(`Error getting scheduled contributions for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get due scheduled contributions for processing
 * @param {Date} dueDate - Due date (default: now)
 * @returns {Promise<Array>} Due schedules
 */
const getDueScheduledContributions = async (dueDate = new Date()) => {
    const ScheduledContributionModel = await ScheduledContribution();
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        // Get regular due schedules
        const dueSchedules = await ScheduledContributionModel.find({
            status: 'active',
            isActive: true,
            nextPaymentDate: { $lte: dueDate },
            $or: [
                { endDate: null },
                { endDate: { $gte: dueDate } },
            ],
        }).populate('storedCardId', 'authorizationCode isActive last4 cardType bank');

        // Get schedules with pending retry payments
        const retryLogs = await ScheduledPaymentLogModel.find({
            status: 'pending_retry',
            nextRetryAt: { $lte: dueDate }
        }).select('scheduledContributionId');

        if (retryLogs.length > 0) {
            const retryScheduleIds = retryLogs.map(log => log.scheduledContributionId);
            const retrySchedules = await ScheduledContributionModel.find({
                _id: { $in: retryScheduleIds },
                status: 'active',
                isActive: true
            }).populate('storedCardId', 'authorizationCode isActive last4 cardType bank');

            // Combine and deduplicate schedules
            const allScheduleIds = new Set();
            const combinedSchedules = [];

            dueSchedules.forEach(schedule => {
                if (!allScheduleIds.has(schedule._id.toString())) {
                    allScheduleIds.add(schedule._id.toString());
                    combinedSchedules.push(schedule);
                }
            });

            retrySchedules.forEach(schedule => {
                if (!allScheduleIds.has(schedule._id.toString())) {
                    allScheduleIds.add(schedule._id.toString());
                    combinedSchedules.push(schedule);
                }
            });

            return combinedSchedules;
        }

        return dueSchedules;
    } catch (error) {
        logger.error(`Error getting due scheduled contributions:`, error);
        throw error;
    }
};

/**
 * Process a scheduled payment
 * @param {Object} schedule - Scheduled contribution
 * @returns {Promise<Object>} Payment result
 */
const processScheduledPayment = async (schedule) => {
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();
    await ScheduledContribution();

    try {
        // Debug logging
        logger.info(`Processing scheduled payment for schedule ${schedule._id}`, {
            scheduleId: schedule._id,
            userId: schedule.userId,
            storedCardId: schedule.storedCardId,
            frequency: schedule.frequency,
            amount: schedule.amount,
            contributionType: schedule.contributionType
        });

        // Validate stored card
        if (!schedule.storedCardId) {
            throw new Error('No stored card ID found for scheduled payment');
        }
        
        if (typeof schedule.storedCardId === 'string') {
            throw new Error('Stored card not populated - received ID instead of object');
        }
        
        if (!schedule.storedCardId.authorizationCode) {
            throw new Error('No authorization code found in stored card');
        }

        const storedCard = schedule.storedCardId;
        
        if (!storedCard.isActive) {
            throw new Error('Stored card is no longer active');
        }

        // Validate frequency
        if (!schedule.frequency) {
            throw new Error('No frequency found for scheduled payment');
        }

        // Get user details
        const user = await userService.getUserById(schedule.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate unique reference
        const reference = `sched_${schedule.contributionType}_${uuidv4()}`;

        // Create payment log entry
        const paymentLog = await ScheduledPaymentLogModel.create({
            scheduledContributionId: schedule._id,
            userId: schedule.userId,
            packageId: schedule.packageId,
            amount: schedule.amount,
            status: 'processing',
            authorizationCode: storedCard.authorizationCode,
            scheduledFor: schedule.nextPaymentDate,
            contributionType: schedule.contributionType,
            metadata: {
                reference,
                cardLast4: storedCard.last4,
                frequency: schedule.frequency,
            },
        });

        // Charge the authorization
        const chargeData = {
            authorization_code: storedCard.authorizationCode,
            email: user.email,
            amount: schedule.amount * 100, // Convert to kobo
            reference,
            metadata: {
                scheduledContributionId: schedule._id,
                userId: schedule.userId,
                packageId: schedule.packageId,
                contributionType: schedule.contributionType,
                scheduled: true,
            },
        };

        const chargeResponse = await paystackService.chargeAuthorization(chargeData);

        if (chargeResponse.status && chargeResponse.data.status === 'success') {
            // Payment successful - process the contribution
            return await processSuccessfulPayment(schedule, paymentLog, chargeResponse.data);
        } else {
            // Payment failed
            return await processFailedPayment(schedule, paymentLog, chargeResponse);
        }
    } catch (error) {
        logger.error(`Error processing scheduled payment for schedule ${schedule._id}:`, error);
        
        // Update retry count and suspend if max retries reached
        const ScheduledContributionModel = await ScheduledContribution();
        const updatedSchedule = await ScheduledContributionModel.findByIdAndUpdate(
            schedule._id,
            {
                $inc: { failedPayments: 1 },
                nextPaymentDate: schedule.frequency ? calculateNextPaymentDate(new Date(), schedule.frequency) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 1 day if no frequency
                lastAttemptDate: new Date(),
            },
            { new: true }
        );

        // Suspend if max retries reached (2 failures: initial + 1 retry)
        if (updatedSchedule.failedPayments >= MAX_RETRIES) {
            await ScheduledContributionModel.findByIdAndUpdate(schedule._id, {
                status: 'suspended',
                suspendedReason: 'Max retries reached',
                suspendedAt: new Date()
            });
        }

        return {
            success: false,
            message: error.message || 'Payment processing failed',
            error: 'PROCESSING_FAILED',
            retryCount: updatedSchedule.failedPayments
        };
    }
};

/**
 * Process successful payment
 * @param {Object} schedule - Scheduled contribution
 * @param {Object} paymentLog - Payment log entry
 * @param {Object} chargeData - Paystack charge data
 * @returns {Promise<Object>} Processing result
 */
const processSuccessfulPayment = async (schedule, paymentLog, chargeData) => {
    const ScheduledContributionModel = await ScheduledContribution();
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();

    try {
        // Update payment log
        await ScheduledPaymentLogModel.findByIdAndUpdate(paymentLog._id, {
            status: 'success',
            paystackReference: chargeData.reference,
            gatewayResponse: chargeData.gateway_response,
            processedAt: new Date(),
        });

        // Process the contribution based on type
        logger.info(`Processing ${schedule.contributionType} contribution`, {
            packageId: schedule.packageId,
            userId: schedule.userId,
            amount: schedule.amount,
            reference: chargeData.reference
        });

        switch (schedule.contributionType) {
            case 'ds':
                try {
                    await dailySavingsService.processPaystackContribution(
                        schedule.packageId,
                        schedule.amount,
                        schedule.userId,
                        chargeData.reference,
                        new Date(chargeData.paid_at)
                    );
                } catch (error) {
                    if (error.message === 'User mismatch for package contribution') {
                        logger.error(`DS Package ownership mismatch for scheduled contribution - suspending schedule`, {
                            scheduleId: schedule._id,
                            packageId: schedule.packageId,
                            userId: schedule.userId,
                            error: error.message
                        });
                        
                        // Since payment was successful but contribution failed due to data issue,
                        // we need to update the schedule stats and then suspend it
                        const ScheduledContributionModel = await ScheduledContribution();
                        const nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);
                        
                        await ScheduledContributionModel.findByIdAndUpdate(schedule._id, {
                            status: 'suspended',
                            suspendedReason: 'Package ownership mismatch - data integrity issue',
                            suspendedAt: new Date(),
                            isActive: false,
                            // Still update payment stats since money was charged
                            lastPaymentDate: new Date(),
                            nextPaymentDate,
                            totalPayments: (schedule.totalPayments || 0) + 1,
                            totalAmount: (schedule.totalAmount || 0) + schedule.amount,
                            lastAttemptDate: new Date(),
                        });
                        
                        throw new Error(`Schedule suspended: Package ${schedule.packageId} does not belong to user ${schedule.userId}`);
                    }
                    throw error;
                }
                break;
            case 'sb':
                try {
                    await sbPackageService.processPaystackContribution(
                        schedule.packageId,
                        schedule.amount,
                        schedule.userId,
                        chargeData.reference,
                        new Date(chargeData.paid_at)
                    );
                } catch (error) {
                    if (error.message === 'User mismatch for package contribution') {
                        logger.error(`DS Package ownership mismatch for scheduled contribution - suspending schedule`, {
                            scheduleId: schedule._id,
                            packageId: schedule.packageId,
                            userId: schedule.userId,
                            error: error.message
                        });
                        
                        // Since payment was successful but contribution failed due to data issue,
                        // we need to update the schedule stats and then suspend it
                        const ScheduledContributionModel = await ScheduledContribution();
                        const nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);
                        
                        await ScheduledContributionModel.findByIdAndUpdate(schedule._id, {
                            status: 'suspended',
                            suspendedReason: 'Package ownership mismatch - data integrity issue',
                            suspendedAt: new Date(),
                            isActive: false,
                            // Still update payment stats since money was charged
                            lastPaymentDate: new Date(),
                            nextPaymentDate,
                            totalPayments: (schedule.totalPayments || 0) + 1,
                            totalAmount: (schedule.totalAmount || 0) + schedule.amount,
                            lastAttemptDate: new Date(),
                        });
                        
                        throw new Error(`Schedule suspended: Package ${schedule.packageId} does not belong to user ${schedule.userId}`);
                    }
                    throw error;
                }
                break;
            case 'ibs':
                // Add support for Interest-Based Savings if service exists
                // await interestPackageService.processPaystackContribution(...)
                logger.warn(`IBS contribution processing not yet implemented for scheduled payments`);
                break;
            default:
                throw new Error(`Unsupported contribution type: ${schedule.contributionType}`);
        }

        // Update schedule for next payment
        const nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);

        const updateData = {
            lastPaymentDate: new Date(),
            nextPaymentDate,
            totalPayments: (schedule.totalPayments || 0) + 1,
            totalAmount: (schedule.totalAmount || 0) + schedule.amount,
            failedPayments: 0, // Reset failed payments on success
            lastAttemptDate: new Date(),
        };

        // Check if schedule should end
        if (schedule.endDate && nextPaymentDate > schedule.endDate) {
            updateData.status = 'completed';
            updateData.isActive = false;
        }

        await ScheduledContributionModel.findByIdAndUpdate(schedule._id, updateData);

        logger.info(`Scheduled payment processed successfully: ${chargeData.reference}`);

        return {
            success: true,
            reference: chargeData.reference,
            amount: schedule.amount,
            nextPaymentDate: updateData.nextPaymentDate,
            totalPayments: updateData.totalPayments,
        };
    } catch (error) {
        logger.error(`Error processing successful payment:`, error);
        throw error;
    }
};

/**
 * Process failed payment
 * @param {Object} schedule - Scheduled contribution
 * @param {Object} paymentLog - Payment log entry
 * @param {Object} chargeResponse - Paystack charge response
 * @returns {Promise<Object>} Processing result
 */
const processFailedPayment = async (schedule, paymentLog, chargeResponse) => {
    const ScheduledContributionModel = await ScheduledContribution();
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();

    try {
        const errorMessage = chargeResponse.message || 'Payment failed';
        const retryCount = (paymentLog.retryCount || 0) + 1;
        const maxRetries = 1; // Only one retry per day
        const shouldRetry = retryCount <= maxRetries;

        // Update payment log
        const logUpdate = {
            status: 'failed',
            errorMessage,
            errorCode: (chargeResponse.data && chargeResponse.data.gateway_response) || 'unknown',
            retryCount,
            processedAt: new Date(),
        };

        if (shouldRetry) {
            // Schedule retry for 6 hours later (same day)
            logUpdate.nextRetryAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
            logUpdate.status = 'pending_retry';
        }

        await ScheduledPaymentLogModel.findByIdAndUpdate(paymentLog._id, logUpdate);

        // Update schedule
        const failedPayments = (schedule.failedPayments || 0) + 1;
        const scheduleUpdate = { 
            failedPayments,
            lastAttemptDate: new Date(),
        };

        // If too many failures, suspend the schedule (2 failures: initial + 1 retry)
        if (failedPayments >= 2) {
            scheduleUpdate.status = 'suspended';
            scheduleUpdate.isActive = false;
            scheduleUpdate.suspendedReason = 'Too many failed payment attempts';
            scheduleUpdate.suspendedAt = new Date();
        } else if (!shouldRetry) {
            // Move to next payment date if no more retries for this payment
            scheduleUpdate.nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);
        }

        await ScheduledContributionModel.findByIdAndUpdate(schedule._id, scheduleUpdate);

        logger.warn(`Scheduled payment failed: ${errorMessage}, Retry: ${shouldRetry}, Attempt: ${retryCount}/${maxRetries}`);

        return {
            success: false,
            error: errorMessage,
            retryCount,
            willRetry: shouldRetry,
            nextRetryAt: logUpdate.nextRetryAt,
            failedPayments,
        };
    } catch (error) {
        logger.error(`Error processing failed payment:`, error);
        throw error;
    }
};

/**
 * Get a specific scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Scheduled contribution
 */
const getScheduledContribution = async (scheduleId, userId) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        }).populate('storedCardId', 'cardType last4 bank');

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        return schedule;
    } catch (error) {
        logger.error(`Error getting scheduled contribution ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Update a scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated schedule
 */
const updateScheduledContribution = async (scheduleId, userId, updateData) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        });

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        if (schedule.status === 'cancelled' || schedule.status === 'completed') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update cancelled or completed schedule');
        }

        const updatedSchedule = await ScheduledContributionModel.findByIdAndUpdate(
            scheduleId,
            updateData,
            { new: true }
        ).populate('storedCardId', 'cardType last4 bank');

        logger.info(`Scheduled contribution updated: ${scheduleId}`);
        return updatedSchedule;
    } catch (error) {
        logger.error(`Error updating scheduled contribution ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Pause a scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @param {Date} pausedUntil - Pause until date (optional)
 * @returns {Promise<Object>} Paused schedule
 */
const pauseScheduledContribution = async (scheduleId, userId, pausedUntil = null) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        });

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        if (schedule.status !== 'active') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Only active schedules can be paused');
        }

        const updateData = {
            status: 'paused',
            pausedAt: new Date(),
        };

        if (pausedUntil) {
            updateData.pausedUntil = new Date(pausedUntil);
        }

        const pausedSchedule = await ScheduledContributionModel.findByIdAndUpdate(
            scheduleId,
            updateData,
            { new: true }
        ).populate('storedCardId', 'cardType last4 bank');

        logger.info(`Scheduled contribution paused: ${scheduleId}`);
        return pausedSchedule;
    } catch (error) {
        logger.error(`Error pausing scheduled contribution ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Resume a scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Resumed schedule
 */
const resumeScheduledContribution = async (scheduleId, userId) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        });

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        if (schedule.status !== 'paused') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Only paused schedules can be resumed');
        }

        const updateData = {
            status: 'active',
            pausedAt: null,
            pausedUntil: null,
        };

        const resumedSchedule = await ScheduledContributionModel.findByIdAndUpdate(
            scheduleId,
            updateData,
            { new: true }
        ).populate('storedCardId', 'cardType last4 bank');

        logger.info(`Scheduled contribution resumed: ${scheduleId}`);
        return resumedSchedule;
    } catch (error) {
        logger.error(`Error resuming scheduled contribution ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Cancel a scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cancelled schedule
 */
const cancelScheduledContribution = async (scheduleId, userId) => {
    const ScheduledContributionModel = await ScheduledContribution();
    // Ensure StoredCard model is registered for population
    await StoredCard();

    try {
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        });

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        if (schedule.status === 'cancelled' || schedule.status === 'completed') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Schedule is already cancelled or completed');
        }

        const updateData = {
            status: 'cancelled',
            isActive: false,
            cancelledAt: new Date(),
        };

        const cancelledSchedule = await ScheduledContributionModel.findByIdAndUpdate(
            scheduleId,
            updateData,
            { new: true }
        ).populate('storedCardId', 'cardType last4 bank');

        logger.info(`Scheduled contribution cancelled: ${scheduleId}`);
        return cancelledSchedule;
    } catch (error) {
        logger.error(`Error cancelling scheduled contribution ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Get payment logs for a scheduled contribution
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Payment logs
 */
const getScheduledPaymentLogs = async (scheduleId, userId, options = {}) => {
    const ScheduledContributionModel = await ScheduledContribution();
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();

    try {
        // Verify schedule belongs to user
        const schedule = await ScheduledContributionModel.findOne({
            _id: scheduleId,
            userId,
        });

        if (!schedule) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Scheduled contribution not found');
        }

        const { limit = 20, offset = 0 } = options;

        const logs = await ScheduledPaymentLogModel.find({
            scheduledContributionId: scheduleId,
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const totalLogs = await ScheduledPaymentLogModel.countDocuments({
            scheduledContributionId: scheduleId,
        });

        return {
            logs,
            total: totalLogs,
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
    } catch (error) {
        logger.error(`Error getting payment logs for schedule ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Get user's schedule statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Schedule statistics
 */
const getUserScheduleStats = async (userId) => {
    const ScheduledContributionModel = await ScheduledContribution();
    const ScheduledPaymentLogModel = await ScheduledPaymentLog();

    try {
        // Get schedule counts by status
        const scheduleStats = await ScheduledContributionModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    totalPayments: { $sum: '$totalPayments' },
                }
            }
        ]);

        // Get payment stats
        const paymentStats = await ScheduledPaymentLogModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                }
            }
        ]);

        // Get recent activity
        const recentActivity = await ScheduledPaymentLogModel.find({
            userId: new mongoose.Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('amount status createdAt contributionType');

        // Initialize counters
        let totalSchedules = 0;
        let activeSchedules = 0;
        let pausedSchedules = 0;
        let suspendedSchedules = 0;
        let completedSchedules = 0;
        let cancelledSchedules = 0;
        let totalAmountContributed = 0;

        let totalContributions = 0;
        let successfulContributions = 0;
        let failedContributions = 0;
        let totalPaymentAmount = 0;

        // Process schedule stats
        scheduleStats.forEach(stat => {
            totalSchedules += stat.count;
            totalAmountContributed += stat.totalAmount || 0;
            
            switch(stat._id) {
                case 'active':
                    activeSchedules = stat.count;
                    break;
                case 'paused':
                    pausedSchedules = stat.count;
                    break;
                case 'suspended':
                    suspendedSchedules = stat.count;
                    break;
                case 'completed':
                    completedSchedules = stat.count;
                    break;
                case 'cancelled':
                    cancelledSchedules = stat.count;
                    break;
            }
        });

        // Process payment stats
        paymentStats.forEach(stat => {
            totalContributions += stat.count;
            totalPaymentAmount += stat.totalAmount || 0;
            
            if (stat._id === 'success') {
                successfulContributions = stat.count;
            } else if (stat._id === 'failed') {
                failedContributions = stat.count;
            }
        });

        // Return flat structure that frontend expects
        return {
            totalSchedules,
            activeSchedules,
            pausedSchedules,
            suspendedSchedules,
            completedSchedules,
            cancelledSchedules,
            totalContributions,
            successfulContributions,
            failedContributions,
            totalAmountContributed,
            totalPaymentAmount,
            recentActivity,
        };
    } catch (error) {
        logger.error(`Error getting schedule stats for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get all scheduled contributions (Admin)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated scheduled contributions
 */
const getAllScheduledContributions = async (filters = {}) => {
    try {
        const {
            status,
            contributionType,
            userId,
            packageId,
            frequency,
            isActive,
            isDue,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            search
        } = filters;

        // Build filter query
        const query = {};

        if (status) {
            query.status = status;
        }

        if (contributionType) {
            query.contributionType = contributionType;
        }

        if (userId) {
            query.userId = mongoose.Types.ObjectId(userId);
        }

        if (packageId) {
            query.packageId = mongoose.Types.ObjectId(packageId);
        }

        if (frequency) {
            query.frequency = frequency;
        }

        if (typeof isActive === 'boolean') {
            if (isActive) {
                query.status = { $in: ['active', 'paused'] };
            } else {
                query.status = { $in: ['suspended', 'completed', 'cancelled'] };
            }
        }

        if (typeof isDue === 'boolean' && isDue) {
            query.nextPaymentDate = { $lte: new Date() };
            query.status = 'active';
        }

        // Build aggregation pipeline
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { firstName: 1, lastName: 1, email: 1, phoneNumber: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'storedcards',
                    localField: 'storedCardId',
                    foreignField: '_id',
                    as: 'storedCard',
                    pipeline: [
                        { $project: { last4: 1, bank: 1, cardType: 1, brand: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$storedCard', preserveNullAndEmptyArrays: true } }
        ];

        // Add search filter if provided
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.email': { $regex: search, $options: 'i' } },
                        { 'user.firstName': { $regex: search, $options: 'i' } },
                        { 'user.lastName': { $regex: search, $options: 'i' } },
                        { 'user.phoneNumber': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Get the model instance
        const ScheduledContributionModel = await ScheduledContribution();
        
        // Count total documents
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await ScheduledContributionModel.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Add sorting and pagination
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        pipeline.push(
            { $sort: sortObj },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        );

        // Add computed fields
        pipeline.push({
            $addFields: {
                fullName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                isOverdue: {
                    $and: [
                        { $eq: ['$status', 'active'] },
                        { $lt: ['$nextPaymentDate', new Date()] }
                    ]
                },
                daysSinceLastPayment: {
                    $divide: [
                        { $subtract: [new Date(), '$nextPaymentDate'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        });

        const schedules = await ScheduledContributionModel.aggregate(pipeline);

        return {
            schedules,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
            summary: {
                total,
                active: await ScheduledContributionModel.countDocuments({ status: 'active' }),
                paused: await ScheduledContributionModel.countDocuments({ status: 'paused' }),
                suspended: await ScheduledContributionModel.countDocuments({ status: 'suspended' }),
                completed: await ScheduledContributionModel.countDocuments({ status: 'completed' }),
                cancelled: await ScheduledContributionModel.countDocuments({ status: 'cancelled' }),
                due: await ScheduledContributionModel.countDocuments({
                    status: 'active',
                    nextPaymentDate: { $lte: new Date() }
                })
            }
        };
    } catch (error) {
        logger.error('Error getting all scheduled contributions:', error);
        throw error;
    }
};

module.exports = {
    createScheduledContribution,
    getUserScheduledContributions,
    getDueScheduledContributions,
    processScheduledPayment,
    calculateNextPaymentDate,
    getScheduledContribution,
    updateScheduledContribution,
    pauseScheduledContribution,
    resumeScheduledContribution,
    cancelScheduledContribution,
    getScheduledPaymentLogs,
    getUserScheduleStats,
    getAllScheduledContributions,
};