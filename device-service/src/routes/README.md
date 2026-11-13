# routes/ — Endpoints REST

## `deviceRoutes.js`

Déclare toutes les routes montées sous `/api/devices` (dans `app.js`) et l'ordre des middlewares appliqués à chacune.

| Méthode | Route | Chaîne appliquée |
|---|---|---|
| GET | `/` | auth → `validateListQuery` → `getDevices` |
| GET | `/meta` | auth → `getMeta` |
| GET | `/stats` | auth → `getStats` |
| GET | `/ip/:ip` | auth → `getDeviceByIp` |
| GET | `/:id` | auth → `validateObjectId` → `getDevice` |
| GET | `/:id/history` | auth → `validateObjectId` → `getStatusHistory` |
| POST | `/` | auth → rôle ADMIN/OPERATOR → `validateCreate` → `createDevice` |
| PUT | `/:id` | auth → rôle ADMIN/OPERATOR → `validateObjectId` → `validateUpdate` → `updateDevice` |
| PATCH | `/:id/status` | auth → rôle ADMIN/OPERATOR → `validateObjectId` → `validateStatus` → `updateStatus` |
| DELETE | `/:id` | auth → rôle ADMIN → `validateObjectId` → `deleteDevice` |

Les routes fixes (`/meta`, `/stats`, `/ip/:ip`) sont déclarées **avant** `/:id` pour qu'Express ne les confonde pas avec un identifiant.

L'authentification et les rôles ne sont appliqués que si `AUTH_ENABLED=true`.
