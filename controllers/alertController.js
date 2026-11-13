const Alert = require('../models/Alert');
const { AppError } = require('../middlewares/errorHandler');

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'severity', 'status', 'value', 'deviceId'];


const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/internal/alerts (Monitoring Service, protégé par clé API)
const createAlertFromMonitoring = async (req, res, next) => {
  try {
    const { deviceId, metric, value, threshold, severity, message } = req.body;

    const alert = await Alert.create({
      deviceId,
      metric,
      value,
      threshold,
      severity,
      message,
      // Imposés par le serveur : le Monitoring ne peut pas les choisir
      status: 'OPEN',
      source: 'MONITORING',
      assignedTo: null,
      resolvedAt: null
    });

    res.status(201).json({ success: true, message: 'Alert created', data: alert });
  } catch (error) {
    next(error);
  }
};

// GET /api/alerts
// Filtres : severity, status, metric, search, from, to
// Pagination : page, limit
// Tri : sortBy, order
const getAlerts = async (req, res, next) => {
  try {
    const { search, severity, status, metric, from, to } = req.query;
    const filter = {};

    if (severity) filter.severity = severity.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (metric) filter.metric = metric.toUpperCase();

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ message: regex }, { deviceId: regex }];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate)) throw new AppError('Invalid "from" date', 400);
        filter.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate)) throw new AppError('Invalid "to" date', 400);
        filter.createdAt.$lte = toDate;
      }
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const sortBy = SORTABLE_FIELDS.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/alerts/stats
const getAlertStats = async (req, res, next) => {
  try {
    const groupBy = (field) =>
      Alert.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);

    const toObject = (rows) =>
      rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, last24h, bySeverity, byStatus, byMetric] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ createdAt: { $gte: since } }),
      groupBy('severity'),
      groupBy('status'),
      groupBy('metric')
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        last24h,
        bySeverity: toObject(bySeverity),
        byStatus: toObject(byStatus),
        byMetric: toObject(byMetric)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/alerts/:id
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) throw new AppError('Alert not found', 404);

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// PUT /api/alerts/:id : seuls message, severity et threshold sont modifiables
const updateAlert = async (req, res, next) => {
  try {
    const allowedFields = ['message', 'severity', 'threshold'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      throw new AppError('Provide at least one of: message, severity, threshold', 400);
    }

    const alert = await Alert.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!alert) throw new AppError('Alert not found', 404);

    res.status(200).json({ success: true, message: 'Alert updated', data: alert });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/alerts/:id
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) throw new AppError('Alert not found', 404);

    res.status(200).json({ success: true, message: 'Alert deleted', data: alert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlertFromMonitoring,
  getAlerts,
  getAlertStats,
  getAlertById,
  updateAlert,
  deleteAlert
};