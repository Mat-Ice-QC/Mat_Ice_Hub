---
title: S.M.A.R.T. Health Testing
sidebar_label: S.M.A.R.T. Health Testing
sidebar_position: 6
description: S.M.A.R.T. short and extended self-tests, parsed NVMe/U.2/U.3 health attributes, raw telemetry tables, and 30-second cached queries.
---

# S.M.A.R.T. Health Testing

Self-Monitoring, Analysis, and Reporting Technology (S.M.A.R.T.) provides early warning indicators for mechanical and flash drive degradation. Disk Hunter queries `smartctl` through the dedicated `disk-hunter-smart-provider` microservice and spawns `disk-hunter-smartctl-test` workers to execute background self-tests.

## Diagnostic & Telemetry Options

<details>
<summary><strong>Short Self-Test (~2 Minutes)</strong></summary>

A rapid, non-destructive hardware sanity check (`smartctl -t short`). Evaluates electrical interfaces, controller logic, head positioning mechanisms (on HDDs), and read/write buffer integrity alongside a sample of media sectors.

</details>

<details>
<summary><strong>Extended (Long) Self-Test (Hours)</strong></summary>

An exhaustive, non-destructive surface scan (`smartctl -t long`) that reads every addressable sector on the drive to identify weak sectors, read instability, and pending sector reallocations. Recommended when onboarding used or suspect drives.

</details>

<details>
<summary><strong>Raw S.M.A.R.T. Attribute Logs & Self-Test Log Modal</strong></summary>

Clicking **Details** on a SATA/SAS drive loads the full raw S.M.A.R.T. attribute table, including ID, attribute name, current/worst/threshold values, and raw counters (such as Reallocated Sector Count, Current Pending Sector Count, Uncorrectable Sector Count, Power-On Hours, and Wear Leveling Count). Technicians can also open the **Self-Test Log** modal to inspect historical self-test entries stored in the drive's firmware log.

</details>

<details>
<summary><strong>NVMe, U.2 & U.3 Parsed Health Attributes</strong></summary>

NVMe drives—including enterprise U.2 and U.3 form-factors—expose a structured controller health log rather than legacy ATA attribute IDs. Disk Hunter parses and renders the NVMe health log into an annotated table covering:

- Critical Warning bits
- Temperature (Celsius)
- Available Spare and Available Spare Threshold
- Percentage Used (endurance wear indicator)
- Data Units Read and Data Units Written
- Host Read/Write Commands
- Controller Busy Time
- Power Cycles and Power-On Hours
- Unsafe Shutdowns
- Media and Data Integrity Errors
- Error Information Log Entries

Each metric is evaluated against published specification thresholds and labeled with an `OK`, `WARN`, or `FAIL` status badge.

</details>

<details>
<summary><strong>S.M.A.R.T. Action History</strong></summary>

Every initiated self-test is recorded in the S.M.A.R.T. Test History table using the unified column layout (`Timestamp | User IP | Drive / Target | Status | Event / Details`). Clicking any history row opens the command detail modal showing the exact `smartctl` command executed, the drive serial and mapped Inventory ID, and the captured output log with a **Copy** button.

</details>

:::note
To prevent unnecessary disk activity and keep drives from spinning up on every UI poll, `disk-hunter-smart-provider` caches S.M.A.R.T. attribute responses globally for **30 seconds**. Manual browser refreshes reuse the cached snapshot until the 30-second TTL expires.
:::
