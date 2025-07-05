const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const scheduledPaymentLogSchema = mongoose.Schema(
    {
        scheduledContributionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScheduledContribution',
            required: true,
            index: true,
        },
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
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
            default: 'pending',
            comment: 'Status of the payment attempt',
        },
        paystackReference: {
            type: String,
            required: false,
            trim: true,
            comment: 'Paystack transaction reference',
        },
        authorizationCode: {
            type: String,
            required: true,
            trim: true,
            comment: 'Paystack authorization code used for payment',
        },
        gatewayResponse: {
            type: String,
            required: false,
            trim: true,
            comment: 'Response message from Paystack',
        },
        errorMessage: {
            type: String,
            required: false,
            trim: true,
            comment: 'Error message if payment failed',
        },
        errorCode: {
            type: String,
            required: false,
            trim: true,
            comment: 'Error code from Paystack',
        },
        processedAt: {
            type: Date,
            required: false,
            comment: 'When the payment was processed',
        },
        scheduledFor: {
            type: Date,
            required: true,
            comment: 'When the payment was scheduled to be processed',
        },
        nextRetryAt: {
            type: Date,
            required: false,
            comment: 'When to retry the payment if failed',
        },
        retryCount: {
            type: Number,
            default: 0,
            comment: 'Number of retry attempts',
        },
        maxRetries: {
            type: Number,
            default: 3,
            comment: 'Maximum retry attempts allowed',
        },
        contributionType: {
            type: String,
            required: true,
            enum: ['ds', 'sb', 'ibs'],
            comment: 'Type of contribution',
        },
        metadata: {
            type: Object,
            default: {},
            comment: 'Additional payment metadata',
        },
    },
    {
        timestamps: true,
    }
);

// Add compound indexes for efficient queries
scheduledPaymentLogSchema.index({ scheduledContributionId: 1, createdAt: -1 });
scheduledPaymentLogSchema.index({ userId: 1, status: 1 });
scheduledPaymentLogSchema.index({ status: 1, nextRetryAt: 1 });
scheduledPaymentLogSchema.index({ paystackReference: 1 });
scheduledPaymentLogSchema.index({ scheduledFor: 1, status: 1 });

// Add plugins
scheduledPaymentLogSchema.plugin(toJSON);
scheduledPaymentLogSchema.plugin(paginate);

module.exports = scheduledPaymentLogSchema; 