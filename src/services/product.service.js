const httpStatus = require('http-status');
const { ProductRequest, Product, ProductCatalogue, ProductCollection, Collection } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');
const { slugify } = require('../utils/slugify');

/**
 * Create product request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductRequest = async (requestData, merchantId) => {
  const merchant = await getMerchantByUserId(merchantId);
  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }
  // Check if a product request with the same name already exists
  const existingProductRequest = await ProductRequest.findOne({ name: requestData.name });
  const existingProduct = await Product.findOne({ name: requestData.name });
  if (existingProductRequest || existingProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product request or product with the same name already exists');
  }

  // Create the product request
  const productRequest = await ProductRequest.create({ ...requestData, merchantId });
  return productRequest;
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
const createProductCatalogue = async (productData, userId) => {
  // Check if the product exists and is available
  const product = await Product.findById(productData.productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found or not available');
  }

  // get merchant id
  const merchant = await getMerchantByUserId(userId);
  if (!merchant) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Merchant not found, please apply');
  }

  // Check if the name is unique
  const existingProductCatalogue = await ProductCatalogue.findOne({
    name: productData.name,
    merchantId: merchant._id,
  });
  if (existingProductCatalogue) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with the same name already exists in the catalogue');
  }

  // Create the product catalogue entry
  const productCatalogue = await ProductCatalogue.create({ ...productData, merchantId: merchant._id });

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

  const existingProduct = await Product.findOne({
    name: productRequest.name,
    merchantId: productRequest.merchantId,
  });
  if (existingProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product already exists for the merchant');
  }

  // Update the status of the product request to "approved"
  productRequest.status = 'approved';
  await productRequest.save();

  // Create a new Product document using the product request data
  const newProduct = new Product({
    status: 'approved',
    name: productRequest.name,
    description: productRequest.description,
    barcode: productRequest.barcode || '',
    categoryId: productRequest.categoryId,
    subCategoryId: productRequest.subCategoryId,
    brand: productRequest.brand,
    merchantId: productRequest.merchantId,
    collections: productRequest.collections,
    variations: productRequest.variations,
    features: productRequest.features,
    shipping: productRequest.shipping,
    stock: productRequest.stock,
    tags: productRequest.tags,
    slug: slugify(productRequest.name),
  });

  // Save the new product document
  await newProduct.save();

  return newProduct;
};

/**
 * Reject a product request
 * @param {ObjectId} requestId - ID of the product request to be rejected
 * @returns {Promise<Object>} Result of the operation
 */
const rejectProduct = async (requestId, reasonForRejection) => {
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  const updatedRequest = await ProductRequest.findByIdAndUpdate(
    requestId,
    { status: 'rejected', reasonForRejection },
    { new: true }
  );
  return updatedRequest;
};

/**
 * View products with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing products and pagination information
 */
const viewProducts = async (filter, options) => {
  const product = await Product.paginate(filter, options);
  return product;
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  const product = await Product.findById(id).populate([
    { path: 'categoryId', select: 'name' },
    { path: 'subCategoryId', select: 'name' },
    { path: 'brand', select: 'name' },
  ]);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

/**
 * Update product
 * @param {string} productId - The ID of the product to update
 * @param {string} merchantId - The ID of the  merchant
 * @param {Object} updateData - The updated data for the product
 * @returns {Promise<Object>} The updated product
 */
const updateProduct = async (productId, updateData) => {
  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
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

const addProductToCollection = async (productId, collectionId) => {
  // Check if the product and collection exist
  const product = await Product.findById(productId);
  const collection = await Collection.findById(collectionId);

  if (!product || !collection) {
    throw new ApiError(404, 'Product or collection not found');
  }

  // Check if the product is already in the collection
  const productInCollection = await ProductCollection.findOne({
    productId,
    collectionId,
  });

  if (productInCollection) {
    throw new ApiError(400, 'Product is already in the collection');
  }

  const productCollection = new ProductCollection({ productId, collectionId });
  await productCollection.save();

  // Update the product's collections
  product.collections.push(collectionId);
  await product.save();

  return productCollection;
};

const getProductsBySlug = async (collectionSlug) => {
  const collection = await Collection.findOne({ slug: collectionSlug });
  if (!collection) {
    throw new ApiError(404, 'Collection not found');
  }

  const products = await Product.find({ collections: collection._id });
  return products;
};

const getProductCatalogue = async (filter, options) => {
  const product = await ProductCatalogue.paginate(filter, options);
  return product;
};

const viewMyProductCatalogue = async (userId) => {
  const merchant = await getMerchantByUserId(userId);
  const products = await ProductCatalogue.find({ merchantId: merchant._id }).populate([
    {
      path: 'productId',
      model: 'Product',
    },
    {
      path: 'merchantId',
      select: 'storeName',
    },
  ]);
  return products;
};

const deleteProductCatalogue = async (productId, userId) => {
  const merchant = await getMerchantByUserId(userId);
  const merchantId = merchant._id;

  // Check if the product exists
  const product = await ProductCatalogue.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product belongs to the requesting merchant
  if (product.merchantId.toString() !== merchantId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product
  await ProductCatalogue.findByIdAndRemove(productId);

  return product;
};

const getProductsByIds = async (payload) => {
  const ids = payload.split('&').map((id) => id.split('=')[1]);
  const products = await Product.find({ id: { $in: ids } });
  return products;
};

const getProductCatalogueById = async (id) => {
  const product = await ProductCatalogue.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
  createProductCatalogue,
  approveProductRequest,
  rejectProduct,
  viewProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductToCollection,
  getProductsBySlug,
  getProductCatalogue,
  viewMyProductCatalogue,
  deleteProductCatalogue,
  getProductCatalogueById,
  getProductsByIds,
};
