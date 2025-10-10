const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ProductRequest, Product, ProductCatalogue, ProductCollection, Collection, Category, Brand } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');
const { getCategoryById, getBrandById } = require('./store.service');

const { slugify } = require('../utils/slugify');

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
  const CategoryModel = await Category();
  const BrandModel = await Brand();

  // get merchant id - make it optional for admin users
  let merchantId;
  const merchant = await getMerchantByUserId(userId);
  if (merchant) {
    merchantId = merchant._id;
  } else {
    // For admin users without merchant account, use a default merchant or the userId
    merchantId = userId;
  }

  // Check if the name is unique
  const existingProductCatalogue = await ProductCatalogueModel.findOne({
    name: productData.name,
    merchantId: merchantId,
  });
  if (existingProductCatalogue) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with the same name already exists in the catalogue');
  }

  let productId = productData.productId;

  // If no productId is provided, create a base product first
  if (!productId) {
    // Get or create default category and brand
    let defaultCategory = await CategoryModel.findOne({ name: 'General' });
    if (!defaultCategory) {
      defaultCategory = await CategoryModel.create({
        name: 'General',
        description: 'General product category',
      });
    }

    let defaultBrand = await BrandModel.findOne({ name: 'Generic' });
    if (!defaultBrand) {
      defaultBrand = await BrandModel.create({
        name: 'Generic',
        description: 'Generic brand',
      });
    }

    // Create a basic product entry with minimal required fields
    const baseProduct = await ProductModel.create({
      name: productData.name,
      description: productData.description || 'Product description',
      categoryId: productData.categoryId || defaultCategory._id,
      brand: productData.brand || defaultBrand._id,
      status: 'approved', // Auto-approve for admin/merchant created products
    });
    productId = baseProduct._id;
  } else {
    // Check if the product exists and is available
    const product = await ProductModel.findById(productData.productId);
    if (!product) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found or not available');
    }
  }

  // Create the product catalogue entry
  const productCatalogue = await ProductCatalogueModel.create({
    ...productData,
    productId,
    merchantId: merchantId
  });

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

  // Create a new query object from the filter
  const query = { ...filter };

  // Add filter by categoryId, subCategoryId, and brand if provided
  if (query.categoryId) {
    query.categoryId = mongoose.Types.ObjectId(query.categoryId);
  }

  if (query.subCategoryId) {
    query.subCategoryId = mongoose.Types.ObjectId(query.subCategoryId);
  }

  if (query.brand) {
    query.brand = mongoose.Types.ObjectId(query.brand);
  }

  // Add search functionality
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { 'brand.name': searchRegex },
      { 'categoryId.title': searchRegex },
      { tags: searchRegex },
    ];

    // Remove the search parameter from query since we've processed it
    delete query.search;
  }

  const product = await ProductModel.paginate(query, options);
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
const updateProductCatalogue = async (productId, updateData) => {
  const ProductCatalogueModel = await ProductCatalogue();
  // Check if the product exists
  const product = await ProductCatalogueModel.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product catalogue not found');
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
  const { limit, page, sortBy } = options;
  const skip = (page - 1) * limit;

  // Create a new query object
  const query = {};

  if (filter.merchantId) {
    query.merchantId = filter.merchantId;
  }

  // Add search functionality
  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
    query.$or = [{ name: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
  }

  // Determine if we need to filter by category, subCategory, or brand
  const needsProductFiltering = filter.categoryId || filter.subCategoryId || filter.brand;

  if (needsProductFiltering) {
    // Use aggregation pipeline for efficient category filtering
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      // Add lookups for brand and category
      {
        $lookup: {
          from: 'brands',
          localField: 'productData.brand',
          foreignField: '_id',
          as: 'brandData',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productData.categoryId',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
    ];

    // Add basic query conditions
    if (Object.keys(query).length > 0) {
      aggregationPipeline.push({ $match: query });
    }

    // Add filtering conditions for category, subCategory, and brand
    const productMatchConditions = {};

    if (filter.categoryId) {
      productMatchConditions['productData.categoryId'] = mongoose.Types.ObjectId(filter.categoryId);
    }

    if (filter.subCategoryId) {
      productMatchConditions['productData.subCategoryId'] = mongoose.Types.ObjectId(filter.subCategoryId);
    }

    if (filter.brand) {
      productMatchConditions['productData.brand'] = mongoose.Types.ObjectId(filter.brand);
    }

    if (Object.keys(productMatchConditions).length > 0) {
      aggregationPipeline.push({ $match: productMatchConditions });
    }

    // First, count total documents for pagination
    const countPipeline = [...aggregationPipeline];
    const countResult = await ProductCatalogueModel.aggregate([...countPipeline, { $count: 'total' }]);
    const totalResults = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting, pagination
    if (sortBy) {
      const sortParts = sortBy.split(':');
      const sortField = sortParts[0];
      const sortOrder = sortParts[1] === 'desc' ? -1 : 1;
      aggregationPipeline.push({ $sort: { [sortField]: sortOrder } });
    } else {
      // Default sorting if none specified
      aggregationPipeline.push({ $sort: { createdAt: -1 } });
    }

    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limit });

    // Project the data in the desired format, including ALL fields from product catalogue
    aggregationPipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        images: 1,
        costPrice: 1,
        sellingPrice: 1,
        discount: 1,
        quantity: 1,
        tags: 1,
        isSbAvailable: 1,
        reviews: 1,
        variations: 1,
        merchantId: 1,
        createdAt: 1,
        updatedAt: 1,
        // Calculate average rating from reviews
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0
          }
        },
        reviewCount: { $size: '$reviews' },
        productId: {
          _id: '$productData._id',
          status: '$productData.status',
          name: '$productData.name',
          description: '$productData.description',
          features: '$productData.features',
          tags: '$productData.tags',
          isFeatured: '$productData.isFeatured',
          isOutOfStock: '$productData.isOutOfStock',
          isSbAvailable: '$productData.isSbAvailable',
          barcode: '$productData.barcode',
          slug: '$productData.slug',
          createdAt: '$productData.createdAt',
          updatedAt: '$productData.updatedAt',
          ratings: '$productData.ratings',
          brand: { $arrayElemAt: ['$brandData', 0] },
          categoryId: { $arrayElemAt: ['$categoryData', 0] },
        },
      },
    });

    const products = await ProductCatalogueModel.aggregate(aggregationPipeline);

    // Return paginated results
    return {
      results: products,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  }

  // If no product filtering needed, use the standard approach with populate
  // First get products with filter criteria to get their IDs
  if (filter.categoryId || filter.subCategoryId || filter.brand) {
    const ProductModel = await Product();
    const productQuery = {};

    if (filter.categoryId) {
      productQuery.categoryId = mongoose.Types.ObjectId(filter.categoryId);
    }

    if (filter.subCategoryId) {
      productQuery.subCategoryId = mongoose.Types.ObjectId(filter.subCategoryId);
    }

    if (filter.brand) {
      productQuery.brand = mongoose.Types.ObjectId(filter.brand);
    }

    // Find all product IDs that match the criteria
    const matchingProducts = await ProductModel.find(productQuery).select('_id');
    const productIds = matchingProducts.map((product) => product._id);

    // Add the productId filter to the main query
    query.productId = { $in: productIds };
  }

  const populateOptions = {
    path: 'productId',
    model: 'Product',
    populate: [
      { path: 'brand', model: 'Brand', select: 'name' },
      { path: 'categoryId', model: 'Category', select: 'title slug' },
    ],
  };

  // Count total documents for pagination
  const totalResults = await ProductCatalogueModel.countDocuments(query);

  // Get paginated results
  const products = await ProductCatalogueModel.find(query)
    .populate(populateOptions)
    .skip(skip)
    .limit(limit)
    .sort(sortBy || { createdAt: -1 });

  // Calculate ratings for each product
  const productsWithRatings = products.map(product => {
    const productObj = product.toObject();
    
    // Calculate average rating from reviews
    if (productObj.reviews && productObj.reviews.length > 0) {
      const validRatings = productObj.reviews.filter(review => review.rating != null);
      productObj.averageRating = validRatings.length > 0 
        ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
        : 0;
      productObj.reviewCount = validRatings.length;
    } else {
      productObj.averageRating = 0;
      productObj.reviewCount = 0;
    }
    
    return productObj;
  });

  // Return paginated results
  return {
    results: productsWithRatings,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const viewMyProductCatalogue = async (userId) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const merchant = await getMerchantByUserId(userId);
  const products = await ProductCatalogueModel.find({ merchantId: merchant._id }).populate([
    {
      path: 'productId',
      model: 'Product',
      populate: [
        { path: 'brand', model: 'Brand', select: 'name' },
        { path: 'categoryId', model: 'Category', select: 'title' },
      ],
    },
  ]);
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
  const product = await ProductCatalogueModel.findById(id).populate([
    {
      path: 'productId',
      model: 'Product',
      populate: [
        { path: 'brand', model: 'Brand', select: 'name' },
        { path: 'categoryId', model: 'Category', select: 'title' },
      ],
    },
  ]);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

const getProductsByIds = async (payload) => {
  const ProductModel = await ProductCatalogue();
  const ids = Object.values(payload).map((id) => id);
  const products = await ProductModel.find({ _id: { $in: ids } });
  return products;
};

const getProductsByCategory = async (categorySlug) => {
  const ProductModel = await Product();
  const categoryModel = await Category();
  const category = await categoryModel.findOne({ slug: categorySlug });
  if (!category) {
    throw new ApiError(404, 'category not found');
  }

  const products = await ProductModel.find({ categoryId: category._id });
  return products;
};

const getTotalCount = async () => {
  const ProductModel = await ProductCatalogue();
  const totalCount = await ProductModel.countDocuments();
  return totalCount;
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
  updateProductCatalogue,
  deleteProduct,
  addProductToCollection,
  getProductsBySlug,
  getProductCatalogue,
  viewMyProductCatalogue,
  deleteProductCatalogue,
  getProductCatalogueById,
  getProductsByIds,
  getProductsByCategory,
  getTotalCount,
};
