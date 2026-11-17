---
title: Architecture système et flux de travail
sidebar_label: Architecture système et flux de travail
sidebar_position: 3
description: Isolation par conteneurs privilégiés, flux de travail du technicien, recherche unifiée du numéro de série et contrôles de sécurité dans Disk Hunter.
---

# Architecture système et flux de travail

Disk Hunter est structuré pour isoler les utilitaires de disque de niveau root, privilégiés et potentiellement destructeurs, de l'API web principale. En conteneurisant chaque tâche dans un worker éphémère, le serveur central reste stable et isolé des écritures brutes sur les périphériques.

:::note
Les conteneurs workers privilégiés s'exécutent avec un accès direct aux chemins matériels des disques (`/dev/*`), permettant à des commandes comme `smartctl`, `nwipe`, `hdparm`, `parted`, `fio` et `nvme-cli` d'interagir directement avec les registres du contrôleur sans exposer le processus backend FastAPI principal à des écritures destructrices sur les blocs.
:::

## Topologie des services

1. **Interface Frontend (`disk-hunter-ui`)** - Conteneur `nginx:alpine` servant l'interface statique en HTML, CSS et JavaScript vanilla. Il applique le filtrage d'adresses IP (`ALLOWED_IPS`), la compression gzip avec revalidation `ETag` sur les ressources statiques, et agit comme proxy inverse pour `/api/` et `/ws/` vers l'API principale.
2. **API Principale (`disk-hunter-api`)** - L'orchestrateur central en Python FastAPI. Il sonde les périphériques de bloc, gère les journaux d'historique JSON et les correspondances d'inventaire, génère les certificats d'effacement PDF, diffuse les journaux des conteneurs en direct via WebSockets, et démarre ou arrête les conteneurs workers Docker éphémères via des sous-processus asynchrones.
3. **SMART Provider (`disk-hunter-smart-provider`)** - Microservice FastAPI privilégié dédié qui exécute `smartctl` sur les périphériques `/dev/*` et met en cache les attributs pendant 30 secondes afin d'éviter les accès disque redondants.
4. **Conteneurs Workers Éphémères (`disk-hunter-*`)** - Conteneurs privilégiés à usage unique lancés à la demande pour chaque opération (`nwipe`, `hdparm`, `nvme-cli`, `parted`, `smartctl-test`, `speedtest-worker`, `power`) et supprimés dès que leur sortie est capturée.

## Flux de travail principal du technicien

1. **Connecter le disque cible** - Vérifier la détection du disque dans l'Aperçu des disques. Chaque disque affiche une image par produit ou par facteur de forme qui remplace le graphique par défaut, et les disques non partitionnés affichent un badge `NO TABLE` avec la mention `No partitions (unpartitioned / raw)`.
2. **Vérifier le badge de facteur de forme** - Un badge `U.2`, `U.3` (pour les modèles KIOXIA KCD), `NVMe`, `SSD`, `HDD` ou `USB` est affiché à côté du nom du disque lorsqu'il est reconnu.
3. **Évaluer la santé S.M.A.R.T.** - S'assurer que le disque est physiquement sain avant tout test de performance ou partitionnement. Les disques NVMe (y compris U.2 et U.3) affichent les attributs de santé analysés (Critical Warning, Available Spare, Percentage Used, Media and Data Integrity Errors, température, heures de fonctionnement) accompagnés d'un statut `OK`, `WARN` ou `FAIL`.
4. **Désinfecter (Sanitize)** - Exécuter un effacement sécurisé matériel (`nvme-cli` ou `hdparm`) ou un écrasement de blocs (`nwipe`) selon le type de support et les exigences de conformité.
5. **Exporter le certificat** - Télécharger le certificat d'effacement PDF visuel pour les pistes d'audit et la mise au rebut d'actifs.

## Recherche unifiée du numéro de série

Le résolveur de numéro de série de l'Aperçu constitue l'unique source de vérité de l'application : tous les autres modules (Broyage, S.M.A.R.T., Test de vitesse, Éditeur de partitions, Historique, exports CSV et Certificats PDF) lisent le numéro de série via la même fonction, de sorte que les disques NVMe et SAS/SATA n'affichent jamais `UNKNOWN` dans les onglets secondaires.

## Contrôles de sécurité et paramètres système

<details>
<summary><strong>Protéger le disque système (Root)</strong></summary>

L'activation de ce paramètre dans les Paramètres empêche le disque principal contenant le système d'exploitation hôte d'apparaître dans l'Éditeur de partitions, les diagnostics S.M.A.R.T., le Broyage de disque et le flashage ISO. Ce verrou protège l'OS hôte contre tout effacement ou repartitionnement accidentel.

</details>

<details>
<summary><strong>Verrouillage inter-modules des disques occupés</strong></summary>

Lorsqu'un disque exécute une opération dans n'importe quel module (effacement, autotest S.M.A.R.T., test de vitesse, partitionnement ou écriture ISO), Disk Hunter verrouille le périphérique sur l'ensemble des pages opérationnelles. Les cartes du disque affichent un badge `BUSY` et désactivent les actions concurrentes jusqu'à la fin de la tâche.

</details>

<details>
<summary><strong>Effacement de l'historique opérationnel</strong></summary>

Lorsque `ENABLE_DELETE_HISTORY=true`, les techniciens peuvent effacer les journaux d'historique des actions (historique de broyage, rapports S.M.A.R.T., enregistrements speedtest, historique de partitionnement ou fichiers ISO téléchargés) directement depuis le panneau des Paramètres. Définir `ENABLE_DELETE_HISTORY=false` dans `.env` verrouille tous les historiques d'audit en mode lecture/ajout uniquement.

</details>

<details>
<summary><strong>Colonnes d'historique unifiées et fenêtre de détail</strong></summary>

Les vues Audit Logs & PDFs, Test History et Action History partagent toutes le même ordre de colonnes :

`Timestamp | User IP | Drive / Target | Status | Event / Details`

Cliquer sur n'importe quelle ligne ouvre une fenêtre modale de détail qui affiche la commande exacte exécutée par le backend (les entrées enregistrées avant ce suivi affichent `Command not recorded`) ainsi que la sortie standard ou les journaux d'erreurs, avec un bouton **Copier** pour placer le contenu dans le presse-papiers.

</details>

<details>
<summary><strong>Barre latérale sensible au module</strong></summary>

Chaque entrée d'historique de module dans la barre latérale n'apparaît que lorsque ce module — ou sa page d'historique — est ouvert, ce qui maintient la navigation centrée sur l'outil activement utilisé par le technicien.

</details>

<details>
<summary><strong>Navigateur de fichiers de gestion des données</strong></summary>

Le module Gestion des données fournit un explorateur de fichiers sécurisé en lecture seule avec indicateur d'utilisation de la partition racine, calcul à la demande de la taille des dossiers (mis en cache pendant 60 secondes) et en-tête de tableau opaque lors du défilement.

</details>

<details>
<summary><strong>Performances et mises à jour WebSocket en direct</strong></summary>

Les cartes de disques sont mises en cache par chemin de périphérique dans le DOM afin que les ticks WebSocket ne mettent à jour que les textes modifiés sans reconstruire les cartes inchangées ni recharger les images. La page Température s'actualise toutes les 5 secondes et se met automatiquement en pause lorsque l'onglet du navigateur est masqué. Le **Potato Mode** désactive les effets visuels coûteux sur les hôtes peu puissants.

</details>

<details>
<summary><strong>Page Réseau (lecture seule par défaut)</strong></summary>

La page Réseau est accessible depuis l'adresse IP affichée dans la barre supérieure et directement via l'URL `network.html`. Elle affiche les interfaces, la passerelle par défaut et les serveurs DNS, valide un plan statique, DHCP ou VLAN 802.1Q et présente les commandes exactes ainsi que le YAML netplan résultant. L'application des modifications sur l'hôte est désactivée par défaut et nécessite `NETWORK_APPLY_ENABLED=true` dans le `.env` du backend.

</details>

<details>
<summary><strong>Historique des actions ISO</strong></summary>

Chaque téléchargement et chaque écriture d'ISO sont enregistrés dans l'Historique des actions ISO (`iso_history.json`) avec l'adresse IP de l'utilisateur initiateur, l'URL source, la taille du fichier, le périphérique cible et le statut. Les noms de fichiers téléchargés qui ne se terminent pas par `.iso` ou `.img` se voient automatiquement ajouter l'extension `.iso`.

</details>

<details>
<summary><strong>Marche/arrêt de l'hôte</strong></summary>

Le tableau de bord porte les boutons **Arrêter l'hôte** et **Redémarrer l'hôte** à côté de **Rescanner le matériel**. Chaque action demande une confirmation, est refusée pendant que des opérations sur les disques sont en cours (un effacement n'est jamais interrompu) et est exécutée par un conteneur worker privilégié `--pid=host` (`disk-hunter-power`) qui demande à `systemd` de l'hôte un `poweroff`/`reboot` propre via `nsenter` — les conteneurs en cours sont d'abord arrêtés correctement. Chaque client connecté est notifié par WebSocket ; après un redémarrage, la page se reconnecte automatiquement (`ws-open`) et les boutons se débloquent à nouveau. Les boutons peuvent être masqués entièrement avec `POWER_ACTIONS_ENABLED=false` dans le `.env` du backend (`true` par défaut).

</details>
