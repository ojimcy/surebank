const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addStaffToBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    staffId: Joi.string().required().custom(objectId),
    isCurrent: Joi.boolean(),
  }),
};

const getAllStaff = {
  query: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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

const updateStaffRole = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    role: Joi.string().required(),
  }),
};
const getBranchStaffByUserId = {
  query: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addStaffToBranch,
  getAllStaff,
  getStaffInBranch,
  updateBranchStaff,
  createStaff,
  updateStaffRole,
  getBranchStaffByUserId,
};
