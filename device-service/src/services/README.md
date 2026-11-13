# services/ — Logique métier

## `deviceService.js`

C'est ici que se trouvent les règles du domaine « équipements » et tous les accès au modèle `Device`.

| Fonction | Ce qu'elle fait |
|---|---|
| `listDevices(query)` | Liste avec filtres (`type`, `status`, `location`), recherche texte (`search` sur nom, IP, constructeur, modèle, emplacement), pagination (`page`, `limit`) et tri (`sort=name` ou `sort=-createdAt`). L'historique n'est pas renvoyé dans la liste pour l'alléger. |
| `getDeviceById(id)` | Renvoie un équipement ou une erreur 404. |
| `getDeviceByIp(ip)` | Recherche par adresse IP (utile aux autres microservices, ex. supervision). |
| `createDevice(data)` | Vérifie que l'IP est libre (409 sinon), crée l'équipement et initialise son historique d'état. |
| `updateDevice(id, data)` | Met à jour les champs ; si l'IP change, vérifie qu'elle est libre ; si l'état change, il est historisé. |
| `updateDeviceStatus(id, status, reason)` | Change uniquement l'état, enregistre l'ancien et le nouvel état avec la raison et la date. Si l'état est identique, rien n'est modifié. |
| `getStatusHistory(id)` | Renvoie l'historique des changements d'état. |
| `deleteDevice(id)` | Supprime l'équipement (404 s'il n'existe pas). |
| `getStats()` | Total d'équipements + répartition par type et par état (tous les types/états apparaissent, même à 0). |

**Détails techniques :**
- La recherche échappe les caractères spéciaux pour éviter des expressions régulières dangereuses.
- L'historique est limité aux 50 derniers changements pour éviter que le document grossisse indéfiniment.
- Seuls certains champs sont triables (liste blanche `SORTABLE_FIELDS`).
