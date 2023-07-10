const httpStatus = require('http-status');
const { ProductRequest, Product, ProductCatalogue } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');

/**
 * Create product request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductRequest = async (requestData, userId) => {
  const merchant = await getMerchantByUserId(userId);

  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }
  const checkRequest = await ProductRequest.findOne({
    name: { $regex: `^${requestData.name}$`, $options: 'i' },
  });
  const checkProduct = await Product.findOne({
    name: { $regex: `^${requestData.name}$`, $options: 'i' },
  });

  if (checkProduct || checkRequest) {
    throw new ApiError(`Product with the name ${requestData.name} already exist or requested`);
  }

  return ProductRequest.create({ ...requestData, merchantId: merchant._id });
};

/**
 * View product requests with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing product requests and pagination information
 */
const viewProductRequests = async (filter, options) => {
  const productRequests = await ProductRequest.paginate(filter, options);
  return productRequests;
};

/**
 * Update product request
 * @param {string} requestId - The ID of the product request to update
 * @param {string} merchantId - The ID of the requesting merchant
 * @param {Object} updateData - The updated data for the product request
 * @returns {Promise<Object>} The updated product request
 */
const updateProductRequest = async (requestId, merchantId, updateData) => {
  // Check if the product request exists
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (productRequest.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Update the product request with the provided data
  Object.assign(productRequest, updateData);
  await productRequest.save();

  return productRequest;
};

/**
 * Delete product request
 * @param {string} requestId - The ID of the product request to delete
 * @param {string} merchantId - The ID of the requesting merchant
 * @returns {Promise<Object>} The deleted product request
 */
const deleteProductRequest = async (requestId, merchantId) => {
  // Check if the product request exists
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (productRequest.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product request
  await ProductRequest.findByIdAndRemove(requestId);

  return productRequest;
};

/**
 * Create a product catalogue
 * @param {Object} productData - Product catalogue data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductCatalogue = async (productData) => {
  // Check if the product exists and is available
  const product = await Product.findById(productData.productId);
  if (!product || product.quantity === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found or not available');
  }

  // Check if the title is unique
  const existingProductCatalogue = await ProductCatalogue.findOne({ title: productData.title });
  if (existingProductCatalogue) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with the same title already exists in the catalogue');
  }

  // Create the product catalogue entry
  const productCatalogue = await ProductCatalogue.create(productData);

  return productCatalogue;
};

/**
 * Approve a product request and create a new Product document
 * @param {string} requestId - The ID of the product request to approve
 * @returns {Promise<Object>} The created product
 */
const approveProductRequest = async (requestId) => {
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Create a new Product document using the product request data
  const newProduct = new Product({
    name: productRequest.name,
    description: productRequest.description,
    image: productRequest.image,
    longDescription: productRequest.longDescription,
    barcode: productRequest.barcode,
    categoryId: productRequest.categoryId,
    merchantId: productRequest.merchantId,
    status: 'approved',
  });

  // Save the new product document
  await newProduct.save();

  // Delete the approved product request
  await ProductRequest.findByIdAndRemove(requestId);

  return newProduct;
};

/**
 * View product with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing product and pagination information
 */
const viewProduct = async (filter, options) => {
  const product = await Product.paginate(filter, options);
  return product;
};

/**
 * Update product
 * @param {string} productId - The ID of the product to update
 * @param {string} merchantId - The ID of the  merchant
 * @param {Object} updateData - The updated data for the product
 * @returns {Promise<Object>} The updated product
 */
const updateProduct = async (productId, merchantId, updateData) => {
  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (product.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  Object.assign(product, updateData);
  await product.save();

  return product;
};

/**
 * Delete product
 * @param {string} Id - The ID of the product  to delete
 * @param {string} merchantId - The ID of the merchant
 * @returns {Promise<Object>} The deleted product
 */
const deleteProduct = async (productId, merchantId) => {
  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product belongs to the requesting merchant
  if (product.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product
  await product.findByIdAndRemove(productId);

  return product;
};

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
  createProductCatalogue,
  approveProductRequest,
  viewProduct,
  updateProduct,
  deleteProduct,
};
