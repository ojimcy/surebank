const httpStatus = require('http-status');
const { paymentService, paystackService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { getMobileCallbackUrl } = require('../config/mobile');

/**
 * Universal payment initialization controller
 * Handles initialization for all package types (daily savings, savings-buying, interest packages)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initializeContribution = catchAsync(async (req, res) => {
  const { packageId, amount, contributionType, callbackUrl, ...packageData } = req.body;
  const redirectUrl = req.body.redirect_url; // Handle snake_case from API
  const userId = req.user._id;

  const finalCallbackUrl = redirectUrl || callbackUrl || getMobileCallbackUrl(req, contributionType, packageId);

  const paymentResponse = await paymentService.initializePaymentContribution(
    {
      userId,
      packageId,
      amount,
      contributionType,
      packageData,
      callbackUrl: finalCallbackUrl,
    },
    req
  );

  res.status(httpStatus.OK).json(paymentResponse);
});

/**
 * Get payment status by reference
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentStatus = catchAsync(async (req, res) => {
  const { reference } = req.params;
  const userId = req.user._id;

  const paymentStatus = await paymentService.getPaymentStatus(reference, userId);

  res.status(httpStatus.OK).json(paymentStatus);
});

/**
 * Get list of Nigerian banks from Paystack
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBanks = catchAsync(async (req, res) => {
  const banksResponse = await paystackService.listBanks({
    country: 'nigeria',
    perPage: 100,
  });

  // Extract and format the banks data
  const banks = banksResponse.data.data.map((bank) => ({
    name: bank.name,
    code: bank.code,
    active: bank.active,
    country: bank.country,
    currency: bank.currency,
    type: bank.type,
  }));

  res.status(httpStatus.OK).json(banks);
});

/**
 * Verify bank account number and get account name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyBankAccount = catchAsync(async (req, res) => {
  const { bankCode, accountNumber } = req.body;

  const accountDetails = await paystackService.resolveBankAccount({
    bank_code: bankCode,
    account_number: accountNumber,
  });

  res.status(httpStatus.OK).json({
    accountName: accountDetails.data.account_name,
    accountNumber: accountDetails.data.account_number,
  });
});

module.exports = {
  initializeContribution,
  getPaymentStatus,
  getBanks,
  verifyBankAccount,
};
