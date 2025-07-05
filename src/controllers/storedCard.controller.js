const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { storedCardService } = require('../services');

/**
 * Store a card from a successful transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const storeCard = catchAsync(async (req, res) => {
    const { paystackReference, setAsDefault } = req.body;
    const userId = req.user._id;

    const storedCard = await storedCardService.storeCardFromTransaction(
        userId,
        paystackReference,
        setAsDefault
    );

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Card stored successfully',
        data: storedCard,
    });
});

/**
 * Get user's stored cards
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserCards = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { activeOnly } = req.query;

    const cards = await storedCardService.getUserStoredCards(userId, activeOnly);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Cards retrieved successfully',
        data: cards,
    });
});

/**
 * Get a specific stored card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCard = catchAsync(async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user._id;

    const card = await storedCardService.getStoredCard(cardId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Card retrieved successfully',
        data: card,
    });
});

/**
 * Set a card as default
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setDefaultCard = catchAsync(async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user._id;

    const updatedCard = await storedCardService.setDefaultCard(cardId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Default card updated successfully',
        data: updatedCard,
    });
});

/**
 * Deactivate a stored card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deactivateCard = catchAsync(async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user._id;

    const updatedCard = await storedCardService.deactivateCard(cardId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Card deactivated successfully',
        data: updatedCard,
    });
});

/**
 * Delete a stored card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCard = catchAsync(async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user._id;

    await storedCardService.deleteCard(cardId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Card deleted successfully',
    });
});

/**
 * Validate a stored card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateCard = catchAsync(async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user._id;

    const validationResult = await storedCardService.validateStoredCard(cardId, userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Card validation completed',
        data: validationResult,
    });
});

/**
 * Get user's default card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDefaultCard = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const defaultCard = await storedCardService.getUserDefaultCard(userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Default card retrieved successfully',
        data: defaultCard,
    });
});

module.exports = {
    storeCard,
    getUserCards,
    getCard,
    setDefaultCard,
    deactivateCard,
    deleteCard,
    validateCard,
    getDefaultCard,
}; 