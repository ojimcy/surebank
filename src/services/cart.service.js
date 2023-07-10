const httpStatus = require('http-status');
const { Cart, CartItem } = require('../models');
const ApiError = require('../utils/ApiError');

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

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
};
