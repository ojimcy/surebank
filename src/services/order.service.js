const { startSession } = require('mongoose');
const httpStatus = require('http-status');
const { Order, Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
const createOrder = async (orderData) => {
  let shippingPrice = 0;

  const newOrderData = { ...orderData };

  if (newOrderData.shippingMethod === 'home-delivery') {
    shippingPrice = 500;
  }

  newOrderData.shippingPrice = shippingPrice;

  newOrderData.paymentResult = {
    status: 'pending',
  };

  const order = await Order.create(newOrderData);
  return order;
};

/**
 * Get all orders
 * @returns {Promise<Array>} Array of all orders
 */
const getAllOrders = async () => {
  const orders = await Order.find().populate('user');
  return orders;
};

/**
 * Get an order by its ID
 * @param {string} orderId - order ID
 * @returns {Promise<Object>} The retrieved order
 * @throws {ApiError} If the order is not found
 */
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Update a order by its ID
 * @param {string} orderId - order ID
 * @param {Object} updateData - Data to update the order
 * @returns {Promise<Object>} The updated order
 * @throws {ApiError} If the order is not found
 */
const updateOrderById = async (orderId, updateData) => {
  const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Get orders by userId
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of orders belonging to the user
 */
const getOrdersByUserId = async (userId) => {
  const orders = await Order.find({ user: userId });
  return orders;
};

/**
 * Pay an order
 * @param {string} orderId - ID of the order to pay
 * @param {Object} paymentData - Payment data from the request body
 * @returns {Promise<Object>} Paid order
 */
const payOrder = async (orderId, paymentData) => {
  const session = await startSession();
  session.startTransaction();

  try {
    // Find the order by ID
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.paymentMethod === 'wallet') {
      // Deduct the order price from the customer's balance
      const customerAccount = await Account.findOne({ user: order.user }).session(session);

      if (!customerAccount) {
        throw new ApiError(404, 'Customer account not found');
      }

      if (customerAccount.availableBalance < order.totalPrice) {
        throw new ApiError(400, 'Insufficient balance to pay for the order');
      }

      // Create a transaction to deduct the order price from the customer's balance
      const transactionDate = new Date().getTime();
      await AccountTransaction.create(
        [
          {
            accountNumber: customerAccount.accountNumber,
            amount: -order.totalPrice,
            createdBy: order.user,
            branchId: customerAccount.branchId,
            date: transactionDate,
            direction: 'outflow',
            narration: 'Order Payment',
          },
        ],
        { session }
      );

      // Update the customer's available and ledger balances
      customerAccount.availableBalance -= order.totalPrice;
      customerAccount.ledgerBalance -= order.totalPrice;
      await customerAccount.save();

      // Commit the payment transaction
      await session.commitTransaction();

      // Set order properties for payment
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    // Update payment result status only
    if (order.paymentMethod === 'wallet') {
      order.paymentResult.status = 'paid';
    } else {
      // If not "wallet" payment, update the full payment result
      order.paymentResult = {
        id: paymentData.id,
        status: paymentData.status,
        email_address: paymentData.payer.email_address,
      };
    }

    // Save the updated order
    const paidOrder = await order.save();

    session.endSession();

    return paidOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  getOrdersByUserId,
  payOrder,
};
