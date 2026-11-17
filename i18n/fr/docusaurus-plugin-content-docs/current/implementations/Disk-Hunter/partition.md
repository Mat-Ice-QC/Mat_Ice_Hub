---
title: Éditeur de partitions et systèmes de fichiers
sidebar_label: Éditeur de partitions et systèmes de fichiers
sidebar_position: 8
description: Partitionnement des périphériques de bloc avec tables GPT et MBR, création de volumes, opérations en lot et formatage via parted.
---

# Éditeur de partitions et systèmes de fichiers

L'Éditeur de partitions visuel permet de partitionner les périphériques de bloc à l'aide de tables MBR ou GPT, de créer et supprimer des volumes et de les formater avec des systèmes de fichiers standards via `parted` dans des conteneurs isolés `disk-hunter-parted`.

## Systèmes de fichiers principaux

| Système de fichiers | Compatibilité | Cas d'utilisation |
| --- | --- | --- |
| **ext4** | Natif Linux | Système de fichiers Linux standard avec journalisation. Optimisé pour les serveurs de stockage et postes Linux. |
| **NTFS** | Natif Windows, Lecture/Écriture Linux | Système de fichiers principal pour les installations Windows modernes et les disques externes (`> 4 Go` par fichier). |
| **FAT32** | Compatibilité universelle | Norme universelle pour les clés USB et partitions EFI. Limité à une taille maximale de `4 Go` par fichier. |

## Type de table de partition (Label)

<details>
<summary><strong>GPT (GUID Partition Table)</strong></summary>

La norme moderne de partitionnement. Requise pour les disques de plus de `2 To`, native pour l'amorçage UEFI, dotée d'en-têtes CRC redondants et prenant en charge jusqu'à 128 partitions primaires par défaut.

</details>

<details>
<summary><strong>MSDOS (Master Boot Record / MBR)</strong></summary>

Le format historique de table de partition BIOS. Limité à une capacité maximale de `2 To` et à 4 partitions primaires (ou 3 partitions primaires plus une partition étendue).

</details>

<details>
<summary><strong>Autres architectures (AIX, BSD, Mac, Loop, Sun)</strong></summary>

Prend en charge les styles de tables spécifiques via `parted mklabel` pour les systèmes cibles non standards (systèmes AIX, slices BSD, Apple Partition Map `mac`, mappage de boucle `loop` ou étiquettes Sun SPARC).

</details>

## Formats de système de fichiers pris en charge

<details>
<summary><strong>ext4 / ext3 / ext2</strong></summary>

La famille de systèmes de fichiers étendus par défaut sous Linux. `ext4` offre la journalisation et la gestion par extents ; `ext3` assure la compatibilité journalisée historique ; `ext2` fonctionne sans journalisation afin de réduire les écritures sur les supports flash simples.

</details>

<details>
<summary><strong>ntfs</strong></summary>

Microsoft Windows NTFS (`mkfs.ntfs`). Prend en charge les fichiers de plus de `4 Go`, la compression et les listes de contrôle d'accès, tout en étant pleinement opérationnel en lecture/écriture sous Linux.

</details>

<details>
<summary><strong>fat32 / fat16</strong></summary>

Systèmes de fichiers DOS FAT classiques (`mkfs.vfat`). Compatibles en lecture/écriture sous Windows, macOS, Linux et les systèmes embarqués. `FAT32` limite chaque fichier individuel à une taille maximale de `4 Go`.

</details>

<details>
<summary><strong>btrfs / xfs</strong></summary>

Systèmes de fichiers Linux de nouvelle génération. `btrfs` offre des instantanés (snapshots) par copie sur écriture (CoW) et des sous-volumes ; `xfs` excelle dans les opérations d'E/S parallèles hautes performances et les grands volumes de stockage.

</details>

## Barre visuelle et historique des opérations

- **Barre de partitions interactive** - Affiche proportionnellement les partitions, les types de systèmes de fichiers, les points de montage et l'espace non alloué, avec une file d'attente d'opérations en lot avant exécution. Les disques bruts sans table de partition affichent le badge `NO TABLE`.
- **Historique de partitionnement** - Chaque création de table, ajout ou suppression de partition et formatage est enregistré dans `partition_history.json` (`partition_history.html`) avec l'adresse IP du client, le disque cible, la commande exacte exécutée et les journaux de sortie.
