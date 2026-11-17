---
title: Page Réseau et VLAN
sidebar_label: Page Réseau et VLAN
sidebar_position: 9
description: Inspection réseau de l'hôte, validation de plans statiques/DHCP, génération de YAML netplan, sous-interfaces VLAN 802.1Q et application avec restauration automatique.
---

# Page Réseau et VLAN

La page Réseau (`network.html`, également accessible en cliquant sur l'adresse IP affichée dans la barre supérieure) permet d'inspecter la configuration réseau active de l'hôte et de valider un plan statique, DHCP ou VLAN 802.1Q proposé **sans toucher à l'hôte en cours par défaut**.

:::note
La page est **en lecture seule par défaut**. Les modifications ne peuvent être appliquées à l'hôte en cours que lorsque `NETWORK_APPLY_ENABLED=true` est défini dans le fichier `.env` du backend. Même lorsqu'elle est activée, la modification est appliquée en mémoire avec un minuteur de restauration automatique et **n'est pas persistante au redémarrage** — le YAML netplan généré est fourni afin de pouvoir être placé manuellement sous `/etc/netplan/`.
:::

## Informations affichées sur la page

<details>
<summary><strong>Interfaces réseau</strong></summary>

Liste toutes les interfaces réseau détectées sur l'hôte avec leur adresse MAC, leurs adresses IPv4 et IPv6 actuelles (avec longueur de préfixe CIDR), leur MTU, leur état de liaison (`UP` / `DOWN`) et leur interface parente VLAN le cas échéant.

</details>

<details>
<summary><strong>Passerelle par défaut</strong></summary>

Affiche la passerelle par défaut actuelle du système ainsi que l'interface réseau à laquelle elle est rattachée.

</details>

<details>
<summary><strong>Serveurs DNS</strong></summary>

Liste les serveurs de noms actuellement utilisés par l'hôte (lus depuis `/etc/resolv.conf` ou `systemd-resolved`).

</details>

## Valider et appliquer un plan réseau

<details>
<summary><strong>Validation d'un plan Statique ou DHCP</strong></summary>

Choisissez une interface et un mode cible (**Static** ou **DHCP**). Pour le mode statique, saisissez l'adresse IPv4 proposée, la longueur du préfixe, la passerelle et les serveurs DNS. Le bouton **Validate** vérifie la cohérence des paramètres et affiche les commandes exactes (`ip`, `dhclient`, `resolv.conf`) ainsi que le **YAML netplan v2** résultant qui serait appliqué, sans exécuter aucune commande sur l'hôte.

</details>

<details>
<summary><strong>Appliquer avec minuteur de restauration automatique (désactivé par défaut)</strong></summary>

L'application de modifications sur l'hôte en cours nécessite `NETWORK_APPLY_ENABLED=true` dans `.env` et refuse de modifier l'interface d'administration qui porte la session courante. Lorsqu'une application est lancée :

1. Le backend enregistre l'état courant des adresses, de la liaison, de la route par défaut et du DNS.
2. Les modifications sont appliquées et un compte à rebours de restauration automatique (`30` à `300` secondes) démarre.
3. Si l'utilisateur ne clique pas sur **Confirmer** avant l'expiration du délai (par exemple en cas de coupure de connexion), le backend restaure automatiquement la configuration précédente.

</details>

:::warning
Appliquer un plan réseau erroné à distance est la cause la plus fréquente de perte d'accès à l'hôte. Le minuteur de restauration automatique constitue votre filet de sécurité : ne cliquez sur **Confirmer** qu'après avoir vérifié que l'interface reste joignable avec la nouvelle configuration.
:::

## Sous-interfaces VLAN (802.1Q)

<details>
<summary><strong>Activer le mode VLAN (802.1Q)</strong></summary>

En mode Static, cochez **Use VLAN (802.1Q)** pour afficher le champ VLAN ID. L'interface choisie dans la liste déroulante **Interface** devient l'interface **parente** ; le plan crée une sous-interface taguée nommée `<parent>.<vlan_id>` (aperçu en direct sous **VLAN sub-interface**). Comme l'interface parente n'est jamais modifiée, l'application d'un plan VLAN ne coupe pas une connexion existante sur l'interface parente non taguée.

- **Plage de VLAN ID** - Entier de `1` à `4094`. Les valeurs hors plage affichent un indice et désactivent le bouton Valider.
- **Longueur du nom de la sous-interface (`IFNAMSIZ`)** - Linux limite les noms d'interface réseau à 15 caractères maximum. Tout nom plus long est rejeté à la validation.
- **Port du commutateur tagué** - Le port du commutateur en amont relié à l'interface parente doit transporter le VLAN ID tagué (802.1Q) ; sinon la sous-interface ne recevra aucun trafic.
- **Module noyau `8021q` sur l'hôte** - Le module noyau `8021q` doit être disponible sur l'hôte. S'il n'est pas chargé, `ip link add ... type vlan` échoue avec `not supported` et la réponse indique d'exécuter `modprobe 8021q` sur l'hôte.

</details>

<details>
<summary><strong>Définir comme route par défaut</strong></summary>

Lorsqu'une passerelle est renseignée en mode VLAN, la case **Set as default route** apparaît. Si elle est cochée, l'application exécute également `ip route replace default via <gateway> dev <parent>.<vlan_id>` et la route par défaut précédente est restaurée en cas d'annulation (rollback).

</details>

<details>
<summary><strong>Application et restauration VLAN</strong></summary>

L'application d'un VLAN respecte le verrou `NETWORK_APPLY_ENABLED=true` et le minuteur de restauration automatique. En cas de restauration, la sous-interface `<parent>.<vlan_id>` est supprimée si elle a été créée par cette opération et la route par défaut précédente est rétablie. Les interfaces VLAN préexistantes ne sont pas supprimées lors d'une restauration. Pour rendre le VLAN persistant au redémarrage, placez le bloc YAML netplan `vlans:` généré sous `/etc/netplan/` sur l'hôte.

</details>

<details>
<summary><strong>Supprimer une sous-interface VLAN (`POST /api/network/vlan/remove`)</strong></summary>

Une carte d'interface VLAN affiche `VLAN <id> on <parent>` avec un bouton **Remove**. Ce bouton (actif lorsque `NETWORK_APPLY_ENABLED=true`) exécute `ip link del <device>`, supprimant la sous-interface ainsi que ses routes sans toucher à l'interface parente. La suppression est refusée par défaut si la sous-interface porte la connexion active ou la route par défaut, sauf si `force=true` est explicitement transmis.

</details>
