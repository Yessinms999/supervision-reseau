require('dotenv').config();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');

const alerts = [
  { deviceId: 'ROUTER-01', metric: 'CPU', value: 97, threshold: 85, severity: 'CRITICAL', message: 'CPU usage critical on ROUTER-01', status: 'OPEN', source: 'MONITORING' },
  { deviceId: 'ROUTER-01', metric: 'TRAFFIC', value: 1800, threshold: 1500, severity: 'HIGH', message: 'Traffic spike on ROUTER-01', status: 'IN_PROGRESS', assignedTo: 'tech-1', source: 'MONITORING' },
  { deviceId: 'ROUTER-01', metric: 'MEMORY', value: 82, threshold: 80, severity: 'MEDIUM', message: 'Memory usage above threshold on ROUTER-01', status: 'RESOLVED', resolvedAt: new Date(), source: 'MONITORING' },
  { deviceId: 'ROUTER-02', metric: 'LATENCY', value: 250, threshold: 200, severity: 'MEDIUM', message: 'High latency on ROUTER-02', status: 'OPEN', source: 'MONITORING' },
  { deviceId: 'ROUTER-02', metric: 'TEMPERATURE', value: 78, threshold: 70, severity: 'HIGH', message: 'Temperature too high on ROUTER-02', status: 'IN_PROGRESS', assignedTo: 'tech-2', source: 'MONITORING' },
  { deviceId: 'FIREWALL-01', metric: 'CPU', value: 91, threshold: 85, severity: 'HIGH', message: 'Firewall CPU high', status: 'OPEN', source: 'MONITORING' },
  { deviceId: 'FIREWALL-01', metric: 'TRAFFIC', value: 2300, threshold: 2000, severity: 'HIGH', message: 'Firewall traffic above limit', status: 'OPEN', source: 'MONITORING' },
  { deviceId: 'FIREWALL-01', metric: 'DISK', value: 93, threshold: 90, severity: 'MEDIUM', message: 'Firewall disk almost full', status: 'RESOLVED', resolvedAt: new Date(), source: 'MONITORING' },
  { deviceId: 'SWITCH-01', metric: 'TRAFFIC', value: 950, threshold: 800, severity: 'LOW', message: 'Slight traffic increase on SWITCH-01', status: 'OPEN', source: 'MONITORING' },
  { deviceId: 'SWITCH-01', metric: 'TEMPERATURE', value: 65, threshold: 60, severity: 'LOW', message: 'Temperature warning on SWITCH-01', status: 'RESOLVED', resolvedAt: new Date(), source: 'MONITORING' },
  { deviceId: 'SERVER-01', metric: 'TRAFFIC', value: 1200, threshold: 1000, severity: 'MEDIUM', message: 'Traffic above normal on SERVER-01', status: 'IN_PROGRESS', assignedTo: 'tech-1', source: 'MONITORING' },
  { deviceId: 'SERVER-01', metric: 'DISK', value: 96, threshold: 90, severity: 'CRITICAL', message: 'Disk space critical on SERVER-01', status: 'IN_PROGRESS', assignedTo: 'tech-2', source: 'MONITORING' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Alert.deleteMany({});
    await Alert.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts`);
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();