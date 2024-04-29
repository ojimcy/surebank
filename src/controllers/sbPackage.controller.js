const httpStatus = require('http-status');
const { sbPackageService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createSbPackage = catchAsync(async (req, res) => {
  const sbPackageData = req.body;
  const createdBy = req.user._id;
  const createdSavingsBuyingPackage = await sbPackageService.createSbPackage({ ...sbPackageData, createdBy });
  res.status(httpStatus.OK).json(createdSavingsBuyingPackage);
});

const makeDailyContribution = catchAsync(async (req, res) => {
  const contributionInput = req.body;
  const createdBy = req.user._id;
  const packageId = req.query;
  const result = await sbPackageService.makeDailyContribution({ ...contributionInput, createdBy, packageId });
  res.status(httpStatus.OK).json(result);
});

const makeSbWithdrawal = catchAsync(async (req, res) => {
  const withdrawal = req.body;
  const createdBy = req.user._id;
  const { packageId } = req.query;
  const withdrawalDetails = await sbPackageService.makeSbTransfer({ ...withdrawal, createdBy, packageId });
  res.status(httpStatus.OK).json(withdrawalDetails);
});

const getPackageById = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const userPackage = await sbPackageService.getPackageById(packageId);
  res.status(httpStatus.OK).json(userPackage);
});

const getUserSbPackages = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const userPackage = await sbPackageService.getUserSbPackages(userId);
  res.status(httpStatus.OK).json(userPackage);
});

const mergeSavingsPackages = catchAsync(async (req, res) => {
  const { targetPackageId } = req.params;
  const { sourcePackageIds } = req.body;
  const mergedPacakges = await sbPackageService.mergeSavingsPackages(targetPackageId, sourcePackageIds);
  res.status(httpStatus.OK).json(mergedPacakges);
});

const updatePackageProduct = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const { newProductId } = req.body;
  const updatedPackage = await sbPackageService.updatePackageProduct(packageId, newProductId);

  res.status(httpStatus.OK).json(updatedPackage);
});

const getAllSbPackages = catchAsync(async (req, res) => {
  const filterOptions = pick(req.query, ['branchId', 'accountManagerId']);

  const packages = await sbPackageService.getAllSbPackages(filterOptions);

  res.status(httpStatus.OK).json(packages);
});

const makeSbCustomerWithdrawal = catchAsync(async (req, res) => {
  const withdrawal = req.body;
  const createdBy = req.user._id;
  const { packageId } = req.query;
  const withdrawalDetails = await sbPackageService.makeSbCustomerWithdrawal({
    ...withdrawal,
    createdBy,
    packageId,
  });
  res.status(httpStatus.OK).json(withdrawalDetails);
});

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
  getPackageById,
  getUserSbPackages,
  mergeSavingsPackages,
  updatePackageProduct,
  getAllSbPackages,
  makeSbCustomerWithdrawal,
};
