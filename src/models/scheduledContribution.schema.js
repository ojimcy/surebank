const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const scheduledContributionSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
            comment: 'Target package for contributions (DS, SB, or IBS)',
        },
        contributionType: {
            type: String,
            required: true,
            enum: ['ds', 'sb', 'ibs'],
            comment: 'Type of contribution: ds=Daily Savings, sb=Savings Buying, ibs=Interest Based Savings',
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
            comment: 'Amount to contribute per schedule',
        },
        frequency: {
            type: String,
            required: true,
            enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
            comment: 'How often to make the contribution',
        },
        storedCardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StoredCard',
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            comment: 'Whether the schedule is active',
        },
        startDate: {
            type: Date,
            required: true,
            comment: 'When the schedule should start',
        },
        endDate: {
            type: Date,
            required: false,
            comment: 'When the schedule should end (optional)',
        },
        nextPaymentDate: {
            type: Date,
            required: true,
            index: true,
            comment: 'Next scheduled payment date',
        },
        lastPaymentDate: {
            type: Date,
            required: false,
            comment: 'Last successful payment date',
        },
        totalPayments: {
            type: Number,
            default: 0,
            comment: 'Total number of successful payments made',
        },
        totalAmount: {
            type: Number,
            default: 0,
            comment: 'Total amount successfully contributed',
        },
        failedPayments: {
            type: Number,
            default: 0,
            comment: 'Number of consecutive failed payments',
        },
        maxRetries: {
            type: Number,
            default: 3,
            comment: 'Maximum retry attempts for failed payments',
        },
        pausedUntil: {
            type: Date,
            required: false,
            comment: 'Date until which the schedule is paused',
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'suspended', 'completed', 'cancelled'],
            default: 'active',
            comment: 'Current status of the schedule',
        },
        suspendedReason: {
            type: String,
            required: false,
            comment: 'Reason for suspension',
        },
        suspendedAt: {
            type: Date,
            required: false,
            comment: 'Date when the schedule was suspended',
        },
        pausedAt: {
            type: Date,
            required: false,
            comment: 'Date when the schedule was paused',
        },
        cancelledAt: {
            type: Date,
            required: false,
            comment: 'Date when the schedule was cancelled',
        },
        lastAttemptDate: {
            type: Date,
            required: false,
            comment: 'Last payment attempt date (success or failure)',
        },
        metadata: {
            type: Object,
            default: {},
            comment: 'Additional schedule metadata',
        },
    },
    {
        timestamps: true,
    }
);

// Add compound indexes for efficient queries
scheduledContributionSchema.index({ userId: 1, isActive: 1 });
scheduledContributionSchema.index({ nextPaymentDate: 1, isActive: 1 });
scheduledContributionSchema.index({ contributionType: 1, isActive: 1 });
scheduledContributionSchema.index({ status: 1, nextPaymentDate: 1 });

// Add plugins
scheduledContributionSchema.plugin(toJSON);
scheduledContributionSchema.plugin(paginate);

module.exports = scheduledContributionSchema; 