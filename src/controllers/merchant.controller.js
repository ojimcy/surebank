const httpStatus = require('http-status');
const { merchantService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createMerchantRequest = catchAsync(async (req, res) => {
  const requestData = req.body;
  const userId = req.user._id;
  const merchantRequest = await merchantService.createMerchantRequest({ ...requestData, userId });
  res.status(httpStatus.CREATED).send(merchantRequest);
});

const viewRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await merchantService.viewRequests(filter, options);
  res.status(httpStatus.OK).send(result);
});

const viewRequest = catchAsync(async (req, res) => {
  const request = await merchantService.viewRequest(req.params.requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  res.send(request);
});

const cancelMerchantRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { reasons } = req.body;
  const updatedRequest = await merchantService.cancelMerchantRequest(requestId, reasons);
  res.status(httpStatus.OK).json(updatedRequest);
});

const getCancelledRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const cancelledRequests = await merchantService.getCancelledRequests(filter, options);
  res.status(httpStatus.OK).send(cancelledRequests);
});

const denyMerchantRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { reasons } = req.body;
  const updatedRequest = await merchantService.denyMerchantRequest(requestId, reasons);
  res.status(httpStatus.OK).json(updatedRequest);
});

const getDeniedRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const rejectedRequests = await merchantService.getDeniedRequests(filter, options);
  res.status(httpStatus.OK).send(rejectedRequests);
});

const approveMerchantRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const updatedRequest = await merchantService.approveMerchantRequest(requestId);
  res.status(httpStatus.OK).json(updatedRequest);
});

const getApprovedRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const rejectedRequests = await merchantService.getApprovedRequests(filter, options);
  res.status(httpStatus.OK).send(rejectedRequests);
});

const getMerchants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['storeName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await merchantService.getMerchants(filter, options);
  res.status(httpStatus.OK).send(result);
});

const addMerchantAdmin = catchAsync(async (req, res) => {
  const { merchantId } = req.query;
  const loggedInUserId = req.user._id;
  const { role, userId } = req.body;
  const merchantAdmin = await merchantService.addMerchantAdmin(merchantId, userId, loggedInUserId, role);
  res.status(httpStatus.CREATED).send(merchantAdmin);
});

const removeMerchantAdmin = catchAsync(async (req, res) => {
  const { merchantId } = req.query;
  const { adminId } = req.body;
  const loggedInUserId = req.user._id;
  await merchantService.removeMerchantAdmin(merchantId, adminId, loggedInUserId);
  res.status(httpStatus.NO_CONTENT).send('Admin removed successfully');
});

const listMerchantAdmins = catchAsync(async (req, res) => {
  const merchantAdmins = await merchantService.listMerchantAdmins(req.params.merchantId);
  if (!merchantAdmins) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant admin not found');
  }
  res.send(merchantAdmins);
});

const getMerchant = catchAsync(async (req, res) => {
  const request = await merchantService.getMerchant(req.params.requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  res.send(request);
});

module.exports = {
  createMerchantRequest,
  viewRequests,
  viewRequest,
  cancelMerchantRequest,
  getCancelledRequests,
  denyMerchantRequest,
  getDeniedRequests,
  approveMerchantRequest,
  getApprovedRequests,
  getMerchants,
  getMerchant,
  addMerchantAdmin,
  removeMerchantAdmin,
  listMerchantAdmins,
};
