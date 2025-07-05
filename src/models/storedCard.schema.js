const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const storedCardSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        authorizationCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            comment: 'Paystack authorization code for recurring payments',
        },
        cardType: {
            type: String,
            required: true,
            trim: true,
            comment: 'Card brand (visa, mastercard, etc.)',
        },
        last4: {
            type: String,
            required: true,
            trim: true,
            comment: 'Last 4 digits of the card',
        },
        expiryMonth: {
            type: String,
            required: true,
            trim: true,
            comment: 'Card expiry month (MM)',
        },
        expiryYear: {
            type: String,
            required: true,
            trim: true,
            comment: 'Card expiry year (YYYY)',
        },
        bank: {
            type: String,
            required: true,
            trim: true,
            comment: 'Issuing bank name',
        },
        signature: {
            type: String,
            required: true,
            trim: true,
            comment: 'Paystack card signature',
        },
        isActive: {
            type: Boolean,
            default: true,
            comment: 'Whether the card is active for payments',
        },
        isDefault: {
            type: Boolean,
            default: false,
            comment: 'Whether this is the user default card',
        },
        lastValidated: {
            type: Date,
            default: Date.now,
            comment: 'Last time the card was validated',
        },
        failedAttempts: {
            type: Number,
            default: 0,
            comment: 'Number of consecutive failed payment attempts',
        },
        metadata: {
            type: Object,
            default: {},
            comment: 'Additional card metadata from Paystack',
        },
    },
    {
        timestamps: true,
    }
);

// Add compound index for efficient queries
storedCardSchema.index({ userId: 1, isActive: 1 });
storedCardSchema.index({ userId: 1, isDefault: 1 });

// Add plugins
storedCardSchema.plugin(toJSON);
storedCardSchema.plugin(paginate);

module.exports = storedCardSchema; 