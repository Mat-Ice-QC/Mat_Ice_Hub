---
title: Structure du dépôt et référence des composants
sidebar_label: Structure du dépôt et référence des composants
sidebar_position: 10
description: Arborescence complète du dépôt Disk Hunter, référence des fichiers par microservice et architecture de performance de l'interface.
---

# Structure du dépôt et référence des composants

Ce document décrit le rôle de chaque répertoire et fichier du dépôt Disk Hunter ainsi que les invariants de performance du frontend et du backend.

## Arborescence du dépôt

```text
Disk-Hunter/
├── backend/                Service orchestrateur FastAPI (disk-hunter-api)
│   ├── api/                Routeurs REST, hub WebSocket, générateur PDF, gestionnaire Docker
│   ├── docker-entrypoint.sh Initialisation au premier démarrage : dossiers et JSON (755/644)
│   ├── Dockerfile          Définition de conteneur pour le backend principal
│   ├── main.py             Point d'entrée de l'application FastAPI et middlewares
│   └── requirements.txt    Dépendances Python verrouillées pour l'API principale
├── html/                   Interface statique servie par Nginx (montée en bind-mount)
│   ├── components/         Fragments HTML partagés (header, sidebar, footer)
│   ├── css/                Feuilles de style par page et thème global glassmorphique
│   ├── docs/               Guides d'aide intégrés en Markdown (anglais et français sous docs/fr/)
│   ├── js/                 Contrôleurs frontend, client WebSocket et caches DOM
│   ├── *.html              Pages de l'application (index, shredding, smartctl, speedtest, etc.)
│   ├── locales.json        Dictionnaire de traduction de l'interface (anglais, français, espagnol)
│   └── tools.json          Définitions des outils et métadonnées de navigation
├── smart-provider/         Microservice FastAPI privilégié pour les requêtes smartctl
│   ├── Dockerfile          Définition de conteneur pour smart-provider
│   ├── main.py             Service HTTP autour de smartctl avec cache de 30 secondes
│   └── requirements.txt    Dépendances Python verrouillées pour smart-provider
├── workers/                Conteneurs de tâches éphémères privilégiés
│   ├── firefox-kiosk/      Kiosque plein écran Xorg + Firefox ESR sur tty2
│   ├── hdparm/             Scripts ATA Secure Erase et dégel des disques SATA gelés
│   ├── nvme/               Formatage matériel NVMe et effacement cryptographique
│   ├── nwipe/              Écrasement de blocs multi-passes (DoD, Gutmann, PRNG, zéros)
│   ├── parted/             Gestion des tables de partitions et formatage de systèmes de fichiers
│   ├── power/              Arrêt et redémarrage de l'hôte (--pid=host via nsenter/systemctl)
│   ├── smartctl-test/      Exécution d'autotests S.M.A.R.T. courts et étendus
│   └── speedtest-worker/   Tests de débit séquentiels via fio
├── screenshots/            Captures d'écran de l'interface
├── docker-compose.yml      Orchestration multi-conteneurs et arguments de condensats SHA256
├── .env.example            Modèle de variables d'environnement et condensats d'images
├── nginx.conf              Configuration de base du serveur web Nginx
└── nginx-entrypoint.sh     Génère default.conf avec filtrage ALLOWED_IPS et options TLS
```

## Fichiers à la racine

| Fichier | Rôle |
| --- | --- |
| `.env.example` | Modèle définissant les variables d'environnement, les bascules de fonctionnalités et les condensats SHA256 des images de base. |
| `docker-compose.yml` | Définit `disk-hunter-ui`, `disk-hunter-api`, `disk-hunter-smart-provider`, les cibles de build des workers éphémères et le profil optionnel `kiosk`. |
| `nginx.conf` | Configuration Nginx principale activant la compression gzip sur les réponses texte/JSON. |
| `nginx-entrypoint.sh` | Script de démarrage (doit être en mode `755`) qui génère `/etc/nginx/conf.d/default.conf` avec les règles `ALLOWED_IPS`, la configuration HTTPS optionnelle, les en-têtes `ETag` et le proxy inverse `/api/` et `/ws/`. |
| `LICENSE` | Licence GNU Affero General Public License v3.0 (`AGPL-3.0`). |
| `README.md` | Présentation générale, guide de démarrage rapide et journal des modifications. |

## Service Backend (`backend/`)

L'application principale Python FastAPI (`disk-hunter-api`) qui orchestre la détection des disques, les conteneurs workers, les journaux d'historique et les certificats PDF.

| Fichier | Rôle |
| --- | --- |
| `backend/main.py` | Point d'entrée FastAPI enregistrant les routeurs, le contrôle d'accès IP et les tâches d'arrière-plan. |
| `backend/docker-entrypoint.sh` | Initialise les sous-dossiers de `DATA_DIR` et les fichiers JSON par défaut avec les permissions `755`/`644` (et `chown` via `DATA_UID`/`DATA_GID`) avant de lancer `uvicorn`. |
| `backend/api/config.py` | Lecture centralisée des variables d'environnement, bascules de modules et chemins de stockage. |
| `backend/api/disks.py` | Découverte des périphériques de bloc (`lsblk`, `/sys/block`, udev), recherche unifiée des numéros de série, structure des partitions et détection du disque racine. |
| `backend/api/drive_info.py` | Reconnaissance des modèles/fabricants, classification des facteurs de forme (`U.2`, `U.3`, `NVMe`, `SSD`, `HDD`, `USB`) et métadonnées matérielles. |
| `backend/api/docker_manager.py` | Lance, surveille, collecte les journaux et nettoie les conteneurs workers Docker éphémères (avec prise en charge de `--pid=host` via `pid_host`) ; gère le verrouillage inter-modules des disques occupés (`get_busy_disks()`). |
| `backend/api/shredding.py` | Routes de démarrage/arrêt des travaux `nwipe`, `hdparm` ATA Secure Erase et `nvme-cli`, ainsi que le signalement des disques en échec. |
| `backend/api/smartctl.py` | Routes proxy interrogeant `smart-provider` et démarrant les conteneurs d'autotests `smartctl-test`. |
| `backend/api/speedtest.py` | Routes de lancement et de suivi des tests de vitesse séquentiels `fio` sur les partitions montées. |
| `backend/api/partition.py` | Routes de création de tables de partitions (`gpt`, `msdos`, etc.), d'ajout/suppression de partitions et de formatage via `parted`. |
| `backend/api/iso.py` | Routes de téléchargement d'images `.iso`/`.img` dans `/app/data/isos`, suivi dans `iso_history.json` et flashage sur disque. |
| `backend/api/network.py` | Découverte des interfaces de l'hôte (`ip -j addr`, `ip -j route`), inspection DNS, validation statique/DHCP/VLAN 802.1Q, génération du YAML netplan et application protégée par restauration automatique (`NETWORK_APPLY_ENABLED`). |
| `backend/api/inventory.py` | Points de terminaison CRUD (`/api/inventory`) associant les numéros de série (`S/N`) aux ID d'inventaire dans `data/inventory.json`. |
| `backend/api/images.py` | Sert les illustrations SVG par défaut immuables (`/api/images/defaults/{kind}.svg`) et gère les images personnalisées par modèle ainsi que le logo. |
| `backend/api/data_management.py` | Explorateur de fichiers sécurisé en lecture seule, calcul à la demande de la taille des répertoires (`/api/data-management/dir-size`) avec cache TTL de 60 s et nettoyage des historiques. |
| `backend/api/history.py` | Routes servant les historiques opérationnels (`wipe_history.json`, `smart_history.json`, `speedtest_history.json`, `partition_history.json`, `iso_history.json`) et les journaux des conteneurs. |
| `backend/api/pdf_generator.py` | Génère les certificats d'effacement PDF visuels incluant l'identité de l'organisation, le numéro de série, l'ID d'inventaire, la méthode d'effacement et la vérification. |
| `backend/api/reports.py` | Téléchargement des certificats PDF et export CSV des pistes d'audit. |
| `backend/api/settings.py` | Lecture et mise à jour de `data/app_settings.json` et `data/branding.json`, ainsi que la lecture/modification de l'heure système et la synchronisation NTP. |
| `backend/api/system.py` | Télémétrie et contrôle de l'hôte : nom d'hôte, IP principale, utilisation de la partition racine, températures multi-capteurs, notifications centralisées, bascules de fonctionnalités (`/api/system/features` incluant `POWER_ACTIONS_ENABLED`) et actions d'alimentation de l'hôte (`POST /api/system/power` pour `shutdown` et `reboot` avec refus sur disque occupé et diffusion WebSocket). |
| `backend/api/ws.py` | Hub WebSocket diffusant en temps réel l'état des disques, la progression des tâches actives et les températures. |
| `backend/api/models.py` | Schémas Pydantic de requêtes et de réponses pour l'ensemble des routeurs. |

## Interface Frontend (`html/`)

Une interface web construite en HTML, CSS et JavaScript vanilla sans étape de compilation, servie directement par Nginx.

### Pages HTML et composants partagés

| Chemin | Rôle |
| --- | --- |
| `html/index.html` | Tableau de bord principal affichant les disques connectés, partitions, état de santé et caractéristiques matérielles. |
| `html/shredding.html` | Interface de broyage (`nwipe`) et d'effacement matériel (`hdparm` / `nvme-cli`) avec modale de confirmation et saisie de métadonnées en lot. |
| `html/smartctl.html` | Tableau de santé S.M.A.R.T., attributs NVMe/U.2/U.3 analysés et lancement d'autotests courts ou étendus. |
| `html/smart_logs.html` | Visualiseur détaillé des attributs S.M.A.R.T. bruts et des journaux d'autotests. |
| `html/speedtest.html` | Interface de lancement et de suivi des benchmarks `fio`. |
| `html/partition.html` | Éditeur de partitions visuel avec barre proportionnelle et file d'opérations en lot. |
| `html/iso.html` | Téléchargeur d'images OS (`.iso` / `.img`) et outil d'écriture sur périphérique. |
| `html/temperature.html` | Surveillance en temps réel des capteurs de température avec indicateurs de seuils. |
| `html/network.html` | Inspection des interfaces réseau, validation de plans statiques/DHCP/VLAN, aperçu netplan et application avec restauration automatique. |
| `html/network-share.html` | Vue de configuration des partages réseau. |
| `html/data-management.html` | Explorateur du répertoire de données persistantes, téléchargement de rapports et indicateur d'espace disque. |
| `html/notifications.html` | Centre de notifications centralisé regroupant les alertes système, fins de tâches et erreurs. |
| `html/settings.html` | Paramètres serveur, identité visuelle, gestionnaire d'images de disques, gestionnaire d'ID d'inventaire, horloge système/NTP et nettoyage d'historiques. |
| `html/docs.html` | Centre d'aide intégré affichant la documentation Markdown issue de `html/docs/`. |
| `html/history.html`, `smart_history.html`, `speedtest_history.html`, `partition_history.html`, `iso_history.html` | Tableaux d'historique par module utilisant les 5 colonnes unifiées et la fenêtre modale de détail des commandes. |
| `html/components/header.html`, `sidebar.html`, `footer.html` | Barre latérale de navigation, barre supérieure de télémétrie (nom d'hôte, IP, températures, horloge, cloche de notifications) et pied de page. |

### Contrôleurs JavaScript (`html/js/`)

| Fichier | Rôle |
| --- | --- |
| `html/js/common.js` | Gestionnaire WebSocket partagé (diffusant `ws-open` à la reconnexion et les avis `ws-power_action`), chargement `localStorage` stale-while-revalidate des fragments/traductions, horloge synchronisée à la seconde, bandeau global de notifications et utilitaires de modales. |
| `html/js/history-common.js` | Moteur de rendu de tableaux partagé, formatage des badges de statut et modale unique de détail des commandes/journaux pour les cinq pages d'historique. |
| `html/js/index.js` | Contrôleur du tableau de bord avec cache DOM de cartes indexé par disque, délégation d'événements et boutons **Arrêter l'hôte** / **Redémarrer l'hôte** (verrouillage sur disque occupé et déverrouillage automatique sur `ws-open` après redémarrage). |
| `html/js/shredding.js` | Contrôleur de broyage et d'effacement sécurisé, conservation de la sélection entre modes, saisie de métadonnées en lot et flux de journaux en direct. |
| `html/js/smartctl.js`, `smart_logs.js`, `smart_history.js` | Contrôleurs de diagnostic S.M.A.R.T., analyseur du journal de santé NVMe, modale d'autotests et historique. |
| `html/js/speedtest.js`, `speedtest_history.js` | Contrôleur des tests `fio`, suivi de progression en direct et historique des benchmarks. |
| `html/js/partition.js`, `partition_history.js` | Rendu de la barre de partitions visuelle, gestionnaire d'opérations en lot et historique de partitionnement. |
| `html/js/iso.js`, `iso_history.js` | Suivi des téléchargements ISO, écriture sur disque et historique des actions ISO. |
| `html/js/network.js` | Validation des plans réseau, formulaire VLAN 802.1Q, aperçu netplan et compte à rebours de restauration. |
| `html/js/temperature.js` | Contrôleur de la page Température avec mise en pause automatique (`visibilitychange`) lorsque l'onglet est masqué. |
| `html/js/notifications.js` | Rendu du flux de notifications, compteur de non-lus et actions d'acquittement/suppression. |
| `html/js/data-management.js` | Explorateur de fichiers avec chargement asynchrone de la taille des dossiers (`/api/data-management/dir-size`). |
| `html/js/settings.js` | Contrôleur des paramètres serveur, du gestionnaire d'ID d'inventaire, du gestionnaire d'images, de l'horloge/NTP et du Potato Mode. |
| `html/js/docs.js` | Analyseur Markdown et rendu des accordéons/encadrés pour l'aide intégrée. |

## SMART Provider et Conteneurs Workers

| Composant | Chemin | Rôle |
| --- | --- | --- |
| **SMART Provider** | `smart-provider/main.py` | Microservice FastAPI privilégié exposant `/smart/{device}` et les journaux d'autotests avec un cache mémoire de 30 secondes. |
| **Worker nwipe** | `workers/nwipe/Dockerfile` | Exécute `nwipe` selon l'algorithme choisi (`zero`, `ops2`, `dodshort`, `dod522022m`, `gutmann`, `prng`) et le mode de vérification. |
| **Worker hdparm** | `workers/hdparm/hdparm-secure-erase.sh` | Exécute ATA `SECURITY ERASE`, tente le dégel multi-méthodes sur les disques SATA gelés et bascule vers un écrasement par zéros (NIST SP 800-88 Clear) lorsque `FROZEN_FALLBACK_WIPE=1`. |
| **Worker nvme** | `workers/nvme/run_wipe.sh` | Exécute `nvme format` (`SES=1` données utilisateur ou `SES=2` effacement cryptographique) sur les contrôleurs et espaces de noms `/dev/nvme*`. |
| **Worker parted** | `workers/parted/Dockerfile` | Exécute `parted`, `mkfs.ext4`, `mkfs.ntfs`, `mkfs.vfat`, `mkfs.btrfs` et `mkfs.xfs`. |
| **Worker power** | `workers/power/power-action.sh` | Conteneur privilégié `--pid=host` (épinglé sur le condensat `ALPINE_IMAGE` et `UTIL_LINUX_VERSION`) qui demande à `systemd` de l'hôte un `systemctl poweroff -i` ou `systemctl reboot -i` propre via `nsenter -t 1 -m -u -i -n`, avec repli sur `--force` puis l'appel système `reboot(2)`. |
| **Worker smartctl-test** | `workers/smartctl-test/run_test.sh` | Lance et surveille les autotests `smartctl -t short` et `smartctl -t long`. |
| **Worker speedtest** | `workers/speedtest-worker/run_test.sh` | Exécute les benchmarks séquentiels `fio` (`1G`, `10G`, `100G`) dans le répertoire monté de la partition et nettoie `.fio_test`. |
| **Worker firefox-kiosk** | `workers/firefox-kiosk/` | Démarre Xorg sur `tty2` et lance Firefox ESR en mode kiosque plein écran (`entrypoint.sh`, `kiosk-session.sh`). |

## Invariants de performance de l'interface et des ressources

Afin de maintenir une interface fluide sur les machines kiosques peu puissantes (y compris Firefox ESR 115 en rendu logiciel sous Linux) :

1. **Mise en cache DOM indexée des cartes** - Les cartes de disques sont mises en cache par chemin de périphérique (`diskCardCache`). Les ticks WebSocket ne reconstruisent que les cartes dont l'empreinte d'état a changé, conservant les éléments `<img>` et `<svg>` dans le DOM sans aucune requête d'image redondante.
2. **Zéro mutation DOM sur tick WebSocket inactif** - Lorsqu'un message WebSocket contient des données inchangées et qu'aucune tâche n'est en cours, aucune écriture DOM n'est effectuée.
3. **Délégation d'événements** - Les grilles de cartes et les tableaux d'historique de plus de 500 lignes utilisent un écouteur délégué unique sur le conteneur plutôt que des écouteurs par ligne.
4. **Absence de flou d'arrière-plan plein écran** - Les superpositions modales n'utilisent pas `backdrop-filter: blur(...)` afin d'éviter un recalcul complet de l'écran à chaque frappe clavier.
5. **Cache Stale-While-Revalidate et SVG immuables** - `locales.json`, `tools.json` et les fragments HTML d'en-tête/barre latérale/pied de page s'affichent instantanément depuis `localStorage` tout en étant revalidés en arrière-plan (`ETag` / HTTP 304). Les SVG de disques par défaut sont servis avec `Cache-Control: public, max-age=31536000, immutable` depuis `/api/images/defaults/{kind}.svg`.
