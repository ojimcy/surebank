const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { cartService } = require('../services');

const addToCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId, unitPrice, quantity } = req.body;
  const { cart, addItem } = await cartService.addToCart(userId, productCatalogueId, unitPrice, quantity);
  res.status(httpStatus.CREATED).send({ cart, addItem });
});

const viewCartItems = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { cart, cartItems } = await cartService.getCartItems(userId);
  res.status(httpStatus.OK).send({ cart, cartItems });
});

const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId } = req.body;
  await cartService.removeCartItem(userId, productCatalogueId);
  res.status(httpStatus.OK).send();
});

const clearCart = catchAsync(async (req, res) => {
  const { userId } = req.user._id;
  await cartService.clearCart(userId);
  res.status(httpStatus.OK).send();
});

module.exports = {
  addToCart,
  viewCartItems,
  removeCartItem,
  clearCart,
};
