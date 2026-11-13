# middlewares/ — Middlewares Express

| Fichier | Rôle |
|---|---|
| `auth.js` | `authenticate` vérifie le jeton JWT (`Authorization: Bearer <token>`) émis par l'Auth Service et place son contenu dans `req.user`. `authorize(...roles)` restreint une route à certains rôles (ex. `ADMIN`). Les deux sont **inactifs** si `AUTH_ENABLED=false`, pour pouvoir développer et tester sans le service d'authentification. |
| `validateObjectId.js` | Vérifie que le paramètre `:id` est un identifiant MongoDB valide ; sinon renvoie 400 au lieu d'une erreur interne. |
| `notFound.js` | Renvoie une 404 JSON pour toute route inexistante. |
| `errorHandler.js` | Gestionnaire d'erreurs global. Convertit en réponse JSON propre : erreurs métier (`ApiError`), erreurs de validation Mongoose (400), `CastError` (400), doublon d'index unique `11000` (409), JSON mal formé (400). Les erreurs inattendues donnent un 500 sans exposer de détails internes. |

Format de toutes les erreurs :

```json
{ "success": false, "message": "...", "details": [ ... ] }
```
