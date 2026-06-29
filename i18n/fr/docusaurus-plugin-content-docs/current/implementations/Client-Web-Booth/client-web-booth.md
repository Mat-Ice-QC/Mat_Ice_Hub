---
sidebar_label: Client Web Booth
pagination_next: null
pagination_prev: null
---

# Client Web Booth

Un photobooth basé sur le navigateur et auto-hébergé pour les événements privés. Les clients se connectent via WiFi/LAN pour prendre des photos avec la caméra de leur propre appareil, les images étant traitées et sauvegardées de manière centralisée sur votre serveur.

**Dépôt :** [Mat-Ice-QC/Client-Web-Booth](https://github.com/Mat-Ice-QC/Client-Web-Booth)

:::warning Avertissement de sécurité : Usage privé uniquement

- **Aucune authentification :** N'importe qui sur le réseau peut télécharger/voir les images.
- **Éphémère :** Conçu pour des événements temporaires derrière un pare-feu.
- **Utilisez à vos risques et périls.** Ne pas exposer sur l'internet public.

:::

## Aperçu

Client Web Booth est une application web légère basée sur Docker qui transforme n'importe quel appareil en réseau en borne photobooth pour des événements privés. Les invités se connectent au serveur via WiFi ou LAN en utilisant la caméra de leur propre téléphone ou ordinateur portable. Les photos sont traitées et stockées de manière centralisée sur le serveur hôte.

## Démarrage rapide (Docker)

**Clonez le dépôt :**

```bash
git clone https://github.com/Mat-Ice-QC/Client-Web-Booth.git
cd client-web-booth
```

**Démarrez l'application :**

```bash
docker compose up -d --build
```

**Connexion :**

- **Hôte :** Ouvrez `https://localhost` ou `https://VOTRE_IP_LAN` pour tester.
- **Clients :** Les invités se connectent à `https://VOTRE_IP_LAN`. Ils devront accepter le certificat auto-signé et autoriser l'accès à la caméra dans leur navigateur.

## Configuration et utilisation

### Incrustations (Overlays)

Ajoutez des cadres ou des filtres personnalisés en déposant des fichiers PNG dans le dossier local `overlays/`.

- **Convention de nommage :** Les noms de fichiers doivent commencer par `vertical` ou `horizontal` pour correspondre à l'orientation appropriée de la photo.

## Exigences

- Docker et Docker Compose
- Un réseau local (WiFi ou LAN) auquel tous les invités peuvent se connecter
- Un navigateur moderne avec accès à la caméra sur chaque appareil des invités

## Remarques

- Cette application ne comporte aucune authentification. Elle est destinée exclusivement à une utilisation sur des réseaux d'événements privés et temporaires derrière un pare-feu.
- Le serveur utilise un certificat auto-signé. Les invités devront accepter un avertissement de sécurité du navigateur avant d'accéder au photobooth.
- Ne pas exposer cette application sur l'internet public.
