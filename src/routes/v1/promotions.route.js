const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const promotionsValidation = require('../../validations/promotions.validation');
const promotionsController = require('../../controllers/promotions.controller');

const router = express.Router();
router.route('/banner').get(auth('promotions'), promotionsController.getBanners);
router.route('/promotions').get(auth('promotions'), promotionsController.getPromotionSlides);

router
  .route('/banner')
  .post(auth('createPromotions'), validate(promotionsValidation.promotions), promotionsController.createBanner);

router
  .route('/promotions')
  .post(auth('createPromotions'), validate(promotionsValidation.promotions), promotionsController.createPromotionSlide);

router.route('/banner/:bannerId').post(auth('createPromotions'), promotionsController.disableBanner);
router.route('/promotions/:slideId').post(auth('createPromotions'), promotionsController.disablePromotionSlide);

module.exports = router;
