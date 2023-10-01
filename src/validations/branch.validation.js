const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBranch = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().required().email(),
    manager: Joi.string().required(),
  }),
};

const getBranches = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

const updateBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

const updateBranchManager = {
  params: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    manager: Joi.string().required(),
  }),
};

const addStaffToBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    staffId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
  }),
};

const createStaff = {
  body: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
    staffId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
    role: Joi.string().optional(),
  }),
};

const getStaffInBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateBranchStaff = {
  body: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
    staffId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
  }),
};

const deleteBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

const updateStaffRole = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    role: Joi.string().required(),
  }),
};

module.exports = {
  createBranch,
  getBranches,
  getBranch,
  updateBranchManager,
  addStaffToBranch,
  updateBranch,
  getStaffInBranch,
  updateBranchStaff,
  deleteBranch,
  createStaff,
  updateStaffRole,
};
