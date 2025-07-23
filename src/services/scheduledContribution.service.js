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
        await validatePackage(packageId, userId, contributionType);

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

    try {
        const query = { userId, ...filters };

        const schedules = await ScheduledContributionModel.find(query)
            .populate('storedCardId', 'cardType last4 bank')
            .sort({ createdAt: -1 });
        console.log("schedule", schedules);

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

    try {
        const dueSchedules = await ScheduledContributionModel.find({
            status: 'active',
            isActive: true,
            nextPaymentDate: { $lte: dueDate },
            $or: [
                { endDate: null },
                { endDate: { $gte: dueDate } },
            ],
        }).populate('storedCardId', 'authorizationCode isActive');

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
    const ScheduledContributionModel = await ScheduledContribution();

    try {
        // Get stored card details
        const storedCard = await storedCardService.getStoredCard(schedule.storedCardId, schedule.userId);

        if (!storedCard || !storedCard.isActive) {
            throw new Error('Stored card is not available or inactive');
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
        throw error;
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
        switch (schedule.contributionType) {
            case 'ds':
                await dailySavingsService.processPaystackContribution(
                    schedule.packageId,
                    schedule.amount,
                    schedule.userId,
                    chargeData.reference,
                    new Date(chargeData.paid_at)
                );
                break;
            case 'sb':
                await sbPackageService.processPaystackContribution(
                    schedule.packageId,
                    schedule.amount,
                    schedule.userId,
                    chargeData.reference,
                    new Date(chargeData.paid_at)
                );
                break;
            default:
                throw new Error(`Unsupported contribution type: ${schedule.contributionType}`);
        }

        // Update schedule for next payment
        const nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);

        const updateData = {
            lastPaymentDate: new Date(),
            nextPaymentDate,
            totalPayments: schedule.totalPayments + 1,
            totalAmount: schedule.totalAmount + schedule.amount,
            failedPayments: 0,
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
        const retryCount = paymentLog.retryCount + 1;
        const shouldRetry = retryCount < paymentLog.maxRetries;

        // Update payment log
        const logUpdate = {
            status: shouldRetry ? 'failed' : 'failed',
            errorMessage,
            errorCode: (chargeResponse.data && chargeResponse.data.gateway_response) || 'unknown',
            retryCount,
            processedAt: new Date(),
        };

        if (shouldRetry) {
            // Schedule retry (exponential backoff: 1hr, 4hr, 24hr)
            const retryHours = Math.pow(4, retryCount - 1);
            logUpdate.nextRetryAt = new Date(Date.now() + retryHours * 60 * 60 * 1000);
        }

        await ScheduledPaymentLogModel.findByIdAndUpdate(paymentLog._id, logUpdate);

        // Update schedule
        const failedPayments = schedule.failedPayments + 1;
        const scheduleUpdate = { failedPayments };

        // If too many failures, suspend the schedule
        if (failedPayments >= 3) {
            scheduleUpdate.status = 'suspended';
            scheduleUpdate.isActive = false;
        } else if (!shouldRetry) {
            // Move to next payment date if no more retries
            scheduleUpdate.nextPaymentDate = calculateNextPaymentDate(schedule.nextPaymentDate, schedule.frequency);
        }

        await ScheduledContributionModel.findByIdAndUpdate(schedule._id, scheduleUpdate);

        logger.warn(`Scheduled payment failed: ${errorMessage}, Retry: ${shouldRetry}`);

        return {
            success: false,
            error: errorMessage,
            retryCount,
            willRetry: shouldRetry,
            nextRetryAt: logUpdate.nextRetryAt,
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

        // Format the response
        const stats = {
            schedules: {
                total: 0,
                active: 0,
                paused: 0,
                cancelled: 0,
                completed: 0,
            },
            payments: {
                total: 0,
                successful: 0,
                failed: 0,
                totalAmount: 0,
            },
            recentActivity,
        };

        // Process schedule stats
        scheduleStats.forEach(stat => {
            stats.schedules.total += stat.count;
            stats.schedules[stat._id] = stat.count;
        });

        // Process payment stats
        paymentStats.forEach(stat => {
            stats.payments.total += stat.count;
            if (stat._id === 'success') {
                stats.payments.successful = stat.count;
                stats.payments.totalAmount = stat.totalAmount;
            } else if (stat._id === 'failed') {
                stats.payments.failed = stat.count;
            }
        });

        return stats;
    } catch (error) {
        logger.error(`Error getting schedule stats for user ${userId}:`, error);
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
}; 