// Configuration de l'application Express (sans démarrer le serveur).
// Séparé de server.js pour pouvoir tester l'app sans ouvrir de port.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const deviceRoutes = require('./routes/deviceRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { nodeEnv } = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
if (nodeEnv !== 'test') app.use(morgan('dev'));

// Vérification de santé (utile pour Docker / API Gateway).
app.get('/health', (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    service: 'device-service',
    status: 'OK',
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/devices', deviceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
