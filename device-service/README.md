# Device Service — Gestion des équipements réseau

Microservice du **Membre 2** de la plateforme de supervision des équipements réseau (environnement télécom).
Il gère l'inventaire des **routeurs, commutateurs (switchs) et serveurs** : ajout, modification, suppression, consultation, ainsi que leur **type**, leur **adresse IP** et leur **état**.

> La base de données n'est pas fournie : il suffit d'avoir un MongoDB accessible et de renseigner `MONGO_URI` dans le fichier `.env`. La base et la collection `devices` sont créées automatiquement par Mongoose au premier ajout.

## Technologies

| Outil | Rôle dans ce service |
|---|---|
| Node.js | Environnement d'exécution |
| Express.js | Création de l'API REST |
| MongoDB + Mongoose | Persistance et validation du modèle `Device` |
| JWT (jsonwebtoken) | Vérification des jetons émis par l'Auth Service (optionnel) |
| Postman | Tests de l'API (collection fournie dans `postman/`) |
| Docker | `Dockerfile` prêt pour Docker Compose |

## Arborescence

```
device-service/
├── src/
│   ├── server.js            # Point d'entrée : connexion MongoDB + démarrage
│   ├── app.js               # Configuration Express (middlewares, routes)
│   ├── config/              # Variables d'environnement et connexion MongoDB
│   ├── models/              # Modèle MongoDB des équipements (Device)
│   ├── validators/          # Validation des données entrantes
│   ├── routes/              # Déclaration des endpoints REST
│   ├── controllers/         # Réception requête -> appel service -> réponse JSON
│   ├── services/            # Logique métier et accès à la base
│   ├── middlewares/         # Auth JWT, erreurs, 404, contrôle des IDs
│   └── utils/               # Classe d'erreur et helper async
├── postman/                 # Collection Postman pour tester l'API
├── .env.example             # Modèle de configuration
├── Dockerfile
└── package.json
```

Chaque dossier contient son propre `README.md` qui détaille son contenu.

## Installation et lancement

```bash
cd device-service
npm install
cp .env.example .env        # sous Windows : copy .env.example .env
# adapter MONGO_URI si besoin
npm run dev                 # mode développement (redémarrage auto)
# ou
npm start
```

Le service écoute par défaut sur **http://localhost:3002**. Vérification : `GET http://localhost:3002/health`.

### Avec Docker

```bash
docker build -t device-service .
docker run -p 3002:3002 -e MONGO_URI=mongodb://host.docker.internal:27017/device_service_db device-service
```

Exemple de bloc pour le `docker-compose.yml` commun du projet :

```yaml
  device-service:
    build: ./device-service
    ports:
      - "3002:3002"
    environment:
      - MONGO_URI=mongodb://mongo:27017/device_service_db
      - AUTH_ENABLED=false
      - JWT_SECRET=secret_partage
    depends_on:
      - mongo
```

## Modèle `Device`

| Champ | Type | Obligatoire | Détail |
|---|---|---|---|
| `name` | String | oui | 2 à 100 caractères |
| `type` | String | oui | `ROUTER`, `SWITCH`, `SERVER` |
| `ipAddress` | String | oui | IPv4 ou IPv6 valide, **unique** |
| `status` | String | non | `UP`, `DOWN`, `DEGRADED`, `MAINTENANCE`, `UNKNOWN` (défaut) |
| `macAddress` | String | non | Format `AA:BB:CC:DD:EE:FF` |
| `vendor`, `model`, `serialNumber` | String | non | Constructeur, modèle, n° de série |
| `location` | String | non | Emplacement physique |
| `description` | String | non | 500 caractères max |
| `lastStatusChange` | Date | auto | Date du dernier changement d'état |
| `statusHistory` | Array | auto | Historique des 50 derniers changements d'état |
| `createdAt`, `updatedAt` | Date | auto | Horodatage Mongoose |

## Endpoints

Préfixe : `/api/devices`

| Méthode | Route | Description | Rôle requis (si auth active) |
|---|---|---|---|
| GET | `/health` | État du service et de la connexion MongoDB | — |
| GET | `/api/devices` | Liste paginée + filtres | connecté |
| GET | `/api/devices/meta` | Types et états autorisés | connecté |
| GET | `/api/devices/stats` | Nombre d'équipements par type et par état | connecté |
| GET | `/api/devices/ip/:ip` | Recherche par adresse IP | connecté |
| GET | `/api/devices/:id` | Détail d'un équipement | connecté |
| GET | `/api/devices/:id/history` | Historique des changements d'état | connecté |
| POST | `/api/devices` | Ajouter un équipement | ADMIN, OPERATOR |
| PUT | `/api/devices/:id` | Modifier un équipement | ADMIN, OPERATOR |
| PATCH | `/api/devices/:id/status` | Changer uniquement l'état | ADMIN, OPERATOR |
| DELETE | `/api/devices/:id` | Supprimer un équipement | ADMIN |

**Paramètres de `GET /api/devices`** : `type`, `status`, `search` (nom, IP, constructeur, modèle, emplacement), `location`, `page` (défaut 1), `limit` (1–100, défaut 20), `sort` (ex. `name`, `-createdAt`).

### Exemple — ajouter un routeur

```http
POST /api/devices
Content-Type: application/json

{
  "name": "Routeur-Core-01",
  "type": "ROUTER",
  "ipAddress": "10.0.0.1",
  "status": "UP",
  "vendor": "Cisco",
  "location": "Datacenter Paris - Baie A1"
}
```

Réponse `201` :

```json
{
  "success": true,
  "message": "Équipement créé",
  "data": { "id": "665f...", "name": "Routeur-Core-01", "type": "ROUTER", "ipAddress": "10.0.0.1", "status": "UP", "...": "..." }
}
```

### Exemple — changer l'état

```http
PATCH /api/devices/665f.../status
{ "status": "DOWN", "reason": "Ping sans réponse" }
```

Cet endpoint est celui que le service de supervision/simulation peut appeler pour faire évoluer l'état des équipements.

### Format des erreurs

```json
{ "success": false, "message": "Données invalides", "details": [ { "field": "ipAddress", "message": "Adresse IPv4 ou IPv6 invalide" } ] }
```

| Code | Cas |
|---|---|
| 400 | Données invalides, ID mal formé, JSON incorrect |
| 401 | Jeton absent ou invalide (si `AUTH_ENABLED=true`) |
| 403 | Rôle insuffisant |
| 404 | Équipement ou route introuvable |
| 409 | Adresse IP déjà utilisée |
| 500 | Erreur interne |

## Authentification (intégration avec l'Auth Service)

Par défaut `AUTH_ENABLED=false` pour tester librement. En mettant `AUTH_ENABLED=true` et le **même `JWT_SECRET`** que le service d'authentification, chaque requête doit contenir `Authorization: Bearer <token>`. Le jeton doit contenir un champ `role` (`ADMIN`, `OPERATOR`, …).

## Tests avec Postman

Importer `postman/DeviceService.postman_collection.json` dans Postman, puis lancer la collection avec le **Runner** (voir `postman/README.md`).

## Ce qui a été vérifié

Tous les endpoints ont été exécutés (création, doublon d'IP, validation, filtres, recherche par IP, mise à jour, changement d'état + historique, statistiques, suppression, erreurs 400/401/403/404/409) avec un stockage simulé à la place de MongoDB. Il reste à les rejouer avec Postman une fois votre base MongoDB lancée.
