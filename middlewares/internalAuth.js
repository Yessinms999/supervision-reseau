const { AppError } = require('./errorHandler');

// Protège les routes internes : seul le Monitoring Service connaît la clé
const internalAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return next(new AppError('Unauthorized: invalid or missing API key', 401));
  }

  next();
};

module.exports = internalAuth;