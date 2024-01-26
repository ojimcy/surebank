const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { cartService } = require('../services');

const addToCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId, packageId, quantity } = req.body;
  const { cart, cartItem } = await cartService.addToCart(userId, productCatalogueId, packageId, quantity);
  res.status(httpStatus.CREATED).send({
    cart,
    cartItem,
  });
});

const viewCartItems = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { cart, cartItems } = await cartService.getCartItems(userId);
  res.status(httpStatus.OK).send({
    cart,
    cartItems,
  });
});

const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId } = req.body;
  await cartService.removeCartItem(userId, productCatalogueId);
  res.sendStatus(httpStatus.OK);
});

const clearCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  await cartService.clearCart(userId);
  res.sendStatus(httpStatus.OK);
});

const increaseQuantity = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId } = req.body;
  const { cart, cartItem } = await cartService.increaseQuantity(userId, productCatalogueId);
  res.status(httpStatus.OK).send({
    cart,
    cartItem,
  });
});

const decreaseQuantity = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId } = req.body;
  const { cart, cartItem } = await cartService.decreaseQuantity(userId, productCatalogueId);
  res.status(httpStatus.OK).send({
    cart,
    cartItem,
  });
});

module.exports = {
  addToCart,
  viewCartItems,
  removeCartItem,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
};
