# src/ — Code source du Device Service

Le code suit une architecture en couches, chaque couche ayant une seule responsabilité :

```
Requête HTTP
   │
   ▼
routes/        → associe une URL + méthode HTTP à une chaîne de middlewares
   │
middlewares/   → authentification JWT, contrôle de l'ID
validators/    → vérification des données envoyées (400 si invalide)
   │
   ▼
controllers/   → lit la requête, appelle le service, renvoie la réponse JSON
   │
   ▼
services/      → logique métier (IP unique, historique d'état, stats…)
   │
   ▼
models/        → schéma Mongoose → MongoDB
```

En cas d'erreur à n'importe quelle étape, elle est transmise au middleware `errorHandler` qui renvoie une réponse JSON uniforme.

## Fichiers à la racine de src/

| Fichier | Rôle |
|---|---|
| `server.js` | Point d'entrée (`npm start`) : se connecte à MongoDB puis démarre le serveur sur le port configuré. |
| `app.js` | Crée l'application Express : CORS, lecture du JSON, logs `morgan`, route `/health`, routes `/api/devices`, gestion 404 et erreurs. Séparé de `server.js` pour pouvoir tester l'application sans lancer de serveur. |
