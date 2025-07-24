const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { scheduledContributionService } = require('../services');

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
    console.log('users s', response)
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
}; 