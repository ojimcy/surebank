const { startSession } = require('mongoose');
const httpStatus = require('http-status');
const { ProductCatalogue, Order, SbPackage, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { clearCart, getCartItems } = require('./cart.service');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { addLedgerEntry } = require('./accounting.service');

/**
 * Check product availability based on its ID and requested quantity
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @param {number} requestedQuantity - The requested quantity
 * @param {ClientSession} session - The Mongoose client session
 * @returns {Promise<void>} - Throws an error if the product is not available
 */
const checkProductAvailability = async (productCatalogueId, requestedQuantity, session) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const product = await ProductCatalogueModel.findById(productCatalogueId).session(session);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (product.quantity < requestedQuantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient stock for the requested quantity');
  }
};

/**
 * Update the quantity of a product in a transactional manner
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @param {number} requestedQuantity - The requested quantity
 * @returns {Promise<void>} - Throws an error if the product is not available
 */
const updateProductQuantity = async (productCatalogueId, requestedQuantity) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const product = await ProductCatalogueModel.findById(productCatalogueId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (product.quantity < requestedQuantity) {
    throw new ApiError(400, 'Insufficient stock for the requested quantity');
  }

  product.quantity -= requestedQuantity;
  await product.save();
};

/**
 * Place an order
 * @param {string} userId - The ID of the user placing the order
 * @param {Object} orderDetails - Details of the order including items, delivery address, and payment information
 * @returns {Promise<Object>} The placed order
 */
const createOrder = async (userId, orderDetails) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const OrderModel = await Order();

  const session = await startSession();
  session.startTransaction();
  try {
    const products = await getCartItems(userId);
    // Check product availability and update quantities
    await Promise.all(
      products.cartItems.map(async (cartItem) => {
        const { productCatalogueId, quantity } = cartItem;
        const productCat = ProductCatalogueModel.findById(productCatalogueId);
        if (productCat.quantity < quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient stock for the requested quantity');
        }
      })
    );
    // Calculate total price and create the order
    const totalAmount = products.cartItems.reduce((total, item) => total + item.subTotal, 0);
    const order = await OrderModel.create(
      [
        {
          products: products.cartItems.map((item) => ({
            productCatalogueId: item.productCatalogueId,
            name: item.name,
            image: item.images[0],
            packageId: item.packageId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            subTotal: item.subTotal,
          })),
          deliveryAddress: {
            fullName: orderDetails.deliveryAddress.fullName,
            phoneNumber: orderDetails.deliveryAddress.phoneNumber,
            address: orderDetails.deliveryAddress.address,
            state: orderDetails.deliveryAddress.state,
            city: orderDetails.deliveryAddress.city,
            branchId: orderDetails.deliveryAddress.branchId,
          },
          paymentMethod: orderDetails.paymentMethod,
          totalAmount,
          status: 'pending',
          createdBy: userId,
          shippingPrice: orderDetails.shippingPrice || 0,
          isPaid: false,
          isDelivered: false,
        },
      ],
      { session }
    );

    // Clear the user's cart
    await clearCart(userId, session);

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get order by ID
 * @param {string} orderId - The ID of the order
 * @returns {Promise<Object>} The order data
 */
const getOrder = async (orderId) => {
  const OrderModel = await Order();
  const order = await OrderModel.findById(orderId)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName',
    })
    .populate({
      path: 'products.productCatalogueId',
      select: 'name images',
    })
    .exec();
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Get all orders with optional filters
 * @param {Object} filters - Optional filters for querying orders
 * @returns {Promise<Array>} Array of order data
 */
const getAllOrders = async (branchId, createdBy, status) => {
  const OrderModel = await Order();
  const query = {};
  if (branchId) query.branchId = branchId;
  if (createdBy) query.createdBy = createdBy;
  if (status) query.status = status;

  const orders = await OrderModel.find(query)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName',
    })
    .populate({
      path: 'products.productCatalogueId',
      select: 'name images',
    })
    .sort({ date: -1 })
    .exec();
  return orders;
};

/**
 * Update order by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrder = async (orderId, updateBody) => {
  const order = await getOrder(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'order not found');
  }

  Object.assign(order, updateBody);
  await order.save();
  return order;
};

/**
 * Pay an order using sb_balance payment method
 * @param {string} packageId - The ID of the user making the payment
 * @param {string} orderId - The ID of the order to be paid
 * @returns {Promise<Object>} Result of the payment operation
 */
const payOrderWithSbBalance = async (packageId, orderId, userId) => {
  const SbPackageModel = await SbPackage();
  const session = await startSession();
  session.startTransaction();
  try {
    // Retrieve order details
    const order = await getOrder(orderId);
    const userPackage = await SbPackageModel.findById(packageId);
    const AccountTransactionModel = await AccountTransaction();
    const currentDate = new Date().getTime();

    // Check if the user has enough balance in the package
    if (userPackage.totalContribution < order.totalAmount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance to pay for the order');
    }

    // Deduct the order total amount from the user's package
    await SbPackageModel.findByIdAndUpdate(
      userPackage._id,
      {
        $inc: {
          totalContribution: -order.totalAmount,
        },
      },
      { session }
    );

    // Update order status, isPaid, and paidAt fields
    const updatedOrder = await updateOrder(
      orderId,
      {
        status: 'paid',
        isPaid: true,
        paidAt: currentDate,
      },
      { session }
    );

    // Add ledger entry (you may need to adapt this based on your implementation)
    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE[0],
      direction: DIRECTION_VALUE[0],
      date: currentDate,
      narration: 'Payment for Order',
      amount: order.totalAmount,
      userId: userPackage.userId,
      branchId: order.deliveryAddress.branchId,
    };

    await addLedgerEntry(addLedgerEntryInput, session);

    // Record the payment in the user's account transactions
    await AccountTransactionModel.create(
      [
        {
          accountNumber: userPackage.accountNumber,
          amount: order.totalAmount,
          createdBy: userId,
          branchId: order.deliveryAddress.branchId,
          date: currentDate,
          direction: 'inflow',
          narration: `Payment for Order`,
          userId: userPackage.userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Deliver an order
 * @param {string} orderId - The ID of the order to be delivered
 * @returns {Promise<Object>} Result of the delivery operation
 */
const deliverOrder = async (orderId) => {
  const order = await getOrder(orderId);

  if (order.isDelivered) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order is already delivered');
  }

  order.isDelivered = true;
  order.status = 'delivered';
  order.deliveredAt = new Date().getTime();
  await order.save();

  return order;
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order to be canceled
 * @returns {Promise<Object>} Result of the cancellation operation
 */
const cancelOrder = async (orderId) => {
  const order = await getOrder(orderId);

  if (order.status === 'canceled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order is already canceled');
  }

  order.status = 'canceled';
  await order.save();

  return order;
};

module.exports = {
  checkProductAvailability,
  updateProductQuantity,
  createOrder,
  getOrder,
  getAllOrders,
  updateOrder,
  payOrderWithSbBalance,
  deliverOrder,
  cancelOrder,
};
