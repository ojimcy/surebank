const httpStatus = require('http-status');
const { Collection } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise<Object>} Result of the operation
 * @throws {ApiError} If a collection with the same slug already exists
 */
const createCollection = async (collectionData) => {
  const existingCollection = await Collection.findOne({ slug: collectionData.slug });
  if (existingCollection) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Collection with the same slug already exists');
  }

  const collection = await Collection.create(collectionData);
  return collection;
};

/**
 * Get all collections
 * @returns {Promise<Array>} Array of collections
 */
const getAllCollections = async () => {
  const collections = await Collection.find();
  return collections;
};

/**
 * Get a collection by its ID
 * @param {string} collectionId - Collection ID
 * @returns {Promise<Object>} The retrieved collection
 * @throws {ApiError} If the collection is not found
 */
const getCollectionById = async (collectionId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
  }
  return collection;
};

/**
 * Update a collection by its ID
 * @param {string} collectionId - Collection ID
 * @param {Object} updateData - Data to update the collection
 * @returns {Promise<Object>} The updated collection
 * @throws {ApiError} If the collection is not found
 */
const updateCollectionById = async (collectionId, updateData) => {
  const collection = await Collection.findByIdAndUpdate(collectionId, updateData, { new: true });
  if (!collection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
  }
  return collection;
};

/**
 * Delete a collection by its ID
 * @param {string} collectionId - Collection ID
 * @returns {Promise<Object>} The deleted collection
 * @throws {ApiError} If the collection is not found
 */
const deleteCollectionById = async (collectionId) => {
  const collection = await Collection.findByIdAndRemove(collectionId);
  if (!collection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
  }
  return collection;
};

module.exports = {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollectionById,
  deleteCollectionById,
};
