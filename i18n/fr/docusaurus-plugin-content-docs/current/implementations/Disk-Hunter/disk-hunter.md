---
sidebar_label: Disk Hunter
pagination_next: null
pagination_prev: null
---

# Disk Hunter

Un utilitaire web tout-en-un conçu pour tester, gérer, effacer et formater des disques de stockage physiques.

**Dépôt :** [Mat-Ice-QC/Disk-Hunter](https://github.com/Mat-Ice-QC/Disk-Hunter)

## Aperçu

Disk Hunter propose une interface de tableau de bord moderne au design glassmorphique pour les opérations d'administration de disques. Il s'appuie sur un backend Python FastAPI haute performance, isolant les commandes privilégiées de niveau root dans des conteneurs Docker éphémères afin de protéger l'intégrité du système hôte.

## Fonctionnalités principales

- **Tableau de bord interactif** - Visualisez instantanément les disques connectés, les structures de partitions, l'état de santé des périphériques et les spécifications matérielles brutes dans une grille unifiée.
- **Effacement sécurisé (Shredder)** - Effacez les données des disques avec des méthodes d'effacement conformes aux standards industriels (via `nwipe` et `hdparm`). Diffuse la sortie du terminal en temps réel dans le navigateur et génère automatiquement un certificat d'effacement en PDF à la fin.
- **Benchmarks de vitesse** - Exécutez des tests de vitesse de lecture/écriture séquentiels (via des benchmarks `fio`) directement depuis l'interface.
- **Diagnostics S.M.A.R.T.** - Lancez et surveillez des autotests courts/étendus, consultez les métriques de progression en temps réel et affichez des tableaux d'attributs de santé structurés.
- **Éditeur de partitions visuel** - Créez, supprimez et formatez des partitions (ext3, ext4, fat32, ntfs) avec une interface intuitive de type cliquer-glisser basée sur `parted`.
- **Flashage d'images OS** - Écrivez en toute sécurité des images `.iso` ou `.img` téléchargées directement sur les périphériques cibles.

## Architecture du système

Disk Hunter est construit avec une architecture de microservices découplée pour garantir l'isolation des workers et la sécurité de la concurrence.

| Composant | Rôle | Communique avec |
|---|---|---|
| **Interface frontend** (`nginx:alpine`) | Sert l'interface web glassmorphique | Interroge le statut et invoque l'API principale |
| **API principale** (`Python FastAPI`) | Hub d'orchestration | Démarre/surveille les conteneurs workers éphémères ; délègue les requêtes SMART |
| **SMART Provider** (microservice `Python FastAPI`) | Exécute `smartctl` en tant que proxy non-root | Exécute les commandes `smartctl` privilégiées contre `/dev/*` |
| **Conteneurs workers éphémères** | Environnement d'exécution sandboxé | Exécute les utilitaires privilégiés : `nvme-cli`, `nwipe`, `hdparm`, `parted`, `dd`, `fio` |

L'application est composée de trois composants principaux :

1. **Frontend (`disk-hunter-ui`)** - Une interface responsive au design glassmorphique, construite en HTML, CSS et JavaScript vanilla, servie via Nginx.
2. **API principale (`disk-hunter-api`)** - Le hub d'orchestration. Démarre, surveille et termine les conteneurs Docker workers éphémères via des appels de sous-processus asynchrones.
3. **SMART Provider (`disk-hunter-smart-provider`)** - Un microservice FastAPI léger fonctionnant en mode privilégié, responsable de l'exécution des commandes `smartctl`.

## Exigences

- Docker (requis pour exécuter les conteneurs workers éphémères pour les opérations de disques privilégiées)
- Un hôte Linux avec accès physique direct aux disques cibles
- Un navigateur moderne pour accéder au tableau de bord

## Remarques

- Les opérations de disques privilégiées (effacement, mises à jour de firmware, etc.) sont sandboxées dans des conteneurs Docker éphémères, protégeant ainsi le système hôte.
- Pour les déploiements accessibles en réseau, restreignez l'accès aux clients de confiance à l'aide de règles de pare-feu ou d'un VPN, car l'interface fournit un accès bas niveau aux disques.
- La fonctionnalité d'effacement sécurisé génère automatiquement un certificat d'effacement en PDF à la fin, ce qui peut être utile pour la conformité ou les enregistrements de mise au rebut d'actifs.
