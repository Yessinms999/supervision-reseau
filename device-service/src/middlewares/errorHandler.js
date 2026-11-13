// Gestionnaire d'erreurs global : transforme toute erreur en réponse JSON homogène.
// Format : { success: false, message, details? }
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  let error = err;

  // JSON mal formé dans le corps de la requête
  if (err.type === 'entity.parse.failed') {
    error = ApiError.badRequest('JSON invalide dans le corps de la requête');
  }

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = ApiError.badRequest('Données invalides', details);
  }

  // Identifiant mal formé
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Valeur invalide pour ${err.path} : ${err.value}`);
  }

  // Doublon sur un index unique (ex : même adresse IP)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    error = ApiError.conflict(`Un équipement existe déjà avec ce ${field}`, err.keyValue);
  }

  const statusCode = error.statusCode || 500;
  if (statusCode === 500) console.error('[device-service] Erreur interne :', err);

  const body = {
    success: false,
    message: statusCode === 500 ? 'Erreur interne du serveur' : error.message,
  };
  if (error.details) body.details = error.details;

  res.status(statusCode).json(body);
};
