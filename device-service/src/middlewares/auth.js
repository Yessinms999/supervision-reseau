// Vérification du jeton JWT émis par l'Auth Service (User Service).
// Activée seulement si AUTH_ENABLED=true dans le .env.
const jwt = require('jsonwebtoken');
const { authEnabled, jwtSecret } = require('../config');
const ApiError = require('../utils/ApiError');

// Vérifie la présence et la validité du jeton "Authorization: Bearer <token>".
exports.authenticate = (req, _res, next) => {
  if (!authEnabled) return next();

  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Jeton manquant (Authorization: Bearer <token>)'));
  }

  try {
    req.user = jwt.verify(token, jwtSecret); // ex : { id, email, role }
    next();
  } catch (err) {
    next(ApiError.unauthorized('Jeton invalide ou expiré'));
  }
};

// Restreint une route à certains rôles (ex : authorize('ADMIN', 'OPERATOR')).
exports.authorize = (...roles) => (req, _res, next) => {
  if (!authEnabled) return next();
  const role = req.user && String(req.user.role || '').toUpperCase();
  if (!role || !roles.includes(role)) {
    return next(ApiError.forbidden(`Rôle requis : ${roles.join(' ou ')}`));
  }
  next();
};
