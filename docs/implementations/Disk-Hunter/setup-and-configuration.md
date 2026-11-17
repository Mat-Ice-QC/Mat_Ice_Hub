---
title: Setup & Configuration
sidebar_label: Setup & Configuration
sidebar_position: 2
description: Prerequisites, Docker Compose quick start, environment variables, permissions, server-side settings, kiosk mode, and supply-chain pinning for Disk Hunter.
---

# Setup & Configuration

## Prerequisites

- A Linux host with direct physical access to the target storage drives (`/dev`, `/sys`, and `/run/udev` bind-mounted into the containers).
- Docker and Docker Compose installed, with root or `sudo` privileges required to spawn privileged worker containers.
- A modern web browser to access the dashboard (or the built-in Firefox ESR kiosk profile for headless appliances).

## Quick Start

Clone the repository, copy `.env.example` to `.env`, and start the stack with Docker Compose:

```bash
git clone https://github.com/Mat-Ice-QC/Disk-Hunter.git Disk-Hunter
cd Disk-Hunter
cp .env.example .env       # edit configuration if needed
docker compose up -d --build
```

To launch the optional fullscreen Firefox ESR kiosk on the host's `tty2`:

```bash
docker compose --profile kiosk up -d --build
```

Once started, the web UI is reachable at `http://localhost` (or the host IP on port `80`, or port `443` when `HTTPS_CERT_PATH` and `HTTPS_KEY_PATH` are configured).

:::important
The `nginx-entrypoint.sh` script at the repository root generates the Nginx `default.conf` at container start and **must** have executable permissions (`chmod 755 nginx-entrypoint.sh`). If the executable bit is missing (for example after extracting a tar archive without preserving permissions), Nginx falls back to its stock configuration and `/api` and `/ws` requests return HTTP 404.
:::

## Environment Configuration (`.env`)

All runtime configuration is controlled through `.env` (copied from `.env.example`).

| Variable | Description | Default |
| --- | --- | --- |
| `ALLOWED_IPS` | Comma-separated list of client IPs or CIDRs permitted to access Nginx and the API, or `*` for unrestricted access | `*` |
| `ENABLE_SHREDDER` | Enable disk shredding and secure erase (`nwipe`, `hdparm`, `nvme-cli`) | `true` |
| `ENABLE_SPEEDTEST` | Enable `fio` disk speed benchmarks | `true` |
| `ENABLE_ISOWRITER` | Enable OS image (`.iso` / `.img`) downloading and drive flashing | `true` |
| `ENABLE_SMARTCTL` | Enable S.M.A.R.T. health queries and self-tests | `true` |
| `ENABLE_DATA_MANAGEMENT` | Enable file browsing and log management in the Data Management view | `true` |
| `ENABLE_NETWORK_SHARE` | Enable the network share module toggle in the frontend | `true` |
| `ENABLE_DELETE_HISTORY` | Allow deleting logs and operational history; setting `false` makes audit history append-only | `true` |
| `DATA_DIR` | Host directory path used for persistent logs, generated PDFs, downloaded ISOs, and JSON settings | `./data` |
| `FROZEN_FALLBACK_WIPE` | ATA Secure Erase behavior when a drive remains frozen: `1` falls back to NIST SP 800-88 Clear zero-overwrite; `0` fails immediately | `1` |
| `KIOSK_URL` | Target URL opened by the Firefox ESR kiosk container | `http://localhost` |
| `HTTPS_CERT_PATH` / `HTTPS_KEY_PATH` | Optional host paths to TLS certificate and private key files to enable HTTPS on port 443 | unset |
| `NETWORK_APPLY_ENABLED` | Allow the Network page (`network.html`) to apply live network changes (`true` / `false`); when `false`, the page operates in validation-only mode | `false` |
| `POWER_ACTIONS_ENABLED` | Show the dashboard **Shut Down Host** and **Reboot Host** buttons (`true` / `false`); power actions are always refused while disk operations run | `true` |
| `DATA_UID` / `DATA_GID` | Optional numeric user and group IDs used by `backend/docker-entrypoint.sh` to `chown` the data directory on first start | unset |

## First-Start Permissions

On container startup, `backend/docker-entrypoint.sh` initializes the persistent subdirectories and JSON state files under `DATA_DIR` with strict permissions:

- Directories are created with mode `755` (`rwxr-xr-x`).
- JSON state files are created with mode `644` (`rw-r--r--`).
- Group-writable and world-writable permissions are never set.
- Permission adjustment warnings are logged without aborting container startup.
- When `DATA_UID` and `DATA_GID` are provided in `.env`, the entrypoint recursively updates ownership of the data directory to match those IDs.

## Server-Side Persistent Settings

Application preferences and organizational metadata are stored server-side on the Disk Hunter host inside `DATA_DIR`, ensuring consistent state across all connected browser clients:

- **`data/branding.json`** - Organization name, address, phone number, custom logo, and default datacenter/server metadata tags used on PDF Certificates of Erasure.
- **`data/app_settings.json`** - Server-wide toggles and preferences, including:
  - **Protect Root Drive** (`protect_root`) - Hides the host operating system disk from destructive and diagnostic views (Partition Editor, S.M.A.R.T., Shredding, and ISO flashing).
  - **Generate Cert** (`generate_pdf`) - Server-wide toggle controlling whether completed wipe jobs automatically generate a PDF Certificate of Erasure, along with a timestamped change history of the toggle.
  - **Temperature Sensor Selection & Thresholds** - Configured sensor monitors and warning/critical Celsius limits.
- **`data/inventory.json`** - Maps physical drive Serial Numbers (`S/N`) to organizational Inventory IDs via `/api/inventory`. Mapped Inventory IDs appear automatically in drive cards, history tables, CSV exports, and PDF erasure certificates.
- **System Time & NTP Sync** - The Settings view provides controls to inspect and set the host system clock or trigger an immediate NTP synchronization (`ntpdate`).

## Kiosk Mode

For standalone, air-gapped Linux appliances without a desktop environment, the optional `disk-hunter-firefox-kiosk` service (enabled via `--profile kiosk`) starts a self-contained Xorg server on the host's **`tty2`** virtual terminal and launches Firefox ESR in fullscreen kiosk mode pointing at `KIOSK_URL`.

- Switch to the kiosk display on the physical host with `Ctrl+Alt+F2`.
- Switch back to the primary text console (`tty1`) with `Ctrl+Alt+F1`.

## Supply Chain Security

To guarantee reproducible builds and prevent upstream tag tampering:

1. **Base Image Digest Pinning** - Every `FROM` instruction across the backend, frontend, `smart-provider`, and worker Dockerfiles is pinned to an immutable SHA256 image digest defined in `.env.example` and passed as a Docker build argument.
2. **Package Version Locking** - Alpine `apk` packages and Python `pip` dependencies (`backend/requirements.txt` and `smart-provider/requirements.txt`) are locked to explicit versions.
