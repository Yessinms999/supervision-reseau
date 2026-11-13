const mongoose = require('mongoose');

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const METRICS = ['CPU', 'MEMORY', 'DISK', 'TRAFFIC', 'LATENCY', 'TEMPERATURE'];
const SOURCES = ['MONITORING', 'MANUAL'];

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'deviceId is required'],
      trim: true
    },
    metric: {
      type: String,
      required: [true, 'metric is required'],
      uppercase: true,
      enum: { values: METRICS, message: `metric must be one of: ${METRICS.join(', ')}` }
    },
    value: {
      type: Number,
      required: [true, 'value is required'],
      min: [0, 'value must be >= 0']
    },
    threshold: {
      type: Number,
      required: [true, 'threshold is required'],
      min: [0, 'threshold must be >= 0']
    },
    severity: {
      type: String,
      required: [true, 'severity is required'],
      uppercase: true,
      enum: { values: SEVERITIES, message: 'severity must be LOW, MEDIUM, HIGH or CRITICAL' }
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
      maxlength: [500, 'message must be at most 500 characters']
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: `status must be one of: ${STATUSES.join(', ')}` },
      default: 'OPEN'
    },
    assignedTo: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    source: {
      type: String,
      enum: { values: SOURCES, message: 'source must be MONITORING or MANUAL' },
      default: 'MANUAL'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);