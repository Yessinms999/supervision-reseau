# utils/ — Utilitaires

| Fichier | Rôle |
|---|---|
| `ApiError.js` | Classe d'erreur qui porte un code HTTP (`statusCode`) et éventuellement des `details`. Raccourcis : `ApiError.badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`. Les services la lèvent (`throw ApiError.notFound(...)`) et `errorHandler` la transforme en réponse JSON. |
| `asyncHandler.js` | Enveloppe une fonction `async` de contrôleur pour transmettre automatiquement toute erreur à `next()`. Évite un `try/catch` dans chaque contrôleur. |
