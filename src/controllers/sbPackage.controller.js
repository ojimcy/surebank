const httpStatus = require('http-status');
const { sbPackageService } = require('../services');
const catchAsync = require('../utils/catchAsync');

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
  const result = await sbPackageService.makeDailyContribution({ ...contributionInput, packageId, createdBy });
  res.status(httpStatus.OK).json(result);
});

const makeSbWithdrawal = catchAsync(async (req, res) => {
  const withdrawal = req.body;
  const createdBy = req.user._id;
  const packageId = req.query;
  const withdrawalDetails = await sbPackageService.makeSbWithdrawal({ ...withdrawal, createdBy, packageId });
  res.status(httpStatus.OK).json(withdrawalDetails);
});

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
};
