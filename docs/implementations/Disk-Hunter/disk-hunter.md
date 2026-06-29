---
sidebar_label: Disk Hunter
pagination_next: null
pagination_prev: null
---

# Disk Hunter

An all-in-one, web utility designed for testing, managing, wiping, and formatting physical storage drives.

**Repository:** [Mat-Ice-QC/Disk-Hunter](https://github.com/Mat-Ice-QC/Disk-Hunter)

## Overview

Disk Hunter provides a sleek, modern glassmorphic dashboard interface for administrative disk operations. It leverages a high-performance Python FastAPI backend, isolating root-level, privileged commands inside ephemeral Docker containers to safeguard host system integrity.

## Key Features

- **Interactive Dashboard** - Instantly view connected drives, partition structures, device health, and raw hardware specs in a unified grid.
- **Secure Wiping (Shredder)** - Erase disk data using industry-standard wiping methods (via `nwipe` and `hdparm`). Streams real-time terminal output to the browser and automatically generates a PDF Certificate of Erasure upon completion.
- **Speed Benchmarks** - Run sequential read/write speed tests (using `fio` benchmarks) directly from the UI.
- **S.M.A.R.T. Diagnostics** - Run and monitor short/extended self-tests, check real-time progress metrics, and view structured attribute health tables.
- **Visual Partition Editor** - Create, delete, and format partitions (ext3, ext4, fat32, ntfs) with an intuitive click-and-drag block interface powered by `parted`.
- **OS Image Flashing** - Safely write downloaded `.iso` or `.img` OS images directly to targeted devices.

## System Architecture

Disk Hunter is built with a decoupled microservice layout to ensure worker isolation and concurrency safety.

| Component | Role | Communicates With |
|---|---|---|
| **Frontend UI** (`nginx:alpine`) | Serves the glassmorphic web interface | Polls status and invokes the Main API |
| **Main API** (`Python FastAPI`) | Orchestration hub | Spawns/monitors ephemeral worker containers; delegates SMART queries |
| **SMART Provider** (`Python FastAPI microservice`) | Executes `smartctl` as a non-root proxy | Runs privileged `smartctl` commands against `/dev/*` |
| **Ephemeral Worker Containers** | Sandboxed execution environment | Runs privileged utilities: `nvme-cli`, `nwipe`, `hdparm`, `parted`, `dd`, `fio` |

The application is composed of three main components:

1. **Frontend (`disk-hunter-ui`)** - A responsive, glassmorphic UI built in vanilla HTML, CSS, and JavaScript, served via Nginx.
2. **Main API (`disk-hunter-api`)** - The orchestration hub. Spawns, monitors, and terminates ephemeral Docker worker containers via async subprocess calls.
3. **SMART Provider (`disk-hunter-smart-provider`)** - A lightweight FastAPI microservice running in privileged mode, responsible for executing `smartctl` commands.

## Requirements

- Docker (required to run the ephemeral worker containers for privileged disk operations)
- A Linux host with direct physical access to the target drives
- A modern web browser to access the dashboard

## Notes

- Privileged disk operations (wiping, firmware updates, etc.) are sandboxed inside ephemeral Docker containers, keeping the host system protected.
- For network-accessible deployments, restrict access to trusted clients using firewall rules or a VPN, as the interface provides low-level disk access.
- The secure wipe feature automatically produces a PDF Certificate of Erasure upon completion, which can be useful for compliance or asset disposal records.
