// Point d'entrée : connexion à MongoDB puis démarrage du serveur HTTP.
const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config');

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`[device-service] Démarré sur http://localhost:${port}`);
  });
}

start();
