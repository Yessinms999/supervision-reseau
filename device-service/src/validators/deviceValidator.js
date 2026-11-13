// Validation des données entrantes AVANT d'atteindre la base de données.
// Renvoie une erreur 400 claire avec la liste des champs fautifs.
const net = require('net');
const ApiError = require('../utils/ApiError');
const { DEVICE_TYPES, DEVICE_STATUSES, MAC_REGEX } = require('../models/Device');

const ALLOWED_FIELDS = [
  'name', 'type', 'ipAddress', 'macAddress', 'status',
  'vendor', 'model', 'serialNumber', 'location', 'description',
];

function checkFields(body, { partial }) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [{ field: 'body', message: 'Le corps de la requête doit être un objet JSON' }];
  }

  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.includes(k));
  if (unknown.length) {
    errors.push({ field: unknown.join(', '), message: 'Champ(s) non autorisé(s)' });
  }

  const required = ['name', 'type', 'ipAddress'];
  if (!partial) {
    required.forEach((f) => {
      if (body[f] === undefined || body[f] === null || String(body[f]).trim() === '') {
        errors.push({ field: f, message: 'Champ obligatoire' });
      }
    });
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Doit être une chaîne de 2 à 100 caractères' });
    }
  }

  if (body.type !== undefined && !DEVICE_TYPES.includes(String(body.type).toUpperCase())) {
    errors.push({ field: 'type', message: `Valeurs autorisées : ${DEVICE_TYPES.join(', ')}` });
  }

  if (body.status !== undefined && !DEVICE_STATUSES.includes(String(body.status).toUpperCase())) {
    errors.push({ field: 'status', message: `Valeurs autorisées : ${DEVICE_STATUSES.join(', ')}` });
  }

  if (body.ipAddress !== undefined && net.isIP(String(body.ipAddress).trim()) === 0) {
    errors.push({ field: 'ipAddress', message: 'Adresse IPv4 ou IPv6 invalide' });
  }

  if (body.macAddress !== undefined && body.macAddress !== '' && !MAC_REGEX.test(String(body.macAddress))) {
    errors.push({ field: 'macAddress', message: 'Format attendu : AA:BB:CC:DD:EE:FF' });
  }

  ['vendor', 'model', 'serialNumber', 'location', 'description'].forEach((f) => {
    if (body[f] !== undefined && typeof body[f] !== 'string') {
      errors.push({ field: f, message: 'Doit être une chaîne de caractères' });
    }
  });

  return errors;
}

// Normalise les valeurs (majuscules pour les enums, trim pour l'IP).
function normalize(body) {
  const data = {};
  ALLOWED_FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  if (data.type) data.type = String(data.type).toUpperCase();
  if (data.status) data.status = String(data.status).toUpperCase();
  if (data.ipAddress) data.ipAddress = String(data.ipAddress).trim();
  return data;
}

// POST : tous les champs obligatoires doivent être présents.
exports.validateCreate = (req, _res, next) => {
  const errors = checkFields(req.body, { partial: false });
  if (errors.length) return next(ApiError.badRequest('Données invalides', errors));
  req.body = normalize(req.body);
  next();
};

// PUT : mise à jour partielle autorisée, mais au moins un champ.
exports.validateUpdate = (req, _res, next) => {
  const errors = checkFields(req.body, { partial: true });
  if (!errors.length && Object.keys(req.body).length === 0) {
    errors.push({ field: 'body', message: 'Aucun champ à mettre à jour' });
  }
  if (errors.length) return next(ApiError.badRequest('Données invalides', errors));
  req.body = normalize(req.body);
  next();
};

// PATCH /status : seul le champ status (+ raison facultative) est accepté.
exports.validateStatus = (req, _res, next) => {
  const { status, reason } = req.body || {};
  const errors = [];
  if (!status || !DEVICE_STATUSES.includes(String(status).toUpperCase())) {
    errors.push({ field: 'status', message: `Valeurs autorisées : ${DEVICE_STATUSES.join(', ')}` });
  }
  if (reason !== undefined && typeof reason !== 'string') {
    errors.push({ field: 'reason', message: 'Doit être une chaîne de caractères' });
  }
  if (errors.length) return next(ApiError.badRequest('Données invalides', errors));
  req.body = { status: String(status).toUpperCase(), reason };
  next();
};

// Filtres de la liste (query string).
exports.validateListQuery = (req, _res, next) => {
  const { type, status, page, limit } = req.query;
  const errors = [];
  if (type && !DEVICE_TYPES.includes(String(type).toUpperCase())) {
    errors.push({ field: 'type', message: `Valeurs autorisées : ${DEVICE_TYPES.join(', ')}` });
  }
  if (status && !DEVICE_STATUSES.includes(String(status).toUpperCase())) {
    errors.push({ field: 'status', message: `Valeurs autorisées : ${DEVICE_STATUSES.join(', ')}` });
  }
  if (page !== undefined && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push({ field: 'page', message: 'Entier >= 1' });
  }
  if (limit !== undefined && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push({ field: 'limit', message: 'Entier entre 1 et 100' });
  }
  if (errors.length) return next(ApiError.badRequest('Paramètres invalides', errors));
  next();
};
