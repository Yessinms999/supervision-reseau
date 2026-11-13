// Connexion à MongoDB via Mongoose.
const mongoose = require('mongoose');
const { mongoUri } = require('./index');

async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`[device-service] MongoDB connecté : ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('[device-service] Échec de connexion à MongoDB :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
