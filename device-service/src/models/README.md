# models/ — Modèle MongoDB

## `Device.js`

Définit le schéma Mongoose d'un équipement réseau, stocké dans la collection **`devices`**.

**Ce qui a été fait :**

- **Type** limité à `ROUTER`, `SWITCH`, `SERVER` (les trois catégories demandées : routeurs, commutateurs, serveurs).
- **État** limité à `UP`, `DOWN`, `DEGRADED`, `MAINTENANCE`, `UNKNOWN` (valeur par défaut tant que la supervision n'a rien remonté).
- **Adresse IP** obligatoire, validée avec le module natif `net.isIP` (IPv4 et IPv6) et **unique** : deux équipements ne peuvent pas avoir la même IP.
- **Adresse MAC** facultative, validée par une expression régulière et mise en majuscules.
- Champs d'inventaire : `vendor`, `model`, `serialNumber`, `location`, `description`.
- **Suivi d'état** : `lastStatusChange` et `statusHistory` (sous-documents `{ from, to, reason, changedAt }`), utile pour les incidents et alertes.
- `timestamps: true` ajoute automatiquement `createdAt` et `updatedAt`.
- Dans les réponses JSON, `_id` est renommé `id` et `__v` est retiré.
- Index sur `type + status` et sur `name` pour accélérer les filtres.

Le fichier exporte aussi les constantes `DEVICE_TYPES`, `DEVICE_STATUSES` et `MAC_REGEX`, réutilisées par les validateurs et les statistiques pour éviter de dupliquer les listes.
