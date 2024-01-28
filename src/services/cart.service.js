/* eslint-disable no-await-in-loop */
const httpStatus = require('http-status');
const { Cart, CartItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { getProductCatalogueById } = require('./product.service');

/**
 * Initialize a new cart for the user
 * @param {string} userId - The ID of the user
 * @param {number} total - The initial total value of the cart
 * @returns {Promise<Object>} The created cart
 */
const initCart = async (userId) => {
  const CartModel = await Cart();
  const newCart = new CartModel({
    userId,
  });
  await newCart.save();
  return newCart;
};

/**
 * Add an item to the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @param {number} quantity - The quantity of the item
 * @returns {Promise<Object>} The updated cart and added cart item
 */
const addToCart = async (userId, productCatalogueId, quantity) => {
  const CartModel = await Cart();
  const CartItemModel = await CartItem();

  const product = await getProductCatalogueById(productCatalogueId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    // Initialize Cart
    cart = await initCart(userId);
  } else {
    // Check if the item already exists in the cart
    const existingItem = await CartItemModel.findOne({
      cartId: cart._id,
      productCatalogueId,
    });
    if (existingItem) {
      return { cart, cartItem: { ...existingItem.toObject(), product } };
    }
  }

  // If the item doesn't exist, create a new cart item
  const subTotal = product.sellingPrice * quantity;
  const cartId = cart._id;

  const cartItem = await CartItemModel.create({
    cartId,
    productCatalogueId,
    unitPrice: product.sellingPrice,
    quantity,
    subTotal,
  });
  cart.total += subTotal;
  await cart.save();

  return { cart, cartItem };
};

/**
 * Get the cart and its items with product details
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The cart and its items with product details
 */
const getCartItems = async (userId) => {
  const CartModel = await Cart();
  const CartItemModel = await CartItem();

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  const cartItems = await CartItemModel.find({ cartId: cart._id });
  const cartItemsWithProductDetails = await Promise.all(
    cartItems.map(async (cartItem) => {
      const product = await getProductCatalogueById(cartItem.productCatalogueId);
      if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
      }

      return {
        ...cartItem.toObject(),
        product,
      };
    })
  );

  return { cart, cartItems: cartItemsWithProductDetails };
};

/**
 * Remove an item from the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<Object>} The updated cart and removed cart item
 */
const removeCartItem = async (userId, productCatalogueId) => {
  const CartModel = await Cart();
  const CartItemModel = await CartItem();

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  const cartItem = await CartItemModel.findOneAndRemove({
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
  try {
    const CartModel = await Cart();
    const CartItemModel = await CartItem();

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }
    await CartItemModel.deleteMany({ cartId: cart._id });
    const deletedCart = await cart.remove();
    return deletedCart;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error clearing cart');
  }
};

/**
 * Increase the quantity of an item in the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<Object>} The updated cart and modified cart item
 */
const increaseQuantity = async (userId, productCatalogueId) => {
  const CartModel = await Cart();
  const CartItemModel = await CartItem();

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  const cartItem = await CartItemModel.findOne({
    cartId: cart._id,
    productCatalogueId,
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  const product = await getProductCatalogueById(productCatalogueId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if increasing the quantity exceeds the available stock
  if (cartItem.quantity < product.quantity) {
    // Increase the quantity by one
    cartItem.quantity += 1;
    cartItem.subTotal = cartItem.unitPrice * cartItem.quantity;
    await cartItem.save();

    // Update the total in the cart
    cart.total += cartItem.unitPrice;
    await cart.save();

    return { cart, cartItem };
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Exceeds available stock');
};

/**
 * Decrease the quantity of an item in the cart
 * @param {string} userId - The ID of the user
 * @param {string} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<Object>} The updated cart and modified cart item
 */
const decreaseQuantity = async (userId, productCatalogueId) => {
  const CartModel = await Cart();
  const CartItemModel = await CartItem();

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  const cartItem = await CartItemModel.findOne({
    cartId: cart._id,
    productCatalogueId,
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // Decrease the quantity by one, but ensure it doesn't go below 1
  cartItem.quantity = Math.max(1, cartItem.quantity - 1);
  cartItem.subTotal = cartItem.unitPrice * cartItem.quantity;
  await cartItem.save();

  // Update the total in the cart
  cart.total -= cartItem.unitPrice;
  await cart.save();

  return { cart, cartItem };
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
};
