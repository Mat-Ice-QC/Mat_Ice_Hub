---
title: Partition Editor & File Systems
sidebar_label: Partition Editor & File Systems
sidebar_position: 8
description: Block device partitioning with GPT and MBR tables, volume creation, batch operations, and filesystem formatting via parted.
---

# Partition Editor & File Systems

The Visual Partition Editor allows technicians to initialize partition tables, create and delete volumes, and format partitions with standard filesystems using `parted` and filesystem utilities inside isolated `disk-hunter-parted` worker containers.

## Primary File Systems

| File System | Compatibility | Primary Use Case |
| --- | --- | --- |
| **ext4** | Linux Native | Default journaling Linux filesystem; recommended for Linux servers and workstation storage. |
| **NTFS** | Windows Native, Linux Read/Write | Standard filesystem for Windows installations and large external drives (`> 4 GB` files). |
| **FAT32** | Universal Compatibility | Cross-platform standard for USB flash drives and EFI partitions; maximum single file size is `4 GB`. |

## Partition Table Types (Disk Labels)

<details>
<summary><strong>GPT (GUID Partition Table)</strong></summary>

The modern partitioning standard. Required for drives larger than `2 TB`, native to UEFI boot environments, stores redundant header/CRC tables at the start and end of the disk, and supports up to 128 primary partitions by default.

</details>

<details>
<summary><strong>MSDOS (Master Boot Record / MBR)</strong></summary>

The legacy BIOS partition table format. Limited to a maximum addressable disk size of `2 TB` and up to 4 primary partitions (or 3 primary partitions plus an extended partition).

</details>

<details>
<summary><strong>Specialized Disk Labels (AIX, BSD, Mac, Loop, Sun)</strong></summary>

Supports initializing specialized partition labels via `parted mklabel` for non-x86 or legacy environments, including AIX, BSD disklabels, Apple Partition Map (`mac`), raw loopback mapping (`loop`), and Sun SPARC disk labels.

</details>

## Supported File System Formats

<details>
<summary><strong>ext4 / ext3 / ext2</strong></summary>

The standard Linux extended filesystem family. `ext4` provides extents and journaling for reliability and performance; `ext3` offers legacy journaled compatibility; `ext2` omits journaling to minimize write amplification on flash media.

</details>

<details>
<summary><strong>ntfs</strong></summary>

Microsoft Windows New Technology File System (`mkfs.ntfs`). Supports large files (`> 4 GB`), ACL permissions, and transparent compression, with full read/write support on Linux hosts.

</details>

<details>
<summary><strong>fat32 / fat16</strong></summary>

Classic File Allocation Table formats (`mkfs.vfat`). Universally supported across Windows, macOS, Linux, UEFI firmware, and embedded devices. `FAT32` enforces a `4 GB` maximum individual file size limit.

</details>

<details>
<summary><strong>btrfs / xfs</strong></summary>

Modern high-performance Linux filesystems. `btrfs` provides copy-on-write (CoW) integrity, subvolumes, and snapshots; `xfs` is optimized for high-concurrency parallel I/O and large-capacity enterprise volumes.

</details>

## Visual Bar & History Logging

- **Interactive Partition Bar** - Displays proportional partition blocks, filesystem badges, mount states, and unallocated free space, with batch operation queues before applying changes. Unpartitioned raw disks display a `NO TABLE` indicator.
- **Partition Action History** - Every partition table creation, partition addition/deletion, and filesystem format operation is logged in `partition_history.json` (`partition_history.html`) with the client IP, target device, exact command executed, and output logs.
