const { Promotion, Banner } = require('../models');

const createBanner = async (bannerData) => {
  const BannerModel = await Banner();
  return BannerModel.create(bannerData);
};

const createPromotionSlide = async (promotionSlideData) => {
  const PromotionModel = await Promotion();
  return PromotionModel.create(promotionSlideData);
};

/**
 * Get all banners
 * @returns {Promise<Array>} Array of banners
 */
const getAllBanners = async () => {
  const BannerModel = await Banner();
  return BannerModel.find({ isActive: true });
};

/**
 * Get all promotion slides
 * @returns {Promise<Array>} Array of promotion slides
 */
const getAllPromotionSlides = async () => {
  const PromotionModel = await Promotion();
  return PromotionModel.find({ isActive: true });
};

/**
 * Disable a banner by setting isActive to false
 * @param {string} bannerId - ID of the banner to disable
 * @returns {Promise<object>} Updated banner
 */
const disableBanner = async (bannerId) => {
  const BannerModel = await Banner();
  return BannerModel.findByIdAndUpdate(bannerId, { isActive: false }, { new: true });
};

/**
 * Disable a promotion slide by setting isActive to false
 * @param {string} slideId - ID of the promotion slide to disable
 * @returns {Promise<object>} Updated promotion slide
 */
const disablePromotionSlide = async (slideId) => {
  const PromotionModel = await Promotion();
  return PromotionModel.findByIdAndUpdate(slideId, { isActive: false }, { new: true });
};

module.exports = {
  createBanner,
  createPromotionSlide,
  getAllBanners,
  getAllPromotionSlides,
  disableBanner,
  disablePromotionSlide,
};
