// Route inconnue -> 404 au format JSON.
const ApiError = require('../utils/ApiError');

module.exports = (req, _res, next) => {
  next(ApiError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
};
