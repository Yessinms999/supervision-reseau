# postman/ — Tests de l'API avec Postman

## `DeviceService.postman_collection.json`

Collection prête à importer qui couvre toutes les routes du Device Service, avec un test automatique sur le code HTTP attendu pour chaque requête.

### Utilisation

1. Lancer MongoDB puis le service (`npm run dev`).
2. Dans Postman : **Import** → choisir ce fichier.
3. Vérifier la variable de collection `baseUrl` (par défaut `http://localhost:3002`).
4. Clic droit sur la collection → **Run collection** pour tout exécuter dans l'ordre.

### Contenu

| Dossier | Requêtes |
|---|---|
| 0 - Santé | `GET /health` |
| 1 - Ajouter | Création d'un routeur, d'un switch et d'un serveur (leurs IDs sont enregistrés dans `routerId`, `switchId`, `serverId`), + cas d'erreur : IP en double (409), données invalides (400) |
| 2 - Consulter | Liste, filtres par type et état, recherche + pagination + tri, détail par ID, recherche par IP, statistiques, métadonnées, ID invalide (400) |
| 3 - Modifier | `PUT` d'un switch, `PATCH` de l'état du routeur, historique des états, état invalide (400) |
| 4 - Supprimer | Suppression du serveur puis vérification qu'il n'existe plus (404) |

### Authentification

Si `AUTH_ENABLED=true`, coller un jeton obtenu auprès de l'Auth Service dans la variable `token`, puis activer l'en-tête `Authorization` (désactivé par défaut) dans les requêtes.

> Pour relancer la collection plusieurs fois, vider la collection `devices` dans MongoDB ou supprimer les équipements créés, sinon les créations renverront 409 (IP déjà utilisée).
