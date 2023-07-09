const httpStatus = require('http-status');
const { productService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createProductRequest = catchAsync(async (req, res) => {
  const requestData = req.body;
  const userId = req.user._id;
  const productRequest = await productService.createProductRequest({ ...requestData }, userId);
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

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
};
