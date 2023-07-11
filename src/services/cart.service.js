/* eslint-disable no-await-in-loop */
const httpStatus = require('http-status');
const { Cart, CartItem, ProductCatalogue, Sales, Ledger, SalesItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { SALES_PAYMENT_METHOD } = require('../constants/sales');

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
};

/**
 * Get the cart and its items
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The cart and its items
 */
const getCartItems = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }
  const cartItems = await CartItem.find({ cartId: cart._id });
  return { cart, cartItems };
};

/**
 * Remove an item from the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<Object>} The updated cart and removed cart item
 */
const removeCartItem = async (userId, productCatalogueId) => {
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
};

/**
 * Clear the cart by removing all items
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The deleted cart
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  await CartItem.deleteMany({ cartId: cart._id });
  const deletedCart = await cart.remove();
  return deletedCart;
};

const checkProductAvailability = async (productCatalogueId, quantityDemand) => {
  const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
  if (productCatalogue) {
    const { quantity } = productCatalogue;
    return quantity >= quantityDemand;
  }
  return false;
};

const updateInventory = async (productCatalogueId, quantityDemand, session) => {
  try {
    const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
    if (!productCatalogue) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const newQuantity = productCatalogue.quantity - quantityDemand;
    await ProductCatalogue.findByIdAndUpdate(productCatalogueId, { quantity: newQuantity }, { session });

    return { message: 'success', error: null };
  } catch (err) {
    return { message: null, error: err.message };
  }
};

/**
 * Commit a sale by creating sales records, updating inventory, and posting ledger entries.
 * @param {string} userId - The ID of the user
 * @param {Object} salesData - The sales data
 * @param {Object} session - The database session
 * @returns {Promise<Object>} The result of the sale operation
 */
const commitSale = async (userId, salesData, session) => {
  try {
    // Retrieve the user's cart
    const cart = await Cart.findOne({ userId });
    const cartId = cart._id;
    const { total } = cart;
    // Retrieve cart items
    const cartItems = await CartItem.find({ cartId });
    if (!cartItems.length) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Item in the Cart');
    }

    // Create a sales record
    const createSale = await Sales.create(
      [
        {
          ...salesData,
          userId,
          total,
        },
      ],
      { session }
    );
    console.log(createSale[0]);
    // Process each cart item
    for (let i = 0; i < cartItems.length; i += 1) {
      const item = cartItems[i];
      const isAvailable = await checkProductAvailability(item.productCatalogueId, item.quantity);
      if (isAvailable) {
        // Create a sales item record
        try {
          console.log(item.subTotal, item.quantity, item.unitPrice, item.productCatalogueId, createSale[0]._id);
          const saleRecord = await SalesItem.create(
            {
              subTotal: item.subTotal,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              productCatalogueId: item.productCatalogueId,
              salesId: createSale[0]._id,
            },
            { session }
          );
          console.log(saleRecord);
        } catch (error) {
          console.error(error.message);
        }

        // Update inventory
        const result = await updateInventory(item.productCatalogueId, item.quantity, session);
        if (!result) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Product Catalogue could not be updated');
        }
      } else {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not available');
      }
    }

    if (salesData.paymentMethod === SALES_PAYMENT_METHOD[1]) {
      // TODO: Check if the wallet balance is enough for the transaction
      // TODO: Withdraw money from wallet before posting the ledger

      const date = new Date().getTime();
      const amount = total;
      const type = ACCOUNT_TYPE[0];
      const direction = DIRECTION_VALUE[0];
      const naration = salesData.salesRepId;
      const { branchId } = salesData;

      // Create a ledger entry
      await Ledger.create(
        {
          date,
          amount,
          type,
          direction,
          naration,
          branchId,
          userId,
        },
        { session }
      );

      return { message: 'success', error: null };
    }
    // TODO: Check for Cash or Transfer
  } catch (err) {
    return { message: null, error: err.message };
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
  commitSale,
};
