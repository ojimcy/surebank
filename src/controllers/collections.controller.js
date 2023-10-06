const httpStatus = require('http-status');
const { collectionsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCollection = catchAsync(async (req, res) => {
  const collectionData = req.body;
  const collection = await collectionsService.createCollection(collectionData);
  res.status(httpStatus.CREATED).send(collection);
});

const getAllCollections = catchAsync(async (req, res) => {
  const collections = await collectionsService.getAllCollections();
  res.status(httpStatus.OK).send(collections);
});

const getCollectionById = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const collection = await collectionsService.getCollectionById(collectionId);
  res.status(httpStatus.OK).send(collection);
});

const updateCollectionById = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const updateData = req.body;
  const updatedCollection = await collectionsService.updateCollectionById(collectionId, updateData);
  res.status(httpStatus.OK).send(updatedCollection);
});

const deleteCollectionById = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const deletedCollection = await collectionsService.deleteCollectionById(collectionId);
  res.status(httpStatus.OK).send(deletedCollection);
});

module.exports = {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollectionById,
  deleteCollectionById,
};
