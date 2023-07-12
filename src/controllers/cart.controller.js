const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { cartService } = require('../services');

const addToCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productCatalogueId, unitPrice, quantity } = req.body;
  const { cart, addItem } = await cartService.addToCart(userId, productCatalogueId, unitPrice, quantity);
  res.status(httpStatus.CREATED).send({
    data: {
      cart,
      addItem,
    },
  });
});

const viewCartItems = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { cart, cartItems } = await cartService.getCartItems(userId);
  res.status(httpStatus.OK).send({
    data: {
      cart,
      cartItems,
    },
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

const commitSale = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const salesData = { ...req.body };
  await cartService.commitSale(userId, salesData);
  res.status(httpStatus.OK).send({ message: 'Sale committed successfully' });
});

module.exports = {
  addToCart,
  viewCartItems,
  removeCartItem,
  clearCart,
  commitSale,
};
