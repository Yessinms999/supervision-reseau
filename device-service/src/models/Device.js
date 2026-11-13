// Modèle MongoDB (Mongoose) d'un équipement réseau.
const mongoose = require('mongoose');
const net = require('net');

// Types d'équipements gérés : routeurs, commutateurs et serveurs.
const DEVICE_TYPES = ['ROUTER', 'SWITCH', 'SERVER'];

// États possibles d'un équipement.
//  UP          : opérationnel
//  DOWN        : hors service / injoignable
//  DEGRADED    : fonctionne mais avec anomalies (charge, pertes…)
//  MAINTENANCE : arrêté volontairement pour intervention
//  UNKNOWN     : état pas encore remonté par la supervision
const DEVICE_STATUSES = ['UP', 'DOWN', 'DEGRADED', 'MAINTENANCE', 'UNKNOWN'];

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;

const statusHistorySchema = new mongoose.Schema(
  {
    from: { type: String, enum: DEVICE_STATUSES },
    to: { type: String, enum: DEVICE_STATUSES, required: true },
    reason: { type: String, trim: true, maxlength: 255 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    type: {
      type: String,
      required: [true, 'Le type est obligatoire'],
      enum: { values: DEVICE_TYPES, message: 'Type invalide : {VALUE}' },
    },
    ipAddress: {
      type: String,
      required: [true, "L'adresse IP est obligatoire"],
      unique: true,
      trim: true,
      validate: {
        validator: (v) => net.isIP(v) !== 0,
        message: (props) => `${props.value} n'est pas une adresse IP valide`,
      },
    },
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: (v) => !v || MAC_REGEX.test(v),
        message: (props) => `${props.value} n'est pas une adresse MAC valide`,
      },
    },
    status: {
      type: String,
      enum: { values: DEVICE_STATUSES, message: 'État invalide : {VALUE}' },
      default: 'UNKNOWN',
    },
    vendor: { type: String, trim: true, maxlength: 100 },      // ex : Cisco, Juniper, Dell
    model: { type: String, trim: true, maxlength: 100 },       // ex : ISR 4331
    serialNumber: { type: String, trim: true, maxlength: 100 },
    location: { type: String, trim: true, maxlength: 150 },    // ex : Datacenter Paris - Baie A3
    description: { type: String, trim: true, maxlength: 500 },
    lastStatusChange: { type: Date, default: Date.now },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Index pour accélérer les filtres les plus fréquents.
deviceSchema.index({ type: 1, status: 1 });
deviceSchema.index({ name: 1 });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
module.exports.DEVICE_TYPES = DEVICE_TYPES;
module.exports.DEVICE_STATUSES = DEVICE_STATUSES;
module.exports.MAC_REGEX = MAC_REGEX;
