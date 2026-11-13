// Centralise la lecture des variables d'environnement.
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3002,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/device_service_db',
  authEnabled: String(process.env.AUTH_ENABLED).toLowerCase() === 'true',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  nodeEnv: process.env.NODE_ENV || 'development',
};
