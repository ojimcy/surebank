const httpStatus = require('http-status');
const { StoredCard } = require('../models');
const ApiError = require('../utils/ApiError');
const paystackService = require('./paystack.service');
const userService = require('./user.service');
const logger = require('../config/logger');

/**
 * Store a card after successful payment
 * @param {string} userId - User ID
 * @param {string} paystackReference - Paystack transaction reference
 * @param {boolean} setAsDefault - Whether to set as default card
 * @returns {Promise<Object>} Stored card details
 */
const storeCardFromTransaction = async (userId, paystackReference, setAsDefault = false) => {
    const StoredCardModel = await StoredCard();

    try {
        // Verify the transaction with Paystack
        const verification = await paystackService.verifyTransaction(paystackReference);

        if (!verification || !verification.status) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction verification failed');
        }

        const { data: transactionData } = verification;

        if (!transactionData.authorization || !transactionData.authorization.reusable) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Card is not reusable or no authorization found');
        }

        const authorization = transactionData.authorization;

        // Check if card already exists
        const existingCard = await StoredCardModel.findOne({
            userId,
            authorizationCode: authorization.authorization_code,
        });

        if (existingCard) {
            logger.info(`Card already exists for user ${userId}: ${authorization.authorization_code}`);
            return existingCard;
        }

        // If setting as default, unset other default cards
        if (setAsDefault) {
            await StoredCardModel.updateMany(
                { userId, isDefault: true },
                { isDefault: false }
            );
        }

        // Create new stored card
        const cardData = {
            userId,
            authorizationCode: authorization.authorization_code,
            cardType: authorization.card_type,
            last4: authorization.last4,
            expiryMonth: authorization.exp_month,
            expiryYear: authorization.exp_year,
            bank: authorization.bank,
            signature: authorization.signature,
            isActive: true,
            isDefault: setAsDefault,
            lastValidated: new Date(),
            metadata: {
                bin: authorization.bin,
                channel: authorization.channel,
                countryCode: authorization.country_code,
            },
        };

        const storedCard = await StoredCardModel.create(cardData);

        logger.info(`Card stored successfully for user ${userId}: ${authorization.authorization_code}`);
        return storedCard;
    } catch (error) {
        logger.error(`Error storing card for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get all stored cards for a user
 * @param {string} userId - User ID
 * @param {boolean} activeOnly - Only return active cards
 * @returns {Promise<Array>} Array of stored cards
 */
const getUserStoredCards = async (userId, activeOnly = true) => {
    const StoredCardModel = await StoredCard();

    try {
        const query = { userId };
        if (activeOnly) {
            query.isActive = true;
        }

        const cards = await StoredCardModel.find(query).sort({ isDefault: -1, createdAt: -1 });
        return cards;
    } catch (error) {
        logger.error(`Error getting stored cards for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get a specific stored card
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<Object>} Stored card
 */
const getStoredCard = async (cardId, userId) => {
    const StoredCardModel = await StoredCard();

    try {
        const card = await StoredCardModel.findOne({ _id: cardId, userId });

        if (!card) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
        }

        return card;
    } catch (error) {
        logger.error(`Error getting stored card ${cardId} for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Set a card as default
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated card
 */
const setDefaultCard = async (cardId, userId) => {
    const StoredCardModel = await StoredCard();

    try {
        // First, unset all other default cards for the user
        await StoredCardModel.updateMany(
            { userId, isDefault: true },
            { isDefault: false }
        );

        // Set the specified card as default
        const updatedCard = await StoredCardModel.findOneAndUpdate(
            { _id: cardId, userId },
            { isDefault: true },
            { new: true }
        );

        if (!updatedCard) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
        }

        logger.info(`Card ${cardId} set as default for user ${userId}`);
        return updatedCard;
    } catch (error) {
        logger.error(`Error setting default card ${cardId} for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Deactivate a stored card
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated card
 */
const deactivateCard = async (cardId, userId) => {
    const StoredCardModel = await StoredCard();

    try {
        const card = await StoredCardModel.findOne({ _id: cardId, userId });

        if (!card) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
        }

        // Deactivate the authorization in Paystack
        try {
            await paystackService.deactivateAuthorization(card.authorizationCode);
        } catch (paystackError) {
            logger.warn(`Failed to deactivate authorization in Paystack: ${paystackError.message}`);
            // Continue with local deactivation even if Paystack fails
        }

        // Update the card status
        const updatedCard = await StoredCardModel.findByIdAndUpdate(
            cardId,
            {
                isActive: false,
                isDefault: false, // Remove default status if it was default
            },
            { new: true }
        );

        logger.info(`Card ${cardId} deactivated for user ${userId}`);
        return updatedCard;
    } catch (error) {
        logger.error(`Error deactivating card ${cardId} for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Delete a stored card
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteCard = async (cardId, userId) => {
    const StoredCardModel = await StoredCard();

    try {
        const card = await StoredCardModel.findOne({ _id: cardId, userId });

        if (!card) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
        }

        // Deactivate the authorization in Paystack first
        try {
            await paystackService.deactivateAuthorization(card.authorizationCode);
        } catch (paystackError) {
            logger.warn(`Failed to deactivate authorization in Paystack: ${paystackError.message}`);
            // Continue with deletion even if Paystack fails
        }

        // Delete the card
        await StoredCardModel.findByIdAndDelete(cardId);

        logger.info(`Card ${cardId} deleted for user ${userId}`);
    } catch (error) {
        logger.error(`Error deleting card ${cardId} for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Validate a stored card
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Validation result
 */
const validateStoredCard = async (cardId, userId) => {
    const StoredCardModel = await StoredCard();

    try {
        const card = await StoredCardModel.findOne({ _id: cardId, userId });

        if (!card) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
        }

        if (!card.isActive) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Card is not active');
        }

        // Get user details
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        // Validate the authorization with a small amount (1 Naira = 100 kobo)
        const validation = await paystackService.validateAuthorization(
            card.authorizationCode,
            user.email,
            100
        );

        // Update the card's last validated time and failed attempts
        const updateData = {
            lastValidated: new Date(),
        };

        if (validation.status) {
            updateData.failedAttempts = 0;
        } else {
            updateData.failedAttempts = card.failedAttempts + 1;

            // Deactivate card if too many failed attempts
            if (updateData.failedAttempts >= 3) {
                updateData.isActive = false;
                updateData.isDefault = false;
            }
        }

        await StoredCardModel.findByIdAndUpdate(cardId, updateData);

        logger.info(`Card ${cardId} validation: ${validation.status ? 'Success' : 'Failed'}`);

        return {
            isValid: validation.status,
            message: validation.status ? 'Card is valid' : 'Card validation failed',
            failedAttempts: updateData.failedAttempts,
        };
    } catch (error) {
        logger.error(`Error validating card ${cardId} for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get user's default card
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Default card or null
 */
const getUserDefaultCard = async (userId) => {
    const StoredCardModel = await StoredCard();

    try {
        const defaultCard = await StoredCardModel.findOne({
            userId,
            isDefault: true,
            isActive: true,
        });

        return defaultCard;
    } catch (error) {
        logger.error(`Error getting default card for user ${userId}:`, error);
        throw error;
    }
};

module.exports = {
    storeCardFromTransaction,
    getUserStoredCards,
    getStoredCard,
    setDefaultCard,
    deactivateCard,
    deleteCard,
    validateStoredCard,
    getUserDefaultCard,
}; 