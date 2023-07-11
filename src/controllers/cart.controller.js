const mongoose = require('mongoose');
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

const commitSale = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const salesData = {
    ...req.body,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const makeSales = await cartService.commitSale(userId, salesData, session);

    if (makeSales.error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.BAD_REQUEST).json({ error: makeSales.error });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(httpStatus.OK).json(makeSales);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

module.exports = {
  addToCart,
  viewCartItems,
  removeCartItem,
  clearCart,
  commitSale,
};
