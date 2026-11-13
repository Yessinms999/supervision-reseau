require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const internalRoutes = require('./routes/internalRoutes');
const alertRoutes = require('./routes/alertRoutes');


const app = express();

// Middlewares globaux
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Route de test (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'alert-service',
    message: 'Alert Service is running'
  });
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/internal', internalRoutes);
app.use('/api/alerts', alertRoutes);


// Gestion des erreurs : toujours après toutes les routes
app.use(notFound);
app.use(errorHandler);

// Démarrage : on se connecte à MongoDB d'abord, puis on écoute
const PORT = process.env.PORT || 3002;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Alert Service listening on port ${PORT}`);
  });
};

startServer();