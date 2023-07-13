const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { ProductCatalogue, Sales, SalesItem, Ledger, Cart, CartItem } = require('../models');
const { ACCOUNT_TYPE, DIRECTION_VALUE, PAYMENT_STATUS } = require('../constants/account');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');

/**
 * Check product availability by product catalogue ID and quantity demand
 * @param {ObjectId} productCatalogueId - The ID of the product catalogue
 * @param {number} quantityDemand - The quantity demand
 * @returns {Promise<boolean>} Indicates whether the product is available or not
 */
const checkProductAvailability = async (productCatalogueId, quantityDemand) => {
  const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
  if (productCatalogue) {
    const { quantity } = productCatalogue;
    return quantity >= quantityDemand;
  }
  return false;
};

/**
 * Get product catalogue by ID
 * @param {ObjectId} productCatalogueId - The ID of the product catalogue
 * @returns {Promise<ProductCatalogue>} The product catalogue
 */
const getProductCatalogueById = async (productCatalogueId) => {
  const productCatalogue = await ProductCatalogue.findById(productCatalogueId);
  return productCatalogue;
};

/**
 * Update product catalogue quantity by ID
 * @param {ObjectId} productCatalogueId - The ID of the product catalogue
 * @param {number} quantity - The updated quantity
 * @param {Object} session - The database session object for transactional consistency
 * @returns {Promise<ProductCatalogue>} The updated product catalogue
 */
const updateQuantity = async (productCatalogueId, quantity, session) => {
  const updatedProductCatalogue = await ProductCatalogue.findByIdAndUpdate(
    productCatalogueId,
    { quantity },
    { new: true, session }
  );
  return updatedProductCatalogue;
};

/**
 * Commit a sale by creating sales records, updating inventory, and posting ledger entries.
 * @param {string} userId - The ID of the user initiating the sale.
 * @param {Object} salesData - The sales data.
 * @returns {Promise<void>}
 */
const commitSale = async (userId, salesData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    const cartItems = await CartItem.find({ cartId: cart._id });

    if (cartItems.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No items in the cart');
    }

    const sales = await Sales.create(
      [
        {
          ...salesData,
          userId,
          total: cart.total,
        },
      ],
      { session }
    );

    await Promise.all(
      cartItems.map(async (cartItem) => {
        const productCatalogue = await getProductCatalogueById(cartItem.productCatalogueId);

        const isAvailable = await checkProductAvailability(productCatalogue._id, cartItem.quantity);
        if (!isAvailable) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Product not available');
        }

        await SalesItem.create(
          [
            {
              salesId: sales[0]._id,
              productCatalogueId: productCatalogue._id,
              unitPrice: cartItem.unitPrice,
              quantity: cartItem.quantity,
              subTotal: cartItem.subTotal,
            },
          ],
          { session }
        );

        await updateQuantity(productCatalogue._id, productCatalogue.quantity - cartItem.quantity, session);
      })
    );
    const ledgerEntry = {
      amount: sales[0].total,
      userId,
      branchId: sales[0].branchId,
      narration: `Sales of ${sales[0].total}`,
      type: ACCOUNT_TYPE[0],
      direction: DIRECTION_VALUE[0],
      date: new Date(),
    };

    await Ledger.create([ledgerEntry], { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const viewSales = async (userId, filters, pagination) => {
  let baseQuery = {};

  // Check if the user is a salesRep
  const salesRep = await Sales.findOne({ salesRepId: userId });
  if (salesRep) {
    baseQuery = { salesRepId: userId };
  } else {
    // Check if the user is a merchant
    const merchant = await Sales.findOne({ merchantId: userId });
    if (merchant) {
      baseQuery = { merchantId: userId };
    } else {
      // Check if the user is a user associated with a merchant
      const merchantByUserId = await getMerchantByUserId(userId);
      if (merchantByUserId && merchantByUserId.userId.toString() === userId.toString()) {
        baseQuery = { merchantId: merchantByUserId.userId };
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid user');
      }
    }
  }
  // Apply additional filters if provided
  const query = { ...baseQuery, ...filters };

  // Apply pagination options if provided
  const { sortBy, limit = 10, page = 1 } = pagination;
  const sortOptions = sortBy ? sortBy.split(':') : [];
  const sortField = sortOptions[0];
  const sortOrder = sortOptions[1] === 'desc' ? -1 : 1;
  const options = {
    sort: sortField ? { [sortField]: sortOrder } : undefined,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
  };

  // Retrieve sales data based on the constructed query and options
  const salesData = await Sales.paginate(query, options);

  // Check if no sales data found
  if (salesData.totalDocs === 0) {
    return {
      sales: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
      message: 'No sales data available for the user',
    };
  }

  return salesData;
};

/**
 * Cancel a sale by updating its status and refunding product quantities
 * @param {string} salesId - The ID of the sale
 * @returns {Promise<object>} The updated sale document
 */
const cancelSale = async (salesId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sales.findById(salesId);

    // Check if the user is authorized to cancel the sale
    if (userId !== sale.userId.toString()) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized to cancel the sale');
    }

    const updateSale = await Sales.findByIdAndUpdate(salesId, { status: PAYMENT_STATUS[1] }, { session });

    const saleItems = await SalesItem.find({ salesId });

    await Promise.all(
      saleItems.map(async (item) => {
        const { quantity, productCatalogueId } = item;
        const productCat = await ProductCatalogue.findById(productCatalogueId);
        await ProductCatalogue.findByIdAndUpdate(
          productCatalogueId,
          { quantity: quantity + productCat.quantity },
          { session }
        );
      })
    );

    await session.commitTransaction();
    session.endSession();

    return updateSale;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * Cancel a sale by updating its status and refunding product quantities
 * @param {string} salesId - The ID of the sale
 * @returns {Promise<object>} The updated sale document
 */
const updatePayment = async (salesId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const sales = await Sales.findById(salesId);
  if (!sales) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sale not found');
  }

  // Check if the sale status is "approved"
  if (sales.status !== PAYMENT_STATUS[2]) {
    await Sales.findByIdAndUpdate(salesId, { status: PAYMENT_STATUS[0] }, { session });

    const date = new Date().getTime();
    const amount = sales.total;
    const type = ACCOUNT_TYPE[0];
    const direction = DIRECTION_VALUE[0];
    const narration = sales.salesRepId;
    const { branchId } = sales;

    const ledger = await Ledger.create(
      [
        {
          date,
          amount,
          type,
          direction,
          narration,
          branchId,
          userId: sales.userId,
        },
      ],
      { session }
    );

    return ledger;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, "Sales can't be completed");
};

const deleteSale = async (salesId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Sales.findByIdAndDelete({ _id: salesId }, { session });

    await SalesItem.deleteMany({ salesId }, { session });

    await session.commitTransaction();
    session.endSession();

    return 'Successfully Deleted';
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  commitSale,
  viewSales,
  cancelSale,
  updatePayment,
  deleteSale,
};
