// Couche "service" : toute la logique métier et l'accès à MongoDB.
// Les contrôleurs ne parlent jamais directement au modèle.
const Device = require('../models/Device');
const { DEVICE_TYPES, DEVICE_STATUSES } = require('../models/Device');
const ApiError = require('../utils/ApiError');

const SORTABLE_FIELDS = ['name', 'type', 'status', 'ipAddress', 'createdAt', 'updatedAt', 'lastStatusChange'];

// Échappe les caractères spéciaux pour une recherche regex sûre.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Liste paginée avec filtres.
 * @param {object} query { type, status, search, location, page, limit, sort }
 */
async function listDevices(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;

  const filter = {};
  if (query.type) filter.type = String(query.type).toUpperCase();
  if (query.status) filter.status = String(query.status).toUpperCase();
  if (query.location) filter.location = new RegExp(escapeRegex(query.location), 'i');
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { ipAddress: rx }, { vendor: rx }, { model: rx }, { location: rx }];
  }

  // sort=name ou sort=-createdAt (le "-" = ordre décroissant)
  let sort = { createdAt: -1 };
  if (query.sort) {
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    if (SORTABLE_FIELDS.includes(field)) sort = { [field]: desc ? -1 : 1 };
  }

  const [items, total] = await Promise.all([
    Device.find(filter).select('-statusHistory').sort(sort).skip((page - 1) * limit).limit(limit),
    Device.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getDeviceById(id) {
  const device = await Device.findById(id);
  if (!device) throw ApiError.notFound(`Équipement ${id} introuvable`);
  return device;
}

async function getDeviceByIp(ip) {
  const device = await Device.findOne({ ipAddress: ip });
  if (!device) throw ApiError.notFound(`Aucun équipement avec l'adresse IP ${ip}`);
  return device;
}

async function ensureIpAvailable(ipAddress, excludeId) {
  const filter = { ipAddress };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Device.exists(filter)) {
    throw ApiError.conflict(`L'adresse IP ${ipAddress} est déjà attribuée à un autre équipement`);
  }
}

async function createDevice(data) {
  await ensureIpAvailable(data.ipAddress);
  const status = data.status || 'UNKNOWN';
  return Device.create({
    ...data,
    status,
    lastStatusChange: new Date(),
    statusHistory: [{ from: undefined, to: status, reason: 'Création', changedAt: new Date() }],
  });
}

async function updateDevice(id, data) {
  const device = await getDeviceById(id);

  if (data.ipAddress && data.ipAddress !== device.ipAddress) {
    await ensureIpAvailable(data.ipAddress, id);
  }

  // Un changement d'état via PUT est aussi historisé.
  const { status, ...rest } = data;
  Object.assign(device, rest);
  if (status && status !== device.status) {
    applyStatusChange(device, status, 'Mise à jour');
  }

  return device.save();
}

function applyStatusChange(device, newStatus, reason) {
  device.statusHistory.push({ from: device.status, to: newStatus, reason, changedAt: new Date() });
  // On garde les 50 derniers changements pour ne pas faire grossir le document.
  if (device.statusHistory.length > 50) device.statusHistory = device.statusHistory.slice(-50);
  device.status = newStatus;
  device.lastStatusChange = new Date();
}

/**
 * Change l'état d'un équipement (utilisé aussi par le service de supervision/simulation).
 */
async function updateDeviceStatus(id, status, reason) {
  const device = await getDeviceById(id);
  if (device.status === status) return { device, changed: false };
  applyStatusChange(device, status, reason || 'Changement manuel');
  await device.save();
  return { device, changed: true };
}

async function getStatusHistory(id) {
  const device = await Device.findById(id).select('name ipAddress status statusHistory');
  if (!device) throw ApiError.notFound(`Équipement ${id} introuvable`);
  return device;
}

async function deleteDevice(id) {
  const device = await Device.findByIdAndDelete(id);
  if (!device) throw ApiError.notFound(`Équipement ${id} introuvable`);
  return device;
}

/**
 * Statistiques : nombre total, répartition par type et par état.
 */
async function getStats() {
  const [byType, byStatus, total] = await Promise.all([
    Device.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Device.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Device.countDocuments(),
  ]);

  const toMap = (keys, rows) =>
    keys.reduce((acc, k) => {
      acc[k] = (rows.find((r) => r._id === k) || { count: 0 }).count;
      return acc;
    }, {});

  return {
    total,
    byType: toMap(DEVICE_TYPES, byType),
    byStatus: toMap(DEVICE_STATUSES, byStatus),
  };
}

module.exports = {
  listDevices,
  getDeviceById,
  getDeviceByIp,
  createDevice,
  updateDevice,
  updateDeviceStatus,
  getStatusHistory,
  deleteDevice,
  getStats,
};
