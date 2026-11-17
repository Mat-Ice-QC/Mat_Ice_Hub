---
title: Diagnostics de santé S.M.A.R.T.
sidebar_label: Diagnostics de santé S.M.A.R.T.
sidebar_position: 6
description: Autotests S.M.A.R.T. courts et étendus, attributs de santé NVMe/U.2/U.3 analysés, tableaux bruts et cache global de 30 secondes.
---

# Diagnostics de santé S.M.A.R.T.

La technologie S.M.A.R.T. (Self-Monitoring, Analysis, and Reporting Technology) fournit des indicateurs préventifs de défaillance pour les disques mécaniques et les supports flash. Disk Hunter interroge `smartctl` via le microservice dédié `disk-hunter-smart-provider` et lance des conteneurs `disk-hunter-smartctl-test` pour exécuter les autotests en arrière-plan.

## Options de diagnostic et de télémétrie

<details>
<summary><strong>Test automatique court (~2 minutes)</strong></summary>

Un contrôle rapide et non destructif de l'état matériel (`smartctl -t short`). Évalue les composants électriques principaux, la logique du contrôleur, les mécanismes de positionnement des têtes (sur HDD) et la mémoire tampon de lecture/écriture, ainsi qu'un échantillon de secteurs.

</details>

<details>
<summary><strong>Test automatique étendu (Heures)</strong></summary>

Un balayage complet et non destructif de l'intégrité de la surface (`smartctl -t long`) qui lit chaque secteur adressable du disque afin de détecter les erreurs de lecture, les secteurs instables et les secteurs en attente de réallocation. Recommandé lors de la qualification de disques neufs ou suspects.

</details>

<details>
<summary><strong>Journaux d'attributs bruts et modale du journal d'autotests</strong></summary>

Un clic sur **Détails** sur un disque SATA/SAS charge le tableau complet des attributs S.M.A.R.T. bruts (ID, nom de l'attribut, valeurs courante/pire/seuil et compteurs bruts tels que Reallocated Sector Count, Current Pending Sector Count, Power-On Hours et Wear Leveling Count). Les techniciens peuvent également ouvrir la modale **Self-Test Log** pour consulter l'historique des autotests stocké directement dans le micrologiciel du disque.

</details>

<details>
<summary><strong>Attributs de santé NVMe, U.2 et U.3 analysés</strong></summary>

Les disques NVMe — y compris les facteurs de forme d'entreprise U.2 et U.3 — exposent un journal de santé structuré du contrôleur plutôt que des identifiants d'attributs ATA classiques. Disk Hunter analyse et présente ce journal sur l'onglet S.M.A.R.T. :

- Critical Warning (bits d'alerte critique)
- Température (degrés Celsius)
- Available Spare et Available Spare Threshold (réserve disponible et seuil)
- Percentage Used (indicateur d'usure d'endurance)
- Data Units Read et Data Units Written
- Commandes de lecture et d'écriture hôte
- Controller Busy Time
- Cycles d'alimentation et heures de fonctionnement (Power-On Hours)
- Arrêts non sécurisés (Unsafe Shutdowns)
- Media and Data Integrity Errors (erreurs d'intégrité des données)
- Error Information Log Entries

Chaque attribut est annoté d'un statut `OK`, `WARN` ou `FAIL` dérivé des limites publiées par la spécification et le fabricant.

</details>

<details>
<summary><strong>Historique des actions S.M.A.R.T.</strong></summary>

Le sous-menu d'historique consigne tous les autotests lancés selon les colonnes unifiées `Timestamp | User IP | Drive / Target | Status | Event / Details`. Cliquer sur une ligne ouvre la fenêtre modale de détail contenant la commande `smartctl` exacte exécutée, le numéro de série, l'ID d'inventaire associé et les journaux de sortie avec un bouton **Copier**.

</details>

:::note
Pour éviter toute activité disque inutile et empêcher le réveil constant des disques mécaniques, les attributs S.M.A.R.T. sont mis en cache pendant **30 secondes** au niveau global dans `disk-hunter-smart-provider`. Les rafraîchissements manuels de la page n'entraînent pas de nouvelles requêtes physiques tant que la fenêtre de cache n'a pas expiré.
:::
