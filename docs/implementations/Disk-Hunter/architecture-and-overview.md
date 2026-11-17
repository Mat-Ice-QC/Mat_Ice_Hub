---
title: System Architecture & Workflow
sidebar_label: System Architecture & Workflow
sidebar_position: 3
description: Privileged container isolation model, technician workflow, unified serial lookup, and safety controls in Disk Hunter.
---

# System Architecture & Workflow

Disk Hunter is structured to isolate root-level, privileged, and potentially destructive disk utilities from the main web API. By containerizing each task inside an ephemeral worker, the core orchestration server remains stable and isolated from raw device writes.

:::note
Privileged worker containers run with direct access to disk hardware paths (`/dev/*`), allowing utilities such as `smartctl`, `nwipe`, `hdparm`, `parted`, `fio`, and `nvme-cli` to interact directly with controller registers without exposing the main FastAPI backend process to destructive block operations.
:::

## Service Topology

1. **Frontend UI (`disk-hunter-ui`)** - An `nginx:alpine` container serving the static HTML, CSS, and vanilla JavaScript interface. It enforces client IP filtering (`ALLOWED_IPS`), enables gzip compression and `ETag` revalidation on static assets, and reverse-proxies `/api/` and `/ws/` requests to the Main API.
2. **Main API (`disk-hunter-api`)** - The central Python FastAPI orchestrator. It probes block devices, manages persistent JSON history and inventory mappings, generates PDF erasure certificates, streams live container logs over WebSockets, and spawns or terminates ephemeral Docker worker containers via asynchronous subprocess calls.
3. **SMART Provider (`disk-hunter-smart-provider`)** - A dedicated privileged FastAPI microservice that executes `smartctl` commands against `/dev/*` devices and caches attribute payloads for 30 seconds to prevent redundant disk polling.
4. **Ephemeral Worker Containers (`disk-hunter-*`)** - Single-purpose privileged containers spawned on demand per operation (`nwipe`, `hdparm`, `nvme-cli`, `parted`, `smartctl-test`, `speedtest-worker`, `power`) and removed once their output is captured.

## Technician Core Workflow

1. **Connect target disk** - Verify physical drive detection in the Disk Overview dashboard. Each drive card displays a model-matched or form-factor illustration that replaces the default graphic, and unpartitioned drives display a `NO TABLE` badge with the label `No partitions (unpartitioned / raw)`.
2. **Check form-factor badge** - Enterprise and specialized drives display a recognized form-factor badge (`U.2`, `U.3` for KIOXIA KCD models, `NVMe`, `SSD`, `HDD`, `USB`) next to the device name.
3. **Assess S.M.A.R.T. health** - Verify that the drive is physically healthy before benchmarking, partitioning, or redeploying. NVMe drives (including U.2 and U.3) display parsed health attributes (Critical Warning, Available Spare, Percentage Used, Media and Data Integrity Errors, temperature, power-on hours) annotated with `OK`, `WARN`, or `FAIL` status indicators.
4. **Sanitize** - Execute hardware-level secure erase (`nvme-cli` or `hdparm`) or block-level overwriting (`nwipe`) according to organizational compliance requirements.
5. **Export certificate** - Download the generated PDF Certificate of Erasure for compliance and asset-disposal audit trails.

## Unified Serial Number Lookup

The Disk Overview serial number resolver acts as the single source of truth across the entire application. Every operational module (Shredding, S.M.A.R.T., Speed Test, Partition Editor, History views, CSV exports, and PDF Certificates) resolves drive serial numbers through the same lookup pipeline, ensuring NVMe and SAS/SATA drives never report `UNKNOWN` in downstream tabs.

## Safety Controls & Operational Features

<details>
<summary><strong>Protect Root Drive</strong></summary>

Enabling **Protect Root Drive** in Settings prevents the primary host operating system disk from appearing in the Partition Editor, S.M.A.R.T. diagnostics, Disk Shredding, and ISO flashing tabs. This safety interlock protects the host OS from accidental erasure or repartitioning.

</details>

<details>
<summary><strong>Cross-Module Busy-Disk Locking</strong></summary>

When a disk is actively running an operation in any module (for example, a wipe, S.M.A.R.T. self-test, speed benchmark, partition task, or ISO write), Disk Hunter marks the device as busy across all operational pages. Drive cards render a `BUSY` badge and disable conflicting actions until the active job completes.

</details>

<details>
<summary><strong>Clearing Operational History</strong></summary>

When `ENABLE_DELETE_HISTORY=true`, technicians can clear operational history logs (Shredding history, S.M.A.R.T. logs, speedtest records, partition history, or downloaded ISO files) from the Settings panel to reclaim local storage space. Setting `ENABLE_DELETE_HISTORY=false` in `.env` locks all audit logs into append-only mode.

</details>

<details>
<summary><strong>Unified History Columns & Command Detail Modal</strong></summary>

All history views (Audit Logs & PDFs, S.M.A.R.T. Test History, Speed Test History, Partition History, and ISO Action History) use a standardized column layout:

`Timestamp | User IP | Drive / Target | Status | Event / Details`

Clicking any row opens a detail modal displaying the exact command executed by the backend (legacy entries recorded prior to command tracking display `Command not recorded`) alongside the captured standard output and error logs, with a one-click **Copy** button.

</details>

<details>
<summary><strong>Module-Aware Sidebar Navigation</strong></summary>

To keep the navigation sidebar uncluttered, each module's history link appears contextually only while that module or its corresponding history page is active.

</details>

<details>
<summary><strong>Data Management File Browser</strong></summary>

The Data Management module provides a read-only-safe file browser for inspecting generated reports, logs, and ISOs, complete with a root filesystem usage indicator, on-demand directory size calculation (cached for 60 seconds), and an opaque sticky table header.

</details>

<details>
<summary><strong>Performance & Live WebSocket Updates</strong></summary>

Drive cards are cached by device path in the frontend DOM so that WebSocket ticks only update changed text nodes without rebuilding unchanged cards or re-fetching drive illustrations. The Temperature page polls every 5 seconds and automatically pauses when the browser tab is hidden. For low-powered hardware or software-rendered kiosk displays, **Potato Mode** disables expensive visual effects.

</details>

<details>
<summary><strong>Network Page (Read-Only by Default)</strong></summary>

The Network page is linked from the host IP pill in the top bar and reachable directly at `network.html`. It displays host network interfaces, the default gateway, and DNS servers, and validates static, DHCP, or 802.1Q VLAN configurations while previewing the exact `ip` commands and netplan YAML. Live host changes are disabled unless `NETWORK_APPLY_ENABLED=true` is set in `.env`.

</details>

<details>
<summary><strong>ISO Action History</strong></summary>

Every OS image download and device write in the ISO module is logged in `iso_history.json` with the initiating client IP, source URL, file size, target device, and completion status. Downloaded filenames lacking an `.iso` or `.img` extension automatically have `.iso` appended.

</details>

<details>
<summary><strong>Host Power Controls</strong></summary>

The dashboard carries **Shut Down Host** and **Reboot Host** buttons next to **Rescan Hardware**. Each action requires confirmation via the custom confirm modal, is refused while any disk operations are running (ensuring a wipe, self-test, benchmark, or partition job is never interrupted), and is executed by a privileged `--pid=host` worker container (`disk-hunter-power`) that requests a graceful `poweroff` or `reboot` from the host's `systemd` via `nsenter` so running containers are stopped cleanly first. Every connected browser client receives a WebSocket broadcast notification when a power action is initiated; after a reboot, the dashboard reconnects its WebSocket automatically (`ws-open`) and unlocks the buttons. The controls can be hidden and disabled entirely by setting `POWER_ACTIONS_ENABLED=false` in the backend `.env` (default `true`).

</details>
