---
title: Tests de performance de vitesse (fio)
sidebar_label: Tests de performance de vitesse (fio)
sidebar_position: 7
description: Évaluation des performances séquentielles de lecture, d'écriture et bidirectionnelles avec fio dans des conteneurs workers isolés.
---

# Tests de performance de vitesse (fio)

Disk Hunter exécute des tests de débit d'E/S haute performance à l'aide de `fio` (Flexible I/O Tester) dans des conteneurs isolés `disk-hunter-speedtest-worker`, afin de profiler les taux de transfert séquentiels en lecture et en écriture sur les partitions montées.

## Options de type de test de vitesse

<details>
<summary><strong>Lecture uniquement (Read Only)</strong></summary>

Mesure le débit de lecture séquentielle de la partition sélectionnée. Il s'agit d'une opération de lecture sûre qui ne modifie pas les fichiers existants sur la partition.

</details>

<details>
<summary><strong>Écriture uniquement (Write Only)</strong></summary>

Mesure le débit d'écriture séquentielle en générant un fichier temporaire de test (`.fio_test`) à l'intérieur du système de fichiers monté. Ce fichier temporaire est automatiquement supprimé à la fin ou à l'arrêt du test.

</details>

<details>
<summary><strong>Lecture et Écriture (Read &amp; Write)</strong></summary>

Exécute des opérations séquentielles de lecture et d'écriture pour dresser le profil des capacités bidirectionnelles et du débit soutenu du périphérique.

</details>

## Options de taille de bloc de test

<details>
<summary><strong>Taille de bloc de 1 Go</strong></summary>

Une taille de test légère et rapide, adaptée à un contrôle rapide des performances sur les clés USB, cartes SD et disques durs standards.

</details>

<details>
<summary><strong>Taille de bloc de 10 Go</strong></summary>

Une taille de test intermédiaire permettant de dépasser les petits caches DRAM/SLC du contrôleur afin de mesurer le débit soutenu. Requiert au moins **11 Go** d'espace libre sur la partition cible.

</details>

<details>
<summary><strong>Taille de bloc de 100 Go</strong></summary>

Une taille de test exhaustive de niveau entreprise, recommandée pour les disques SSD SATA/SAS et NVMe hautes performances afin de mesurer le débit soutenu sous une charge d'E/S prolongée. Requiert une partition d'au moins **101 Go**.

</details>

<details>
<summary><strong>Tous (1 Go, 10 Go, 100 Go)</strong></summary>

Exécute une suite séquentielle testant toutes les tailles de blocs l'une après l'autre (`1G` -> `10G` -> `100G`). Le système ignore automatiquement les tailles de blocs supérieures si la partition cible ne dispose pas de l'espace minimum requis (`11 Go` pour `10G` ; `101 Go` pour `100G`).

</details>

:::important
Les fichiers de test de performance (`.fio_test`) sont alloués dynamiquement dans le point de montage de la partition du disque cible, empêchant les écritures directes sur les périphériques de bloc bruts (`/dev/sdX`) qui détruiraient la table de partition ou le système de fichiers.
:::
