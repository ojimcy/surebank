const httpStatus = require('http-status');
const { productService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createProductRequest = catchAsync(async (req, res) => {
  const requestData = req.body;
  const merchantId = req.user._id;
  const productRequest = await productService.createProductRequest(requestData, merchantId);
  res.status(httpStatus.CREATED).send(productRequest);
});

const viewProductRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.viewProductRequests(filter, options);
  res.status(httpStatus.OK).send(result);
});

const updateProductRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { merchantId } = req.query;
  const updateData = req.body;

  const updatedProductRequest = await productService.updateProductRequest(requestId, merchantId, updateData);

  res.status(httpStatus.OK).send(updatedProductRequest);
});

const deleteProductRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { merchantId } = req.query;

  const deletedProductRequest = await productService.deleteProductRequest(requestId, merchantId);

  res.status(httpStatus.OK).send(deletedProductRequest);
});

const createProductCatalogue = catchAsync(async (req, res) => {
  const productData = req.body;
  const productCatalogue = await productService.createProductCatalogue(productData);
  res.status(httpStatus.CREATED).send(productCatalogue);
});

const approveProductRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const newProduct = await productService.approveProductRequest(requestId);
  res.status(httpStatus.CREATED).send(newProduct);
});

const rejectProduct = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { reasonForRejection } = req.body;
  const updatedRequest = await productService.rejectProduct(requestId, reasonForRejection);
  res.status(httpStatus.OK).json(updatedRequest);
});

const viewProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.viewProducts(filter, options);
  res.status(httpStatus.OK).send(result);
});

const viewProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  res.status(httpStatus.OK).send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const updateData = req.body;

  const updatedProduct = await productService.updateProduct(productId, updateData);

  res.status(httpStatus.OK).send(updatedProduct);
});

const deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { merchantId } = req.query;

  const deletedProduct = await productService.deleteProduct(productId, merchantId);

  res.status(httpStatus.OK).send(deletedProduct);
});

const addProductToCollection = catchAsync(async (req, res) => {
  const { productId, collectionId } = req.query;

  const productCollection = await productService.addProductToCollection(productId, collectionId);
  res.status(httpStatus.OK).send(productCollection);
});

const getProductsByCollectionSlug = catchAsync(async (req, res) => {
  const { collectionSlug } = req.query;

  const products = await productService.getProductsByCollectionSlug(collectionSlug);
  res.status(httpStatus.OK).send(products);
});

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
  createProductCatalogue,
  approveProductRequest,
  rejectProduct,
  viewProducts,
  viewProduct,
  updateProduct,
  deleteProduct,
  addProductToCollection,
  getProductsByCollectionSlug,
};
