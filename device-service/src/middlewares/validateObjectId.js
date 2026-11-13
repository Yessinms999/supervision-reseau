// Vérifie que :id est un ObjectId MongoDB valide (évite une CastError).
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

module.exports = (req, _res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(ApiError.badRequest(`Identifiant invalide : ${req.params.id}`));
  }
  next();
};
