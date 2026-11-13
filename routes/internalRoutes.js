const express = require('express');
const apiKeyAuth = require('../middlewares/internalAuth');
const { createAlertFromMonitoring } = require('../controllers/alertController');

const router = express.Router();

router.post('/alerts', createAlertFromMonitoring);
module.exports = router;