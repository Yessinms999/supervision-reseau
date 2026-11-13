// Enveloppe un contrôleur async pour transmettre automatiquement les erreurs à next().
// Évite d'écrire un try/catch dans chaque contrôleur.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
