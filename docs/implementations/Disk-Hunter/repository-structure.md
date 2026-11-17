---
title: Repository & Component Reference
sidebar_label: Repository & Component Reference
sidebar_position: 10
description: Complete directory tree, microservice file reference, and UI performance architecture of the Disk Hunter repository.
---

# Repository & Component Reference

This reference documents every directory and file in the Disk Hunter repository alongside the frontend/backend performance architecture.

## Directory Layout

```text
Disk-Hunter/
├── backend/                FastAPI orchestrator service (disk-hunter-api)
│   ├── api/                REST routers, WebSocket manager, PDF generator, Docker spawner
│   ├── docker-entrypoint.sh First-start initialization: data directories and JSON files (755/644)
│   ├── Dockerfile          Container build definition for the main backend
│   ├── main.py             FastAPI application entry point and middleware
│   └── requirements.txt    Pinned Python dependencies for the main API
├── html/                   Static frontend served by Nginx (bind-mounted)
│   ├── components/         Shared HTML fragments (header, sidebar, footer)
│   ├── css/                Per-page and global glassmorphic stylesheets
│   ├── docs/               In-app Markdown help guides (English and French under docs/fr/)
│   ├── js/                 Frontend controllers, WebSocket client, and DOM caches
│   ├── *.html              Application views (index, shredding, smartctl, speedtest, etc.)
│   ├── locales.json        UI translation dictionary (English, French, Spanish)
│   └── tools.json          Frontend tool definitions and navigation metadata
├── smart-provider/         Privileged FastAPI microservice for smartctl queries
│   ├── Dockerfile          Container build definition for smart-provider
│   ├── main.py             HTTP wrapper around smartctl with 30-second response caching
│   └── requirements.txt    Pinned Python dependencies for smart-provider
├── workers/                Ephemeral privileged task containers
│   ├── firefox-kiosk/      Fullscreen Xorg + Firefox ESR kiosk on host tty2
│   ├── hdparm/             ATA Secure Erase and frozen drive unfreeze scripts
│   ├── nvme/               NVMe hardware format and cryptographic erase worker
│   ├── nwipe/              Multi-pass block overwrite worker (DoD, Gutmann, PRNG, zeros)
│   ├── parted/             Partition table and filesystem formatting worker
│   ├── power/              Host poweroff and reboot worker (--pid=host via nsenter/systemctl)
│   ├── smartctl-test/      Background S.M.A.R.T. short/extended self-test worker
│   └── speedtest-worker/   Sequential I/O benchmark worker using fio
├── screenshots/            UI screenshots used in repository overview
├── docker-compose.yml      Multi-container service orchestration and digest build args
├── .env.example            Template for environment variables and SHA256 image digests
├── nginx.conf              Base Nginx server configuration
└── nginx-entrypoint.sh     Generates Nginx default.conf with ALLOWED_IPS and TLS settings
```

## Root Files

| File | Purpose |
| --- | --- |
| `.env.example` | Template defining runtime environment variables, feature flags, and SHA256 base-image digests. |
| `docker-compose.yml` | Defines `disk-hunter-ui`, `disk-hunter-api`, `disk-hunter-smart-provider`, and build targets for the ephemeral worker images plus the optional `kiosk` profile. |
| `nginx.conf` | Base Nginx configuration enabling gzip compression for text/JSON responses and configuring worker processes. |
| `nginx-entrypoint.sh` | Startup script (must be mode `755`) that renders `/etc/nginx/conf.d/default.conf`, injecting `ALLOWED_IPS` ACL rules, optional HTTPS listeners, `ETag` caching headers, and `/api/` + `/ws/` reverse-proxy blocks. |
| `LICENSE` | GNU Affero General Public License v3.0 (`AGPL-3.0`). |
| `README.md` | Project overview, quick-start instructions, and changelog. |

## Backend Service (`backend/`)

The central Python FastAPI application (`disk-hunter-api`) orchestrating device discovery, worker containers, history logs, and PDF certificates.

| File | Purpose |
| --- | --- |
| `backend/main.py` | FastAPI entry point registering routers, CORS/IP middleware, and background task hooks. |
| `backend/docker-entrypoint.sh` | Initializes `DATA_DIR` subdirectories and default JSON files with `755`/`644` permissions and optional `DATA_UID`/`DATA_GID` ownership before starting `uvicorn`. |
| `backend/api/config.py` | Centralized environment variable parsing, feature toggle flags, and filesystem path constants. |
| `backend/api/disks.py` | Block device discovery (`lsblk`, `/sys/block`, udev), unified serial lookup, partition tree assembly, and root-disk detection. |
| `backend/api/drive_info.py` | Vendor/model recognition, form-factor classification (`U.2`, `U.3`, `NVMe`, `SSD`, `HDD`, `USB`), and drive metadata helpers. |
| `backend/api/docker_manager.py` | Spawns, monitors, streams logs from, and cleans up ephemeral privileged Docker worker containers (including `--pid=host` support via `pid_host`); tracks cross-module busy disks (`get_busy_disks()`). |
| `backend/api/shredding.py` | Endpoints for starting and stopping `nwipe`, `hdparm` ATA Secure Erase, and `nvme-cli` hardware erase jobs, plus failure flagging. |
| `backend/api/smartctl.py` | Proxy endpoints forwarding S.M.A.R.T. health queries to `smart-provider` and launching `smartctl-test` self-test workers. |
| `backend/api/speedtest.py` | Endpoints for starting and monitoring `fio` sequential read/write benchmarks on mounted partitions. |
| `backend/api/partition.py` | Endpoints for initializing disk labels (`gpt`, `msdos`, etc.), creating/deleting partitions, and formatting filesystems via `parted`. |
| `backend/api/iso.py` | Endpoints for downloading `.iso`/`.img` files to `/app/data/isos`, tracking download/write history, and flashing images to target drives. |
| `backend/api/network.py` | Host interface discovery (`ip -j addr`, `ip -j route`), DNS inspection, static/DHCP/802.1Q VLAN validation, netplan YAML generation, and rollback-guarded live apply (`NETWORK_APPLY_ENABLED`). |
| `backend/api/inventory.py` | CRUD endpoints (`/api/inventory`) mapping drive Serial Numbers (`S/N`) to organizational Inventory IDs in `data/inventory.json`. |
| `backend/api/images.py` | Serves immutable default drive SVGs (`/api/images/defaults/{kind}.svg`) and manages custom per-model drive illustrations and branding logos. |
| `backend/api/data_management.py` | Read-only-safe file browser endpoints, on-demand directory size calculation (`/api/data-management/dir-size`) with 60s mtime-keyed caching, and history cleanup routes. |
| `backend/api/history.py` | Endpoints serving operational history logs (`wipe_history.json`, `smart_history.json`, `speedtest_history.json`, `partition_history.json`, `iso_history.json`) and container log outputs. |
| `backend/api/pdf_generator.py` | Generates visual PDF Certificates of Erasure containing organization branding, drive serial/inventory metadata, wipe method, and verification results. |
| `backend/api/reports.py` | Serves generated PDF erasure certificates and CSV audit exports. |
| `backend/api/settings.py` | Reads and updates `data/app_settings.json` and `data/branding.json`, plus host system clock inspection, manual time setting, and NTP synchronization. |
| `backend/api/system.py` | Host telemetry and control endpoints: hostname, primary IP, root filesystem usage, multi-sensor temperatures, centralized notifications, feature flags (`/api/system/features` including `POWER_ACTIONS_ENABLED`), and host power actions (`POST /api/system/power` for `shutdown` and `reboot` with busy-disk refusal and WebSocket broadcast). |
| `backend/api/ws.py` | WebSocket hub broadcasting live disk state, active job progress, and temperature telemetry to connected browsers. |
| `backend/api/models.py` | Pydantic request and response schemas across all API routers. |

## Frontend UI (`html/`)

A zero-build vanilla HTML, CSS, and JavaScript web interface served by Nginx.

### HTML Views & Shared Components

| Path | Purpose |
| --- | --- |
| `html/index.html` | Main Disk Overview dashboard displaying connected drives, partitions, health status, and hardware specs. |
| `html/shredding.html` | Disk Shredding (`nwipe`) and hardware Secure Erase (`hdparm` / `nvme-cli`) interface with confirmation and bulk metadata modals. |
| `html/smartctl.html` | S.M.A.R.T. health table, parsed NVMe/U.2/U.3 attributes, and short/extended self-test controls. |
| `html/smart_logs.html` | Detailed raw S.M.A.R.T. attribute and self-test log viewer. |
| `html/speedtest.html` | `fio` sequential read/write benchmark runner. |
| `html/partition.html` | Visual Partition Editor with proportional block bar and batch operation queue. |
| `html/iso.html` | OS image (`.iso` / `.img`) downloader and device flasher. |
| `html/temperature.html` | Real-time multi-sensor temperature monitor with threshold indicators. |
| `html/network.html` | Host network interface viewer, static/DHCP/VLAN validator, netplan generator, and rollback-guarded apply UI. |
| `html/network-share.html` | Network share configuration view. |
| `html/data-management.html` | Persistent data directory browser, report downloader, and storage usage view. |
| `html/notifications.html` | Centralized Notifications Center showing system alerts, job completions, and errors. |
| `html/settings.html` | Server-wide settings, branding configuration, Drive Image Manager, Inventory ID Manager, system time/NTP controls, and history cleanup. |
| `html/docs.html` | In-app documentation reader rendering Markdown files from `html/docs/`. |
| `html/history.html`, `smart_history.html`, `speedtest_history.html`, `partition_history.html`, `iso_history.html` | Module-specific audit and action history tables sharing the unified 5-column layout and command-detail modal. |
| `html/components/header.html`, `sidebar.html`, `footer.html` | Reusable navigation bar, top telemetry bar (hostname, IP pill, temperature pills, clock, notification bell), and footer fragments. |

### JavaScript Controllers (`html/js/`)

| File | Purpose |
| --- | --- |
| `html/js/common.js` | Shared WebSocket connection manager (dispatching `ws-open` on reconnection and `ws-power_action` notices), `localStorage` stale-while-revalidate fragment/locale loader, drift-aligned header clock, global notification banner, and modal helpers. |
| `html/js/history-common.js` | Shared table renderer, status badge formatter, and single-modal command/log viewer used across all five history pages. |
| `html/js/index.js` | Dashboard controller with keyed per-disk DOM card caching, delegated event handling, and **Shut Down Host** / **Reboot Host** controls (busy-state locking and automatic unlock on `ws-open` after a reboot). |
| `html/js/shredding.js` | Shredding and Secure Erase controller, mode-persistent drive selection, bulk metadata assignment, and live log streaming. |
| `html/js/smartctl.js`, `smart_logs.js`, `smart_history.js` | S.M.A.R.T. diagnostics controllers, NVMe health log parser, self-test log modal, and history view. |
| `html/js/speedtest.js`, `speedtest_history.js` | `fio` benchmark controller, live progress display, and benchmark history view. |
| `html/js/partition.js`, `partition_history.js` | Visual partition bar renderer, batch operation builder, and partition history view. |
| `html/js/iso.js`, `iso_history.js` | ISO download progress tracker, USB/disk flasher, and ISO action history view. |
| `html/js/network.js` | Network plan validator, 802.1Q VLAN form logic, netplan preview, and rollback countdown controller. |
| `html/js/temperature.js` | Temperature chart/card controller with `visibilitychange` pause when the browser tab is hidden. |
| `html/js/notifications.js` | Notifications feed renderer, unread counter, and mark-read/clear actions. |
| `html/js/data-management.js` | File browser controller with lazy per-directory size fetching (`/api/data-management/dir-size`). |
| `html/js/settings.js` | Settings controller for branding, Inventory ID CRUD, Drive Image Manager, system clock/NTP, and Potato Mode. |
| `html/js/docs.js` | Markdown parser and accordion/callout renderer for the in-app help center. |

## SMART Provider & Worker Containers

| Component | Path | Role |
| --- | --- | --- |
| **SMART Provider** | `smart-provider/main.py` | Privileged FastAPI service exposing `/smart/{device}` and self-test log endpoints with a 30-second in-memory cache. |
| **nwipe Worker** | `workers/nwipe/Dockerfile` | Runs `nwipe` with selected algorithm (`zero`, `ops2`, `dodshort`, `dod522022m`, `gutmann`, `prng`) and verification level. |
| **hdparm Worker** | `workers/hdparm/hdparm-secure-erase.sh` | Executes ATA `SECURITY ERASE`, attempts multi-method unfreeze on frozen SATA drives, and falls back to NIST SP 800-88 Clear zero-wipe when `FROZEN_FALLBACK_WIPE=1`. |
| **nvme Worker** | `workers/nvme/run_wipe.sh` | Runs `nvme format` (`SES=1` User Data or `SES=2` Cryptographic Erase) against `/dev/nvme*` controllers and namespaces. |
| **parted Worker** | `workers/parted/Dockerfile` | Executes `parted`, `mkfs.ext4`, `mkfs.ntfs`, `mkfs.vfat`, `mkfs.btrfs`, and `mkfs.xfs` operations. |
| **power Worker** | `workers/power/power-action.sh` | Privileged `--pid=host` container (pinned to `ALPINE_IMAGE` digest and `UTIL_LINUX_VERSION`) that requests a graceful host `systemctl poweroff -i` or `systemctl reboot -i` via `nsenter -t 1 -m -u -i -n`, falling back to `--force` and the `reboot(2)` syscall. |
| **smartctl-test Worker** | `workers/smartctl-test/run_test.sh` | Initiates and monitors `smartctl -t short` and `smartctl -t long` self-tests. |
| **speedtest Worker** | `workers/speedtest-worker/run_test.sh` | Runs sequential read/write `fio` jobs (`1G`, `10G`, `100G`) inside mounted partition directories and cleans up `.fio_test`. |
| **firefox-kiosk Worker** | `workers/firefox-kiosk/` | Launches Xorg on `tty2` and starts Firefox ESR in fullscreen kiosk mode (`entrypoint.sh`, `kiosk-session.sh`). |

## UI & Asset Performance Invariants

To keep the interface responsive on low-power kiosk hardware (including software-rendered Firefox ESR 115 on Linux):

1. **Keyed DOM Card Caching** - Drive cards are cached by device path (`diskCardCache`). WebSocket ticks rebuild only cards whose rendered state hash changed, preserving `<img>` and `<svg>` elements in the DOM with zero redundant image requests.
2. **Zero-Mutation Idle WebSocket Ticks** - When an incoming WebSocket payload contains unchanged telemetry and no active jobs, zero DOM writes occur.
3. **Delegated Event Listeners** - Grid cards and 500+ row history tables use container-level event delegation rather than per-row event listeners.
4. **No Full-Viewport Backdrop Blur** - Modal overlays omit `backdrop-filter: blur(...)` to prevent full-screen software-rendering repaints on every keystroke.
5. **Stale-While-Revalidate Chrome & Immutable Default SVGs** - `locales.json`, `tools.json`, and header/sidebar/footer HTML fragments render immediately from `localStorage` while revalidating in the background (`ETag` / HTTP 304). Default drive SVGs are served with `Cache-Control: public, max-age=31536000, immutable` from `/api/images/defaults/{kind}.svg`.
