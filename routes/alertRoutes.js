const express = require('express');
const {
  getAlerts,
  getAlertStats,
  getAlertById,
  updateAlert,
  deleteAlert
} = require('../controllers/alertController');

const router = express.Router();

router.get('/', getAlerts);
router.get('/stats', getAlertStats);   // doit rester AVANT '/:id'
router.get('/:id', getAlertById);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;