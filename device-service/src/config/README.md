# config/ — Configuration

| Fichier | Rôle |
|---|---|
| `index.js` | Charge le fichier `.env` (via `dotenv`) et expose les paramètres : `port`, `mongoUri`, `authEnabled`, `jwtSecret`, `nodeEnv`. Des valeurs par défaut sont prévues si une variable manque. |
| `db.js` | Fonction `connectDB()` qui ouvre la connexion MongoDB avec Mongoose. Si la connexion échoue, le service s'arrête avec un message clair. |

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3002` | Port HTTP du service |
| `MONGO_URI` | `mongodb://localhost:27017/device_service_db` | Adresse de la base MongoDB |
| `AUTH_ENABLED` | `false` | Active la vérification des jetons JWT |
| `JWT_SECRET` | `change_me` | Clé partagée avec l'Auth Service |

Copier `.env.example` en `.env` à la racine du service pour les personnaliser.
