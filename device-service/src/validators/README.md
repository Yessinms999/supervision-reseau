# validators/ — Validation des requêtes

## `deviceValidator.js`

Middlewares qui contrôlent les données **avant** d'appeler la base. En cas de problème, ils renvoient une erreur **400** avec la liste précise des champs fautifs.

| Middleware | Utilisé sur | Vérifications |
|---|---|---|
| `validateCreate` | `POST /api/devices` | `name`, `type`, `ipAddress` obligatoires ; type et état autorisés ; IP valide ; MAC valide ; refus des champs inconnus |
| `validateUpdate` | `PUT /api/devices/:id` | Mêmes règles mais tous les champs sont facultatifs ; au moins un champ requis |
| `validateStatus` | `PATCH /api/devices/:id/status` | `status` obligatoire et autorisé ; `reason` facultative (texte) |
| `validateListQuery` | `GET /api/devices` | `type`, `status` valides ; `page` ≥ 1 ; `limit` entre 1 et 100 |

Les valeurs sont aussi **normalisées** : `type` et `status` passent en majuscules (`router` → `ROUTER`), l'IP est nettoyée des espaces. Seuls les champs autorisés sont transmis au service (protection contre l'injection de champs comme `statusHistory`).
