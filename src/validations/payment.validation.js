const Joi = require('joi');
const { objectId } = require('./custom.validation');

const initializeDsContribution = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(), // Should likely come from auth, but validating if passed
    packageId: Joi.string().custom(objectId).required(),
    amount: Joi.number().positive().required(),
    callbackUrl: Joi.string().uri().optional(), // Optional callback URL
  }),
};

const verifyPayment = {
  query: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

const getPaymentStatus = {
  params: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

const selfWithdrawalRequest = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    bankName: Joi.string().required(),
    bankCode: Joi.string().required(),
    bankAccountNumber: Joi.string().required(),
    bankAccountName: Joi.string().required(),
    reason: Joi.string().optional(),
  }),
};

const getSelfWithdrawalStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const paystackWebhook = {
  body: Joi.object()
    .keys({
      event: Joi.string().required(),
      data: Joi.object().required(),
    })
    .unknown(true),
};

const processSelfWithdrawal = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
};

const initializeContribution = {
  body: Joi.object()
    .keys({
      contributionType: Joi.string().valid('daily_savings', 'savings_buying', 'interest_package').required(),
      packageId: Joi.string()
        .custom(objectId)
        .when('contributionType', {
          is: Joi.string().valid('daily_savings', 'savings_buying'),
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
      amount: Joi.number().positive().required(),
      callbackUrl: Joi.string().uri().optional(),
      redirect_url: Joi.string().uri().optional(),
      // Interest package specific fields
      name: Joi.string().when('contributionType', {
        is: 'interest_package',
        then: Joi.required(),
        otherwise: Joi.strip(),
      }),
      principalAmount: Joi.number().positive().when('contributionType', {
        is: 'interest_package',
        then: Joi.required(),
        otherwise: Joi.strip(),
      }),
      lockPeriod: Joi.number().integer().positive().when('contributionType', {
        is: 'interest_package',
        then: Joi.required(),
        otherwise: Joi.strip(),
      }),
      earlyWithdrawalPenalty: Joi.number().min(0).max(100).default(50).when('contributionType', {
        is: 'interest_package',
        then: Joi.optional(),
        otherwise: Joi.strip(),
      }),
      interestRate: Joi.number().positive().when('contributionType', {
        is: 'interest_package',
        then: Joi.optional(),
        otherwise: Joi.strip(),
      }),
    })
    .unknown(false) // Don't allow unknown fields
    .strip('metadata'), // Explicitly strip metadata field
};

const multiAccountWithdrawalRequest = {
  body: Joi.object().keys({
    withdrawalAccounts: Joi.array()
      .items(
        Joi.object().keys({
          accountNumber: Joi.string().required(),
          amount: Joi.number().positive().required(),
        })
      )
      .min(1)
      .max(3) // ds, sb, ibs - maximum 3 account types
      .required(),
    bankName: Joi.string().required(),
    bankCode: Joi.string().required(),
    bankAccountNumber: Joi.string().required(),
    bankAccountName: Joi.string().required(),
    reason: Joi.string().optional(),
  }),
};

module.exports = {
  initializeDsContribution,
  verifyPayment,
  getPaymentStatus,
  selfWithdrawalRequest,
  getSelfWithdrawalStatus,
  paystackWebhook,
  processSelfWithdrawal,
  initializeContribution,
  multiAccountWithdrawalRequest,
};
