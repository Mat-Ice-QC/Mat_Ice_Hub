---
title: Installation et configuration
sidebar_label: Installation et configuration
sidebar_position: 2
description: Prérequis, démarrage rapide Docker Compose, variables d'environnement, permissions, paramètres côté serveur, mode kiosque et sécurité de la chaîne d'approvisionnement.
---

# Installation et configuration

## Prérequis

- Un hôte Linux disposant d'un accès physique direct aux disques de stockage cibles (`/dev`, `/sys` et `/run/udev` montés en bind-mount dans les conteneurs).
- Docker et Docker Compose installés, avec les privilèges `root` ou `sudo` nécessaires pour lancer des conteneurs workers privilégiés.
- Un navigateur web moderne pour accéder au tableau de bord (ou le profil kiosque Firefox ESR intégré pour les appliances sans écran de bureau).

## Démarrage rapide

Clonez le dépôt, copiez `.env.example` vers `.env`, puis démarrez la pile avec Docker Compose :

```bash
git clone https://github.com/Mat-Ice-QC/Disk-Hunter.git Disk-Hunter
cd Disk-Hunter
cp .env.example .env       # modifier la configuration si nécessaire
docker compose up -d --build
```

Pour activer le mode kiosque optionnel (Firefox ESR en plein écran sur le terminal `tty2` de l'hôte) :

```bash
docker compose --profile kiosk up -d --build
```

Une fois la pile démarrée, l'interface web est accessible à l'adresse `http://localhost` (ou via l'adresse IP de l'hôte sur le port `80`, ou `443` si `HTTPS_CERT_PATH` et `HTTPS_KEY_PATH` sont configurés).

:::important
Le script `nginx-entrypoint.sh` à la racine du dépôt génère la configuration Nginx `default.conf` au démarrage du conteneur et **doit** posséder les permissions d'exécution (`chmod 755 nginx-entrypoint.sh`). Si le bit d'exécution est absent (par exemple après l'extraction d'une archive tar), Nginx conserve sa configuration par défaut et les routes `/api` et `/ws` renvoient une erreur HTTP 404.
:::

## Configuration par variables d'environnement (`.env`)

Toute la configuration d'exécution s'effectue dans le fichier `.env` (copié depuis `.env.example`).

| Variable | Description | Valeur par défaut |
| --- | --- | --- |
| `ALLOWED_IPS` | Liste d'adresses IP ou de sous-réseaux CIDR clients autorisés (séparés par des virgules), ou `*` pour tout autoriser | `*` |
| `ENABLE_SHREDDER` | Activer le broyage et l'effacement sécurisé de disques (`nwipe`, `hdparm`, `nvme-cli`) | `true` |
| `ENABLE_SPEEDTEST` | Activer les tests de vitesse `fio` | `true` |
| `ENABLE_ISOWRITER` | Activer le téléchargement d'images OS (`.iso` / `.img`) et le flashage de disques | `true` |
| `ENABLE_SMARTCTL` | Activer les requêtes de santé et autotests S.M.A.R.T. | `true` |
| `ENABLE_DATA_MANAGEMENT` | Activer l'explorateur de fichiers et la gestion des journaux dans Gestion des données | `true` |
| `ENABLE_NETWORK_SHARE` | Activer le module de partage réseau dans l'interface | `true` |
| `ENABLE_DELETE_HISTORY` | Autoriser la suppression des journaux et de l'historique ; `false` rend les pistes d'audit strictement additives (append-only) | `true` |
| `DATA_DIR` | Chemin sur l'hôte pour les journaux persistants, certificats PDF, fichiers ISO et paramètres JSON | `./data` |
| `FROZEN_FALLBACK_WIPE` | Comportement ATA Secure Erase sur disque gelé : `1` bascule vers un écrasement par zéros (NIST SP 800-88 Clear) ; `0` échoue immédiatement | `1` |
| `KIOSK_URL` | URL ouverte par le conteneur kiosque Firefox ESR | `http://localhost` |
| `HTTPS_CERT_PATH` / `HTTPS_KEY_PATH` | Chemins optionnels sur l'hôte vers le certificat TLS et la clé privée pour activer HTTPS sur le port 443 | non défini |
| `NETWORK_APPLY_ENABLED` | Autoriser la page Réseau (`network.html`) à appliquer les changements sur l'hôte (`true` / `false`) ; à `false`, seule la validation est active | `false` |
| `POWER_ACTIONS_ENABLED` | Afficher les boutons **Arrêter l'hôte** et **Redémarrer l'hôte** sur le tableau de bord (`true` / `false`) ; les actions sont toujours refusées pendant les opérations sur les disques | `true` |
| `DATA_UID` / `DATA_GID` | Identifiants numériques optionnels d'utilisateur et de groupe utilisés par `backend/docker-entrypoint.sh` pour exécuter `chown` sur le dossier de données au premier démarrage | non défini |

## Permissions au premier démarrage

Au démarrage du conteneur API, `backend/docker-entrypoint.sh` crée l'arborescence de données et les fichiers JSON d'état sous `DATA_DIR` avec des permissions restreintes :

- Les répertoires sont créés en mode `755` (`rwxr-xr-x`).
- Les fichiers JSON sont créés en mode `644` (`rw-r--r--`).
- Aucune permission d'écriture de groupe ou universelle (world-writable) n'est attribuée.
- Les éventuels avertissements de permissions sont journalisés sans interrompre le démarrage du conteneur.
- Si `DATA_UID` et `DATA_GID` sont définis dans `.env`, le répertoire de données est attribué (`chown`) à ces identifiants.

## Paramètres persistants côté serveur

Les préférences de l'application et les métadonnées de l'organisation sont enregistrées sur la machine Disk Hunter sous `DATA_DIR`, ce qui garantit un état identique pour tous les navigateurs connectés :

- **`data/branding.json`** - Nom de l'entreprise, adresse, numéro de téléphone, logo personnalisé et étiquettes par défaut (Datacenter, Serveur) figurant sur les certificats d'effacement PDF.
- **`data/app_settings.json`** - Paramètres globaux côté serveur, notamment :
  - **Protéger le disque système** (`protect_root`) - Masque le disque principal du système d'exploitation hôte dans l'Éditeur de partitions, les diagnostics S.M.A.R.T., le Broyage de disque et le module ISO.
  - **Générer un certificat** (`generate_pdf`) - Option globale déterminant si chaque travail d'effacement terminé produit automatiquement un certificat d'effacement PDF, accompagnée d'un historique horodaté des modifications de ce paramètre.
  - **Sélection et seuils des capteurs de température** - Liste des capteurs suivis et seuils d'alerte/critiques en degrés Celsius.
- **`data/inventory.json`** - Associe les numéros de série matériels (`S/N`) aux identifiants d'inventaire internes via `/api/inventory`. Les ID d'inventaire associés apparaissent automatiquement sur les cartes de disques, dans les tableaux d'historique, les exports CSV et les certificats PDF.
- **Heure système et synchronisation NTP** - La page Paramètres permet de consulter et de régler l'horloge système de l'hôte ou de déclencher une synchronisation NTP immédiate (`ntpdate`).

## Mode Kiosque

Pour les hôtes Linux autonomes ou isolés du réseau (air-gapped) dépourvus d'environnement de bureau, le conteneur optionnel `disk-hunter-firefox-kiosk` (activé via `--profile kiosk`) démarre un serveur Xorg autonome sur le terminal virtuel **`tty2`** de l'hôte et lance Firefox ESR en mode kiosque plein écran sur `KIOSK_URL`.

- Basculer vers l'affichage kiosque sur la machine hôte : `Ctrl+Alt+F2`.
- Revenir à la console texte principale (`tty1`) : `Ctrl+Alt+F1`.

## Sécurité de la chaîne d'approvisionnement (Supply Chain)

Pour garantir des builds reproductibles et prévenir toute compromission en amont :

1. **Épinglage des images de base par condensat SHA256** - Toutes les instructions `FROM` des Dockerfiles (backend, frontend, `smart-provider` et workers) utilisent un condensat SHA256 immuable défini dans `.env.example` et transmis en argument de build Docker.
2. **Verrouillage des versions de paquets** - Les paquets Alpine `apk` ainsi que les dépendances Python `pip` (`backend/requirements.txt` et `smart-provider/requirements.txt`) sont verrouillés sur des versions explicites.
