const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { scheduledContributionService } = require('../services');
const config = require('../config/config');

/**
 * Create a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSchedule = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const scheduleData = { ...req.body, userId };

    const schedule = await scheduledContributionService.createScheduledContribution(scheduleData);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Scheduled contribution created successfully',
        data: schedule,
    });
});

/**
 * Get user's scheduled contributions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserSchedules = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const filters = req.query;

    const schedules = await scheduledContributionService.getUserScheduledContributions(userId, filters);
    console.log('schdules', schedules);

    // Transform the response to match frontend expectations
    const response = {
        schedules: schedules,
        totalSchedules: schedules.length,
        page: parseInt(filters.page) || 1,
        limit: parseInt(filters.limit) || 10,
        totalPages: Math.ceil(schedules.length / (parseInt(filters.limit) || 10))
    };
    res.status(httpStatus.OK).json(response);
});

/**
 * Get a specific scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSchedule = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;

    const schedule = await scheduledContributionService.getScheduledContribution(scheduleId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Scheduled contribution retrieved successfully',
        data: schedule,
    });
});

/**
 * Update a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSchedule = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const updatedSchedule = await scheduledContributionService.updateScheduledContribution(
        scheduleId,
        userId,
        updateData
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Scheduled contribution updated successfully',
        data: updatedSchedule,
    });
});

/**
 * Pause a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const pauseSchedule = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;
    const { pausedUntil } = req.body;

    const pausedSchedule = await scheduledContributionService.pauseScheduledContribution(
        scheduleId,
        userId,
        pausedUntil
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Scheduled contribution paused successfully',
        data: pausedSchedule,
    });
});

/**
 * Resume a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resumeSchedule = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;

    const resumedSchedule = await scheduledContributionService.resumeScheduledContribution(
        scheduleId,
        userId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Scheduled contribution resumed successfully',
        data: resumedSchedule,
    });
});

/**
 * Cancel a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelSchedule = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;

    const cancelledSchedule = await scheduledContributionService.cancelScheduledContribution(
        scheduleId,
        userId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Scheduled contribution cancelled successfully',
        data: cancelledSchedule,
    });
});

/**
 * Get payment logs for a scheduled contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentLogs = catchAsync(async (req, res) => {
    const { scheduleId } = req.params;
    const userId = req.user._id;
    const options = req.query;

    const logs = await scheduledContributionService.getScheduledPaymentLogs(
        scheduleId,
        userId,
        options
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Payment logs retrieved successfully',
        data: logs,
    });
});

/**
 * Get scheduled contribution statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getScheduleStats = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const stats = await scheduledContributionService.getUserScheduleStats(userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Schedule statistics retrieved successfully',
        data: stats,
    });
});

/**
 * Process due scheduled contributions (Admin/Testing endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processDueContributions = catchAsync(async (req, res) => {
    const dueDate = req.query.dueDate ? new Date(req.query.dueDate) : new Date();
    
    // Get due contributions
    const dueContributions = await scheduledContributionService.getDueScheduledContributions(dueDate);
    
    if (dueContributions.length === 0) {
        return res.status(httpStatus.OK).json({
            success: true,
            message: 'No due contributions found',
            data: {
                processed: 0,
                results: []
            }
        });
    }

    // Process each due contribution
    const results = [];
    for (const contribution of dueContributions) {
        try {
            const result = await scheduledContributionService.processScheduledPayment(contribution);
            results.push({
                scheduleId: contribution._id,
                success: result.success,
                result: result
            });
        } catch (error) {
            results.push({
                scheduleId: contribution._id,
                success: false,
                error: error.message
            });
        }
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: `Processed ${dueContributions.length} due contributions`,
        data: {
            processed: dueContributions.length,
            results: results
        }
    });
});

/**
 * Get list of due contributions without processing (Debug endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDueContributionsList = catchAsync(async (req, res) => {
    const dueDate = req.query.dueDate ? new Date(req.query.dueDate) : new Date();
    
    // Get due contributions
    const dueContributions = await scheduledContributionService.getDueScheduledContributions(dueDate);
    
    res.status(httpStatus.OK).json({
        success: true,
        message: `Found ${dueContributions.length} due contributions`,
        data: {
            dueDate: dueDate.toISOString(),
            count: dueContributions.length,
            contributions: dueContributions.map(contrib => ({
                id: contrib._id,
                userId: contrib.userId,
                amount: contrib.amount,
                frequency: contrib.frequency,
                contributionType: contrib.contributionType,
                nextPaymentDate: contrib.nextPaymentDate,
                status: contrib.status,
                isActive: contrib.isActive,
                createdAt: contrib.createdAt
            }))
        }
    });
});

/**
 * Get all scheduled contributions (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSchedules = catchAsync(async (req, res) => {
    const filters = req.query;

    const result = await scheduledContributionService.getAllScheduledContributions(filters);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'All scheduled contributions retrieved successfully',
        data: result.schedules,
        pagination: result.pagination,
        summary: result.summary,
    });
});

/**
 * Manually trigger scheduler (Local development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const manuallyTriggerScheduler = catchAsync(async (req, res) => {
    // Only allow in development/test environments
    if (config.env === 'production') {
        return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Scheduler trigger not available in production'
        });
    }

    try {
        const schedulerService = require('../services/scheduler.service');
        const job = await schedulerService.manuallyTriggerProcessor();
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Scheduler triggered manually',
            data: {
                jobId: job.id,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to trigger scheduler',
            error: error.message
        });
    }
});

/**
 * Get scheduler statistics (Local development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSchedulerStats = catchAsync(async (req, res) => {
    // Only allow in development/test environments
    if (config.env === 'production') {
        return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Scheduler stats not available in production'
        });
    }

    try {
        const schedulerService = require('../services/scheduler.service');
        const stats = await schedulerService.getJobStats();
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Scheduler statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to get scheduler stats',
            error: error.message
        });
    }
});

/**
 * Restart scheduler (Local development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const restartScheduler = catchAsync(async (req, res) => {
    // Only allow in development/test environments
    if (config.env === 'production') {
        return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Scheduler restart not available in production'
        });
    }

    try {
        const schedulerService = require('../services/scheduler.service');
        await schedulerService.restartScheduledContributionsProcessor();
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Scheduler restarted successfully',
            data: {
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to restart scheduler',
            error: error.message
        });
    }
});

module.exports = {
    createSchedule,
    getUserSchedules,
    getSchedule,
    updateSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    getPaymentLogs,
    getScheduleStats,
    processDueContributions,
    getDueContributionsList,
    getAllSchedules,
    manuallyTriggerScheduler,
    getSchedulerStats,
    restartScheduler,
}; 