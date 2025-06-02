const express = require('express');
const healthController = require('../../controllers/health.controller');

const router = express.Router();

router.route('/').get(healthController.getHealth);

router.route('/detailed').get(healthController.getDetailedHealth);

module.exports = router;
