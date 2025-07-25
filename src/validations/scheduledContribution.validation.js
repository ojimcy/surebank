const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSchedule = {
    body: Joi.object().keys({
        packageId: Joi.string().custom(objectId).required(),
        contributionType: Joi.string().valid('ds', 'sb', 'ibs').required(),
        amount: Joi.number().positive().required(),
        frequency: Joi.string().valid('daily', 'weekly', 'bi-weekly', 'monthly').required(),
        storedCardId: Joi.string().custom(objectId).required(),
        startDate: Joi.date().min('now').required(),
        endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    }),
};

const getUserSchedules = {
    query: Joi.object().keys({
        status: Joi.string().valid('active', 'paused', 'suspended', 'completed', 'cancelled').optional(),
        contributionType: Joi.string().valid('ds', 'sb', 'ibs').optional(),
        isActive: Joi.boolean().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    }),
};

const getSchedule = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
};

const updateSchedule = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        amount: Joi.number().positive().optional(),
        frequency: Joi.string().valid('daily', 'weekly', 'bi-weekly', 'monthly').optional(),
        storedCardId: Joi.string().custom(objectId).optional(),
        endDate: Joi.date().optional(),
    }).min(1),
};

const pauseSchedule = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        pausedUntil: Joi.date().greater('now').optional(),
    }),
};

const resumeSchedule = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
};

const cancelSchedule = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
};

const getPaymentLogs = {
    params: Joi.object().keys({
        scheduleId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        status: Joi.string().valid('pending', 'processing', 'success', 'failed', 'cancelled').optional(),
    }),
};

const getAllSchedules = {
    query: Joi.object().keys({
        status: Joi.string().valid('active', 'paused', 'suspended', 'completed', 'cancelled').optional(),
        contributionType: Joi.string().valid('ds', 'sb', 'ibs').optional(),
        userId: Joi.string().custom(objectId).optional(),
        packageId: Joi.string().custom(objectId).optional(),
        frequency: Joi.string().valid('daily', 'weekly', 'bi-weekly', 'monthly').optional(),
        isActive: Joi.boolean().optional(),
        isDue: Joi.boolean().optional(),
        sortBy: Joi.string().valid('createdAt', 'nextPaymentDate', 'amount', 'status').default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        search: Joi.string().optional(), // Search by user email or name
    }),
};

module.exports = {
    createSchedule,
    getUserSchedules,
    getSchedule,
    updateSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    getPaymentLogs,
    getAllSchedules,
}; 