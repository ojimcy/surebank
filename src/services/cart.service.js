/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Cart, CartItem, ProductCatalogue, Ledger, Sales, SalesItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { ACCOUNT_TYPE, DIRECTION_VALUE, SALES_PAYMENT_METHOD } = require('../constants/account');

/**
 * Initialize a new cart for the user
 * @param {string} userId - The ID of the user
 * @param {number} total - The initial total value of the cart
 * @returns {Promise<Object>} The created cart
 */
const initCart = async (userId, total) => {
  const newCart = new Cart({
    userId,
    total,
  });
  await newCart.save();
  return newCart;
};

/**
 * Add an item to the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @param {number} unitPrice - The unit price of the item
 * @param {number} quantity - The quantity of the item
 * @returns {Promise<Object>} The updated cart and added cart item
 */
const addToCart = async (userId, productCatalogueId, unitPrice, quantity) => {
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Initialize Cart
      const subTotal = unitPrice * quantity;
      cart = await initCart(userId, subTotal);
    }

    const subTotal = unitPrice * quantity;
    const cartId = cart._id;

    const addItem = await CartItem.create({
      cartId,
      productCatalogueId,
      unitPrice,
      quantity,
      subTotal,
    });

    cart.total += subTotal;
    await cart.save();

    return { cart, addItem };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding item to cart');
  }
};

/**
 * Get the cart and its items
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The cart and its items
 */
const getCartItems = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }
    const cartItems = await CartItem.find({ cartId: cart._id });
    return { cart, cartItems };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving cart items');
  }
};

/**
 * Remove an item from the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<Object>} The updated cart and removed cart item
 */
const removeCartItem = async (userId, productCatalogueId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }
    const cartItem = await CartItem.findOneAndRemove({
      productCatalogueId,
      cartId: cart._id,
    });
    const subTotal = cartItem ? +cartItem.subTotal : 0;
    cart.total -= parseFloat(subTotal);
    const result = await cart.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error removing cart item');
  }
};

/**
 * Clear the cart by removing all items
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The deleted cart
 */
const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }
    await CartItem.deleteMany({ cartId: cart._id });
    const deletedCart = await cart.remove();
    return deletedCart;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error clearing cart');
  }
};

const checkProductAvailability = async (productCatalogueId, quantityDemand) => {
  const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
  if (productCatalogue) {
    const { quantity } = productCatalogue;
    return quantity >= quantityDemand;
  }
  return false;
};

/**
 * Update inventory
 * @param {ObjectId} productCatalogueId
 * @param {Object} quantityDemand
 * @returns {Promise<User>}
 */
const updateInventory = async (productCatalogueId, quantityDemand, session) => {
  const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
  if (!productCatalogue) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  const newQuantity = productCatalogue.quantity - quantityDemand;
  productCatalogue.quantity = newQuantity;
  await ProductCatalogue.findByIdAndUpdate(productCatalogueId, { quantity: newQuantity }, { session });
};

/**
 * Commit a sale by creating sales records, updating inventory, and posting ledger entries.
 * @param {string} userId - The ID of the user initiating the sale.
 * @param {Object} salesData - The sales data.
 * @param {Object} session - The database session object for transactional consistency.
 * @returns {Promise<Object>} The result of the sale operation
 */
const commitSale = async (userId, salesData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    const cartId = cart._id;
    const { total } = cart;

    const cartItems = await CartItem.find({ cartId }).session(session);
    if (cartItems.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No items in the cart');
    }

    const sales = await Sales.create([{ ...salesData, userId, total, branchId: salesData.branchId }], { session });

    for (let i = 0; i < cartItems.length; i += 1) {
      const item = cartItems[i];
      const isAvailable = await checkProductAvailability(item.productCatalogueId, item.quantity);
      if (isAvailable) {
        await SalesItem.create(
          [
            {
              salesId: sales[0]._id,
              productCatalogueId: item.productCatalogueId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subTotal: item.subTotal,
            },
          ],
          { session }
        );

        const updateInventoryResult = await updateInventory(item.productCatalogueId, item.quantity, session);
        if (!updateInventoryResult) {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Product Catalogue could not be updated');
        }
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Product not available');
      }
    }

    if (SALES_PAYMENT_METHOD.includes(salesData.paymentMethod)) {
      const currentDate = new Date().getTime();
      const amount = total;
      const type = ACCOUNT_TYPE[0];
      const direction = DIRECTION_VALUE[0];
      const narration = 'Sale Transaction';
      const { branchId } = salesData;

      await Ledger.create([{ date: currentDate, amount, type, direction, narration, branchId, userId }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return { message: 'Sale committed successfully', error: null };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
  commitSale,
};
