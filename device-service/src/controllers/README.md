# controllers/ — Contrôleurs HTTP

## `deviceController.js`

Chaque fonction reçoit la requête Express, appelle la fonction correspondante du **service**, puis renvoie une réponse JSON au format :

```json
{ "success": true, "message": "...", "data": { ... } }
```

| Fonction | Route | Code renvoyé |
|---|---|---|
| `getDevices` | `GET /api/devices` | 200 (+ `count` et `pagination`) |
| `getMeta` | `GET /api/devices/meta` | 200 |
| `getStats` | `GET /api/devices/stats` | 200 |
| `getDeviceByIp` | `GET /api/devices/ip/:ip` | 200 / 404 |
| `getDevice` | `GET /api/devices/:id` | 200 / 404 |
| `getStatusHistory` | `GET /api/devices/:id/history` | 200 / 404 |
| `createDevice` | `POST /api/devices` | 201 / 409 |
| `updateDevice` | `PUT /api/devices/:id` | 200 / 404 / 409 |
| `updateStatus` | `PATCH /api/devices/:id/status` | 200 / 404 |
| `deleteDevice` | `DELETE /api/devices/:id` | 200 / 404 |

Les contrôleurs ne contiennent **aucune logique métier ni requête MongoDB** : tout est dans `services/`. Ils sont enveloppés par `asyncHandler` pour que toute erreur soit automatiquement transmise au gestionnaire d'erreurs.
