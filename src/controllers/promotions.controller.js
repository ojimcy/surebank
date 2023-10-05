const httpStatus = require('http-status');
const { promotionsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createBanner = catchAsync(async (req, res) => {
  const bannerData = req.body;
  const banner = await promotionsService.createBanner(bannerData);
  res.status(httpStatus.CREATED).send(banner);
});

const createPromotionSlide = catchAsync(async (req, res) => {
  const promotionSlideData = req.body;
  const promotionSlide = await promotionsService.createPromotionSlide(promotionSlideData);
  res.status(httpStatus.CREATED).send(promotionSlide);
});

const getBanners = catchAsync(async (req, res) => {
  const banners = await promotionsService.getAllBanners();
  res.status(httpStatus.OK).send(banners);
});

const getPromotionSlides = catchAsync(async (req, res) => {
  const promotionSlides = await promotionsService.getAllPromotionSlides();
  res.status(httpStatus.OK).send(promotionSlides);
});

const disableBanner = catchAsync(async (req, res) => {
  const { bannerId } = req.params;
  const disabledBanner = await promotionsService.disableBanner(bannerId);
  res.status(httpStatus.OK).send(disabledBanner);
});

const disablePromotionSlide = catchAsync(async (req, res) => {
  const { slideId } = req.params;
  const disabledBanner = await promotionsService.disablePromotionSlide(slideId);
  res.status(httpStatus.OK).send(disabledBanner);
});

module.exports = {
  createBanner,
  createPromotionSlide,
  getBanners,
  getPromotionSlides,
  disableBanner,
  disablePromotionSlide,
};
