---
title: Effacement sécurisé NVMe natif
sidebar_label: Effacement sécurisé NVMe natif
sidebar_position: 5
description: Désinfection matérielle des disques NVMe via nvme-cli avec formatage des données utilisateur (SES=1) et formatage cryptographique (SES=2).
---

# Effacement sécurisé NVMe natif

Les disques SSD NVMe (y compris aux formats M.2, U.2, U.3 et cartes PCIe) prennent en charge l'effacement sécurisé au niveau matériel, exécuté directement par le contrôleur interne du disque via `nvme-cli`. Ces méthodes matérielles sont considérablement plus rapides que les méthodes d'écrasement logiciel bloc par bloc tout en évitant une usure inutile des cellules NAND.

## Options d'effacement sécurisé

<details>
<summary><strong>Formatage des données utilisateur (SES=1)</strong></summary>

Commande au contrôleur SSD NVMe interne (`nvme format --ses=1`) d'effacer physiquement tous les blocs de données utilisateur sur la mémoire flash NAND. Il s'agit d'une opération destructive qui réinitialise toutes les cellules accessibles à l'utilisateur et prend généralement entre 1 et 2 minutes selon la capacité du disque.

</details>

<details>
<summary><strong>Formatage cryptographique (SES=2)</strong></summary>

Commande au contrôleur SSD NVMe (`nvme format --ses=2`) de détruire la clé de chiffrement interne (Media Encryption Key) utilisée pour chiffrer les blocs utilisateur au repos et d'en générer une nouvelle. Comme la clé précédente est définitivement effacée, toutes les données existantes deviennent instantanément irrécupérables. L'opération se termine en quelques secondes.

</details>

<details>
<summary><strong>Compatibilité du contrôleur et repli automatique</strong></summary>

Tous les contrôleurs NVMe ne prennent pas en charge le formatage cryptographique (`SES=2`) ni parfois le formatage des données utilisateur (`SES=1`). Le worker NVMe de Disk Hunter (`workers/nvme/run_wipe.sh`) vérifie les capacités du contrôleur et tente un repli du mode cryptographique (`SES=2`) vers le mode données utilisateur (`SES=1`) lorsque cela est pris en charge. Si l'effacement matériel est refusé par le contrôleur, le backend renvoie un avertissement et invite le technicien à utiliser l'écrasement de blocs standard (`nwipe` DoD/Zéros/PRNG) dans l'onglet Broyage de disque.

</details>

:::important
Pour exécuter des commandes d'administration et de formatage NVMe à l'intérieur des conteneurs Docker isolés, le système monte à la fois le périphérique caractère du contrôleur principal (par exemple `/dev/nvme0`) et le périphérique de bloc de l'espace de noms (par exemple `/dev/nvme0n1`) afin de transmettre les séquences d'appels `ioctl` appropriées.
:::
