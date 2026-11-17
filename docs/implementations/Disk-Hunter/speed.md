---
title: Drive Speed Benchmarks (fio)
sidebar_label: Drive Speed Benchmarks (fio)
sidebar_position: 7
description: Sequential read, write, and full-duplex I/O performance benchmarking using fio inside isolated worker containers.
---

# Drive Speed Benchmarks (fio)

Disk Hunter executes I/O throughput benchmarks using `fio` (Flexible I/O Tester) inside isolated `disk-hunter-speedtest-worker` containers to profile sequential read and write transfer rates across mounted partitions.

## Speed Test Modes

<details>
<summary><strong>Read Only</strong></summary>

Measures sequential read throughput on the selected partition. Read-only benchmarks do not modify user files on the filesystem.

</details>

<details>
<summary><strong>Write Only</strong></summary>

Measures sequential write throughput by allocating and writing a temporary benchmark file (`.fio_test`) inside the mounted partition filesystem. The temporary file is automatically deleted when the benchmark completes or is stopped.

</details>

<details>
<summary><strong>Read &amp; Write</strong></summary>

Executes sequential read and write workloads to profile bidirectional I/O throughput and sustained controller performance.

</details>

## Test Size Options

<details>
<summary><strong>1 GB Block Size</strong></summary>

A fast, lightweight benchmark payload suitable for quick verification of USB flash media, SD cards, and standard hard drives.

</details>

<details>
<summary><strong>10 GB Block Size</strong></summary>

A medium-duration benchmark payload designed to exceed small DRAM/SLC controller caches and measure sustained read/write throughput. Requires at least **11 GB** of free space on the target partition.

</details>

<details>
<summary><strong>100 GB Block Size</strong></summary>

An intensive, enterprise-grade benchmark payload for high-performance SATA/SAS SSDs and NVMe drives, profiling sustained throughput under prolonged heavy I/O load. Requires at least **101 GB** of free space on the target partition.

</details>

<details>
<summary><strong>All (1 GB, 10 GB, 100 GB)</strong></summary>

Runs a sequential benchmark suite across all three payload sizes in order (`1G` -> `10G` -> `100G`). The worker automatically skips larger test sizes when the target partition does not meet the minimum capacity threshold (`11 GB` for `10G`; `101 GB` for `100G`).

</details>

:::important
Speed test benchmark files (`.fio_test`) are allocated inside the target partition's mounted filesystem rather than writing directly to raw block device nodes (`/dev/sdX`), preventing accidental corruption of partition tables or existing filesystem structures.
:::
