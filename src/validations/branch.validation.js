const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBranch = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
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
const getAllStaff = {
  query: Joi.object().keys({
    // name: Joi.string(),
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
  // params: Joi.object().keys({
  // }),
  body: Joi.object().keys({
    staffId: Joi.string().required().custom(objectId),
    branchId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
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
  // params: Joi.object().keys({
  // }),
  // query: Joi.object().keys({
  // }),
  body: Joi.object().keys({
    staffId: Joi.string().required().custom(objectId),
    branchId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
  }),
};

const deleteBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};
const deleteBranchStaff = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};
const deleteAllBranchStaff = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
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
  getAllStaff,
  updateBranchStaff,
  deleteBranch,
  deleteBranchStaff,
  deleteAllBranchStaff,
};
