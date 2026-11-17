---
title: Normes de broyage de disque
sidebar_label: Normes de broyage de disque
sidebar_position: 4
description: Effacement de disques par écrasement de blocs avec nwipe, ATA Secure Erase via hdparm, gestion des disques gelés, vérification et certificats PDF.
---

# Normes de broyage de disque

Pour les disques durs (HDD) et SSD SATA/SAS ainsi que les périphériques de bloc standards, Disk Hunter exécute `nwipe` ou `hdparm` dans des conteneurs workers privilégiés isolés. Les techniciens peuvent choisir entre l'écrasement multi-passes (**Broyage / Shredding**) et l'effacement matériel (**ATA Secure Erase**).

:::warning
Une fois que le broyage du disque ou l'effacement sécurisé commence, toutes les tables de partitionnement, les secteurs de démarrage et les blocs de données sont supprimés définitivement. Vérifiez systématiquement le numéro de série et l'ID d'inventaire du périphérique avant l'exécution.
:::

## Normes d'écrasement de blocs (`nwipe`)

| Norme d'effacement | Passes | Description |
| --- | --- | --- |
| **Remplir de zéros (Fill Zeros)** | 1 | Méthode la plus rapide. Écrit `0x00` sur tous les secteurs adressables. Idéal pour les disques non confidentiels ou la préparation avant réinstallation. |
| **Flux PRNG (PRNG Stream)** | 1 | Remplit chaque secteur avec un flux continu d'octets pseudo-aléatoires en une seule passe. |
| **DoD Court (5220.22-M)** | 3 | Conforme à la norme DoD 5220.22-M Court : écrit des zéros (`0x00`), des uns (`0xFF`), puis des octets pseudo-aléatoires avec vérification. |
| **DoD Complet (5220.22-M)** | 7 | Conforme à la norme DoD 5220.22-M Complet : cycle exhaustif en sept passes alternant motifs fixes, valeurs complémentaires et passes aléatoires. |
| **Gutmann** | 35 | Séquence de désinfection en 35 passes combinant flux aléatoires et motifs d'encodage magnétique spécifiques pour les anciens disques durs magnétiques. |

### Détail des algorithmes d'effacement

<details>
<summary><strong>Remplir de zéros (1 Passe)</strong></summary>

Écrit `0x00` séquentiellement sur tous les secteurs d'adresse du disque. Offre le temps d'exécution le plus rapide pour le nettoyage de données non sensibles ou la remise à zéro des tables de partitions.

</details>

<details>
<summary><strong>Flux PRNG (1 Passe aléatoire)</strong></summary>

Une norme de désinfection en une seule passe qui remplit chaque secteur d'adresse avec un flux continu d'octets pseudo-aléatoires. Plus rapide que les algorithmes multi-passes tout en empêchant efficacement la récupération logicielle.

</details>

<details>
<summary><strong>DoD Court 5220.22-M (3 Passes)</strong></summary>

Une norme de désinfection en trois phases : écrit des zéros, des uns, puis un flux de caractères pseudo-aléatoires, avec vérification pour garantir la réussite de l'écriture. Recommandé pour la réutilisation commerciale ou le déclassement standard.

</details>

<details>
<summary><strong>DoD Complet 5220.22-M (7 Passes)</strong></summary>

Un cycle d'écriture exhaustif en sept passes qui alterne à plusieurs reprises des motifs de caractères et leurs compléments avant de se terminer par une passe aléatoire. Utilisé pour répondre aux critères de conformité de haute sécurité.

</details>

<details>
<summary><strong>Gutmann (35 Passes)</strong></summary>

La séquence classique de désinfection Gutmann. Écrit 35 passes distinctes en utilisant des modèles d'encodage magnétique spécifiques et pseudo-aléatoires, initialement conçus pour les anciens disques durs à plateaux magnétiques (MFM/RLL).

</details>

## Paramètres de vérification

<details>
<summary><strong>Sans vérification (No Verification)</strong></summary>

Ignore la relecture des secteurs du disque après l'écriture. Maximise le débit de désinfection et réduit le temps d'exécution total d'environ la moitié.

</details>

<details>
<summary><strong>Vérifier uniquement la dernière passe (Verify Last Pass Only)</strong></summary>

Relit et valide tous les secteurs du disque après le balayage final. Offre un compromis équilibré entre vérification d'intégrité et temps d'exécution.

</details>

<details>
<summary><strong>Vérifier toutes les passes (Verify All Passes)</strong></summary>

Relit et valide l'état des secteurs après chaque passe d'écriture. Garantit une vérification maximale de l'intégrité des blocs mais augmente sensiblement la durée totale de l'opération.

</details>

## ATA Secure Erase et gestion des disques gelés (`hdparm`)

Pour les disques SATA prenant en charge le jeu de commandes ATA Security, Disk Hunter dispose d'un worker `hdparm` qui transmet directement au micrologiciel du disque les commandes matérielles `SECURITY ERASE UNIT` (ou `ENHANCED SECURITY ERASE`).

- **Détection des capacités** - Avant le lancement, le backend analyse la sortie de `hdparm -I` pour vérifier la prise en charge d'ATA Security et détecter si le disque est verrouillé (`locked`) ou gelé (`frozen`) par le BIOS/UEFI de l'hôte.
- **Dégel multi-méthodes** - Lorsqu'un disque SATA est signalé comme `frozen`, le worker tente des réinitialisations de lien/contrôleur non destructives afin de sortir le disque de l'état gelé sans redémarrer l'hôte.
- **Repli NIST SP 800-88 Clear (`FROZEN_FALLBACK_WIPE`)** - Lorsque `FROZEN_FALLBACK_WIPE=1` (valeur par défaut dans `.env`), si un disque reste gelé après les tentatives de dégel, Disk Hunter bascule automatiquement vers un écrasement complet par zéros conforme à la norme NIST SP 800-88 Clear afin de ne pas bloquer le traitement d'un lot de disques. Définir `FROZEN_FALLBACK_WIPE=0` provoque un échec immédiat sur les disques gelés.

## Sélection, métadonnées en lot et piste d'audit

<details>
<summary><strong>Sélection conservée lors du changement de mode</strong></summary>

Les disques sélectionnés dans la liste de broyage restent sélectionnés lorsque vous basculez la page entre **Broyage** (`nwipe`) et **Effacement sécurisé** (`hdparm` / `nvme-cli`), ce qui évite de devoir re-sélectionner les cibles lors de la comparaison des deux flux.

</details>

<details>
<summary><strong>Modale de confirmation et outils d'attribution en masse</strong></summary>

La modale de confirmation de destruction des données conserve les champs **Datacenter**, **Nom du serveur** et **ID d'inventaire** lorsque vous basculez entre les vues **Liste détaillée** et **Liste simple**. Des contrôles en masse permettent d'appliquer les valeurs Datacenter et Nom du serveur soit aux disques sélectionnés, soit à tous les disques, et de sélectionner les disques par serveur.

</details>

<details>
<summary><strong>IP de l'utilisateur initiateur et journalisation des commandes</strong></summary>

Le backend enregistre l'adresse IP de l'utilisateur initiateur au démarrage et à l'arrêt de chaque travail de broyage. La ligne d'historique (`Timestamp | User IP | Drive / Target | Status | Event / Details`) ouvre une fenêtre modale affichant la commande exacte exécutée ainsi que les journaux de sortie. En cas d'échec de `nwipe`, le journal d'erreur est conservé et le disque est signalé comme problématique dans l'interface.

</details>

<details>
<summary><strong>Paramètre Générer un certificat (côté serveur)</strong></summary>

Le commutateur **Generate Cert** (stocké côté serveur dans `data/app_settings.json`) produit automatiquement un certificat d'effacement PDF pour chaque travail terminé avec succès, incluant l'identité de l'organisation (`data/branding.json`), le numéro de série du disque, l'ID d'inventaire associé (`data/inventory.json`), l'algorithme utilisé, le statut de vérification et les horodatages.

</details>
