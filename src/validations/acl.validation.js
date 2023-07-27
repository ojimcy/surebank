const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRole = {
  body: Joi.object().keys({
    label: Joi.string().required(),
    merchantRole: Joi.boolean().optional(),
  }),
};

const getRoles = {
  query: Joi.object().keys({
    label: Joi.string(),
    merchantRole: Joi.boolean(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRolesForUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const addPermissionToRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    permissionId: Joi.string().required(),
  }),
};

const createUserRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userId: Joi.custom(objectId).required(),
  }),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const getRoleById = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const getPermissionsForUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const deleteUserFromRole = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

const getRolePermissions = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    label: Joi.string().optional(),
    merchantRole: Joi.boolean().optional(),
  }),
};

const createPermission = {
  body: Joi.object().keys({
    label: Joi.string().required(),
    description: Joi.string().required(),
    merchantPermission: Joi.boolean(),
  }),
};

module.exports = {
  createRole,
  getRoles,
  getRolesForUser,
  addPermissionToRole,
  createUserRole,
  deleteRole,
  getRoleById,
  getPermissionsForUser,
  deleteUserFromRole,
  getRolePermissions,
  updateRole,
  createPermission,
};
