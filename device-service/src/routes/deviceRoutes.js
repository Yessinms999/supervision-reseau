// Déclaration des routes REST du Device Service (préfixe : /api/devices).
const express = require('express');
const ctrl = require('../controllers/deviceController');
const validateObjectId = require('../middlewares/validateObjectId');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateCreate,
  validateUpdate,
  validateStatus,
  validateListQuery,
} = require('../validators/deviceValidator');

const router = express.Router();

// Toutes les routes passent par l'authentification (désactivable via AUTH_ENABLED=false).
router.use(authenticate);

// ---- Lecture (tout utilisateur connecté) ----
router.get('/', validateListQuery, ctrl.getDevices);
router.get('/meta', ctrl.getMeta);
router.get('/stats', ctrl.getStats);
router.get('/ip/:ip', ctrl.getDeviceByIp);
router.get('/:id', validateObjectId, ctrl.getDevice);
router.get('/:id/history', validateObjectId, ctrl.getStatusHistory);

// ---- Écriture ----
router.post('/', authorize('ADMIN', 'OPERATOR'), validateCreate, ctrl.createDevice);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), validateObjectId, validateUpdate, ctrl.updateDevice);
router.patch('/:id/status', authorize('ADMIN', 'OPERATOR'), validateObjectId, validateStatus, ctrl.updateStatus);
router.delete('/:id', authorize('ADMIN'), validateObjectId, ctrl.deleteDevice);

module.exports = router;
