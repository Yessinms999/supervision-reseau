// Contrôleurs : reçoivent la requête HTTP, appellent le service, renvoient la réponse JSON.
// Format de réponse : { success: true, data, ... }
const deviceService = require('../services/deviceService');
const { DEVICE_TYPES, DEVICE_STATUSES } = require('../models/Device');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/devices
exports.getDevices = asyncHandler(async (req, res) => {
  const { items, pagination } = await deviceService.listDevices(req.query);
  res.json({ success: true, count: items.length, pagination, data: items });
});

// GET /api/devices/meta
exports.getMeta = (_req, res) => {
  res.json({ success: true, data: { types: DEVICE_TYPES, statuses: DEVICE_STATUSES } });
};

// GET /api/devices/stats
exports.getStats = asyncHandler(async (_req, res) => {
  const stats = await deviceService.getStats();
  res.json({ success: true, data: stats });
});

// GET /api/devices/ip/:ip
exports.getDeviceByIp = asyncHandler(async (req, res) => {
  const device = await deviceService.getDeviceByIp(req.params.ip);
  res.json({ success: true, data: device });
});

// GET /api/devices/:id
exports.getDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.getDeviceById(req.params.id);
  res.json({ success: true, data: device });
});

// GET /api/devices/:id/history
exports.getStatusHistory = asyncHandler(async (req, res) => {
  const device = await deviceService.getStatusHistory(req.params.id);
  res.json({ success: true, data: device });
});

// POST /api/devices
exports.createDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.createDevice(req.body);
  res.status(201).json({ success: true, message: 'Équipement créé', data: device });
});

// PUT /api/devices/:id
exports.updateDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.updateDevice(req.params.id, req.body);
  res.json({ success: true, message: 'Équipement mis à jour', data: device });
});

// PATCH /api/devices/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { device, changed } = await deviceService.updateDeviceStatus(
    req.params.id,
    req.body.status,
    req.body.reason
  );
  res.json({
    success: true,
    message: changed ? `État changé en ${device.status}` : `L'équipement est déjà en état ${device.status}`,
    data: device,
  });
});

// DELETE /api/devices/:id
exports.deleteDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.deleteDevice(req.params.id);
  res.json({ success: true, message: `Équipement "${device.name}" supprimé`, data: { id: device._id } });
});
