const httpStatus = require('http-status');
const { ProductRequest, Product, ProductCatalogue, ProductCollection, Collection, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');
const { getCategoryById, getBrandById } = require('./store.service');

/**
 * Create product request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductRequest = async (requestData, merchantId) => {
  const ProductRequestModel = await ProductRequest();
  const ProductModel = await Product();
  const merchant = await getMerchantByUserId(merchantId);
  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }
  // Check if a product request with the same name already exists
  const existingProductRequest = await ProductRequestModel.findOne({ name: requestData.name });
  const existingProduct = await ProductModel.findOne({ name: requestData.name });
  if (existingProductRequest || existingProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product request with the same name already exists');
  }

  // Create the product request
  const productRequest = await ProductRequestModel.create({ ...requestData, merchantId });
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
  const ProductRequestModel = await ProductRequest();
  const productRequests = await ProductRequestModel.paginate(filter, options);
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
  const ProductRequestModel = await ProductRequest();
  // Check if the product request exists
  const productRequest = await ProductRequestModel.findById(requestId);
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
  const ProductRequestModel = await ProductRequest();
  // Check if the product request exists
  const productRequest = await ProductRequestModel.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (productRequest.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product request
  await ProductRequestModel.findByIdAndRemove(requestId);

  return productRequest;
};

/**
 * Create a product catalogue
 * @param {Object} productData - Product catalogue data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductCatalogue = async (productData, userId) => {
  const ProductModel = await Product();
  const ProductCatalogueModel = await ProductCatalogue();
  // Check if the product exists and is available
  const product = await ProductModel.findById(productData.productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found or not available');
  }

  // get merchant id
  const merchant = await getMerchantByUserId(userId);
  if (!merchant) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Merchant not found, please apply');
  }

  // Check if the title is unique
  const existingProductCatalogue = await ProductCatalogueModel.findOne({
    title: productData.title,
    merchantId: merchant._id,
  });
  if (existingProductCatalogue) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with the same title already exists in the catalogue');
  }

  // Create the product catalogue entry
  const productCatalogue = await ProductCatalogueModel.create({ ...productData, merchantId: merchant._id });

  return productCatalogue;
};

/**
 * Approve a product request and create a new Product document
 * @param {string} requestId - The ID of the product request to approve
 * @returns {Promise<Object>} The created product
 */
const approveProductRequest = async (requestId) => {
  const ProductModel = await Product();
  const ProductRequestModel = await ProductRequest();
  const productRequest = await ProductRequestModel.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  const existingProduct = await ProductModel.findOne({
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
  const newProduct = new ProductModel({
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
    slug: productRequest.slug,
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
  const ProductRequestModel = await ProductRequest();
  const productRequest = await ProductRequestModel.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  const updatedRequest = await ProductRequestModel.findByIdAndUpdate(
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
  const ProductModel = await Product();
  const product = await ProductModel.paginate(filter, options);
  return product;
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  const ProductModel = await Product();
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Fetch additional details using separate functions
  const category = await getCategoryById(product.categoryId);
  const brand = await getBrandById(product.brand);
  // Add fetched details to the product object
  const productWithDetails = {
    product,
    category: category ? category.name : null,
    brand: brand ? brand.name : null,
  };

  return productWithDetails;
};

/**
 * Update product
 * @param {string} productId - The ID of the product to update
 * @param {string} merchantId - The ID of the  merchant
 * @param {Object} updateData - The updated data for the product
 * @returns {Promise<Object>} The updated product
 */
const updateProduct = async (productId, updateData) => {
  const ProductModel = await Product();
  // Check if the product exists
  const product = await ProductModel.findById(productId);
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
  const ProductModel = await Product();
  // Check if the product exists
  const product = await ProductModel.findById(productId);
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

const addProductToCollection = async (productCatalogueId, collectionId) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const CollectionModel = await Collection();
  const ProductCollectionModel = await ProductCollection();
  // Check if the product and collection exist
  const product = await ProductCatalogueModel.findById(productCatalogueId);
  const collection = await CollectionModel.findById(collectionId);

  if (!product || !collection) {
    throw new ApiError(404, 'Product or collection not found');
  }
  // Check if the product is already in the collection
  const productInCollection = await ProductCollectionModel.findOne({
    productCatalogueId,
    collectionId,
  });

  if (productInCollection) {
    throw new ApiError(400, 'Product is already in the collection');
  }

  const productCollection = new ProductCollectionModel({ productCatalogueId, collectionId });
  await productCollection.save();

  // Update the product's collections
  product.collections.push(collectionId);
  await product.save();

  return productCollection;
};

const getProductsBySlug = async (collectionSlug) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const CollectionModel = await Collection();

  // Find the collection by slug
  const collection = await CollectionModel.findOne({ slug: collectionSlug });

  if (!collection) {
    throw new ApiError(404, 'Collection not found');
  }

  // Extract the product IDs from the collection
  const productIds = collection.products;

  // Retrieve detailed information for each product using the IDs
  const products = await Promise.all(
    productIds.map(async (productId) => {
      // Assuming ProductCatalogueModel is the correct model for detailed product information
      const productDetails = await ProductCatalogueModel.findById(productId);
      return productDetails;
    })
  );

  return products;
};

const getProductCatalogue = async (filter, options) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const product = await ProductCatalogueModel.paginate(filter, options);
  return product;
};

const viewMyProductCatalogue = async (userId) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const merchant = await getMerchantByUserId(userId);
  const products = await ProductCatalogueModel.find({ merchantId: merchant._id });
  return products;
};

const deleteProductCatalogue = async (productId, userId) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const merchant = await getMerchantByUserId(userId);
  const merchantId = merchant._id;

  // Check if the product exists
  const product = await ProductCatalogueModel.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product belongs to the requesting merchant
  if (product.merchantId.toString() !== merchantId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product
  await ProductCatalogueModel.findByIdAndRemove(productId);

  return product;
};

const getProductCatalogueById = async (id) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const product = await ProductCatalogueModel.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

const getProductsByIds = async (payload) => {
  const ProductModel = await Product();
  const ids = payload.split('&').map((id) => id.split('=')[1]);
  const products = await ProductModel.find({ id: { $in: ids } });
  return products;
};

const getProductsByCategory = async (categorySlug) => {
  const ProductModel = await Product();
  const categoryModel = await Category();
  const category = await categoryModel.findOne({ slug: categorySlug });
  if (!category) {
    throw new ApiError(404, 'category not found');
  }

  const products = await ProductModel.find({ categories: category._id });
  return products;
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
  getProductsByCategory,
};
