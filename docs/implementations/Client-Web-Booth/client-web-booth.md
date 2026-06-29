---
sidebar_label: Client Web Booth
pagination_next: null
pagination_prev: null
---

# Client Web Booth

A self-hosted, browser-based photobooth for private events. Clients connect via WiFi/LAN to take photos using their own device cameras, with images processed and saved centrally on your server.

**Repository:** [Mat-Ice-QC/Client-Web-Booth](https://github.com/Mat-Ice-QC/Client-Web-Booth)

:::warning Security Notice: Private Use Only

- **No Authentication:** Anyone on the network can upload/view images.
- **Ephemeral:** Designed for temporary events behind a firewall.
- **Use at your own risk.** Do not expose to the public internet.

:::

## Overview

Client Web Booth is a lightweight, Docker-based web application that turns any networked device into a photobooth station for private events. Guests connect to the server over WiFi or LAN using their own phone or laptop camera. Photos are processed and stored centrally on the host server.

## Quick Start (Docker)

**Clone the repository:**

```bash
git clone https://github.com/Mat-Ice-QC/Client-Web-Booth.git
cd client-web-booth
```

**Start the application:**

```bash
docker compose up -d --build
```

**Connect:**

- **Host:** Open `https://localhost` or `https://YOUR_LAN_IP` to test.
- **Clients:** Guests connect to `https://YOUR_LAN_IP`. They will need to accept the self-signed certificate and allow camera access in their browser.

## Configuration and Usage

### Overlays

Add custom frames or filters by dropping PNG files into the local `overlays/` folder.

- **Naming Convention:** Filenames must start with `vertical` or `horizontal` to match the appropriate photo orientation.

## Requirements

- Docker and Docker Compose
- A local network (WiFi or LAN) that all guests can connect to
- A modern browser with camera access on each guest device

## Notes

- This application has no authentication. It is intended exclusively for use on private, temporary event networks behind a firewall.
- The server uses a self-signed certificate. Guests will need to accept a browser security warning before accessing the booth.
- Do not expose this application to the public internet.
