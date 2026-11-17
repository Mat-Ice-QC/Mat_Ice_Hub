---
title: Disk Shredding Standards
sidebar_label: Disk Shredding Standards
sidebar_position: 4
description: Block-level disk wiping with nwipe, ATA Secure Erase via hdparm, frozen drive handling, verification modes, and PDF erasure certificates.
---

# Disk Shredding Standards

For SATA/SAS HDDs, SSDs, and general block devices, Disk Hunter runs `nwipe` or `hdparm` inside isolated privileged worker containers. Technicians can select either multi-pass block overwriting (**Shredding**) or controller-level **ATA Secure Erase**.

:::warning
Once disk shredding or secure erase starts, all partition tables, boot sectors, and user data blocks on the target device are permanently destroyed. Always verify the drive serial number and inventory ID before confirming execution.
:::

## Block Overwrite Standards (`nwipe`)

| Wipe Standard | Passes | Description |
| --- | --- | --- |
| **Fill Zeros** | 1 | Fastest method. Overwrites all addressable sectors with `0x00`. Suitable for non-confidential drives or preparing disks for OS reinstallation. |
| **PRNG Stream** | 1 | Overwrites all sectors in a single pass with a continuous stream of cryptographically generated pseudo-random bytes. |
| **DoD Short (5220.22-M)** | 3 | Three-phase compliance standard: writes zeros (`0x00`), ones (`0xFF`), and a pseudo-random byte stream with verification. |
| **DoD Full (5220.22-M)** | 7 | Exhaustive seven-pass overwrite cycle alternating fixed character patterns, their complements, and pseudo-random passes. |
| **Gutmann** | 35 | Classic 35-pass sequence combining random passes with deterministic magnetic encoding patterns designed for legacy magnetic-platter HDDs. |

### Wipe Algorithm Details

<details>
<summary><strong>Fill With Zeros (1 Pass)</strong></summary>

Writes `0x00` sequentially across every sector on the device. Provides the shortest execution time for clearing non-sensitive data or zeroing partition metadata prior to repurposing.

</details>

<details>
<summary><strong>PRNG Stream (1 Random Pass)</strong></summary>

Fills every sector with a continuous stream of pseudo-random bytes in a single pass. Significantly faster than multi-pass algorithms while preventing standard software recovery.

</details>

<details>
<summary><strong>DoD Short 5220.22-M (3 Passes)</strong></summary>

A three-phase sanitization standard writing zeros, ones, and a pseudo-random byte stream across all sectors. Recommended for general commercial drive decommissioning and reuse.

</details>

<details>
<summary><strong>DoD Full 5220.22-M (7 Passes)</strong></summary>

An exhaustive seven-pass overwrite cycle that repeatedly alternates character patterns and complementary values before terminating with a random pass. Used when strict multi-pass compliance is required.

</details>

<details>
<summary><strong>Gutmann (35 Passes)</strong></summary>

Writes 35 distinct passes using pseudo-random streams and specific magnetic encoding patterns originally designed to erase MFM/RLL magnetic remnant signatures on older hard disk drives.

</details>

## Verification Settings

<details>
<summary><strong>No Verification</strong></summary>

Skips reading back sectors after writing. Maximizes sanitization throughput and reduces total run time by approximately half.

</details>

<details>
<summary><strong>Verify Last Pass Only</strong></summary>

Reads back and validates all disk sectors after the final write pass completes. Provides a practical balance between verification assurance and total execution time.

</details>

<details>
<summary><strong>Verify All Passes</strong></summary>

Reads back and validates every sector after each individual write pass. Ensures maximum write-integrity verification at the cost of significantly longer run times.

</details>

## ATA Secure Erase & Frozen Drive Handling (`hdparm`)

For SATA drives supporting the ATA Security feature set, Disk Hunter provides an `hdparm` worker that issues hardware-level `SECURITY ERASE UNIT` (or `ENHANCED SECURITY ERASE`) commands directly to the drive firmware.

- **Capability Detection** - Before starting, the backend inspects `hdparm -I` output to verify that the drive supports ATA security and checks whether the drive is currently `locked` or `frozen` by the host BIOS/UEFI.
- **Multi-Method Unfreeze** - When a SATA drive is reported as `frozen`, the worker attempts non-destructive controller/link reset techniques to transition the drive out of the frozen state without requiring a full host reboot.
- **NIST SP 800-88 Clear Fallback (`FROZEN_FALLBACK_WIPE`)** - When `FROZEN_FALLBACK_WIPE=1` (the default in `.env`), if a drive remains frozen after unfreeze attempts, Disk Hunter automatically falls back to a full-disk zero-overwrite pass conforming to NIST SP 800-88 Clear guidelines so batch sanitization workflows do not stall. Setting `FROZEN_FALLBACK_WIPE=0` causes frozen drives to fail immediately instead.

## Selection, Bulk Metadata & Audit Trail

<details>
<summary><strong>Selection Survives Mode Toggling</strong></summary>

Drives selected in the Shredding list remain selected when switching the view between **Shredding** (`nwipe`) and **Secure Erase** (`hdparm` / `nvme-cli`), allowing technicians to compare options without re-selecting targets.

</details>

<details>
<summary><strong>Confirm Data Destruction Modal & Bulk Assignment</strong></summary>

The confirmation modal captures **Datacenter**, **Server Name**, and **Inventory ID** metadata for the erasure certificate and preserves those values when switching between **Detailed** and **Simple List** views. Bulk controls allow applying Datacenter and Server Name values to all drives or selected drives at once, as well as selecting drives grouped by server name.

</details>

<details>
<summary><strong>Initiating User IP & Command Logging</strong></summary>

The backend records the client IP address that started or stopped each wipe job. History entries display `Timestamp | User IP | Drive / Target | Status | Event / Details`, and clicking any row opens a modal showing the exact command executed and the captured worker log output. If an `nwipe` run fails, the failure log is persisted and the disk is flagged as problematic in the UI.

</details>

<details>
<summary><strong>Server-Wide Certificate of Erasure Toggle</strong></summary>

The **Generate Cert** setting (stored server-wide in `data/app_settings.json`) automatically generates a PDF Certificate of Erasure upon successful completion of a wipe job, embedding organization branding (`data/branding.json`), drive serial number, mapped Inventory ID (`data/inventory.json`), wipe algorithm, verification status, start/end timestamps, and technician metadata.

</details>
