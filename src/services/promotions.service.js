const { Promotion, Banner } = require('../models');

const createBanner = async (bannerData) => {
  return Banner.create(bannerData);
};

const createPromotionSlide = async (promotionSlideData) => {
  return Promotion.create(promotionSlideData);
};

/**
 * Get all banners
 * @returns {Promise<Array>} Array of banners
 */
const getAllBanners = async () => {
  return Banner.find({ isActive: true });
};

/**
 * Get all promotion slides
 * @returns {Promise<Array>} Array of promotion slides
 */
const getAllPromotionSlides = async () => {
  return Promotion.find({ isActive: true });
};

/**
 * Disable a banner by setting isActive to false
 * @param {string} bannerId - ID of the banner to disable
 * @returns {Promise<object>} Updated banner
 */
const disableBanner = async (bannerId) => {
  return Banner.findByIdAndUpdate(bannerId, { isActive: false }, { new: true });
};

/**
 * Disable a promotion slide by setting isActive to false
 * @param {string} slideId - ID of the promotion slide to disable
 * @returns {Promise<object>} Updated promotion slide
 */
const disablePromotionSlide = async (slideId) => {
  return Promotion.findByIdAndUpdate(slideId, { isActive: false }, { new: true });
};

module.exports = {
  createBanner,
  createPromotionSlide,
  getAllBanners,
  getAllPromotionSlides,
  disableBanner,
  disablePromotionSlide,
};
