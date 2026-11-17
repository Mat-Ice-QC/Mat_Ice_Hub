---
title: Native NVMe Secure Erase
sidebar_label: Native NVMe Secure Erase
sidebar_position: 5
description: Hardware-level NVMe sanitization using nvme-cli with User Data Format (SES=1) and Cryptographic Erase (SES=2).
---

# Native NVMe Secure Erase

NVMe solid-state drives (including M.2, U.2, U.3, and PCIe add-in cards) support hardware-level secure erasure executed directly by the drive's internal controller via `nvme-cli`. Hardware-initiated NVMe formatting completes orders of magnitude faster than block-by-block software overwrite methods while avoiding unnecessary NAND flash wear.

## Secure Erase Format Options

<details>
<summary><strong>User Data Format (SES=1)</strong></summary>

Instructs the internal NVMe SSD controller (`nvme format --ses=1`) to physically erase all user data blocks across the NAND flash media. This destructive operation clears all user-accessible flash cells and typically completes within 1 to 2 minutes depending on drive capacity and controller design.

</details>

<details>
<summary><strong>Cryptographic Format (SES=2)</strong></summary>

Instructs the NVMe controller (`nvme format --ses=2`) to destroy the internal media encryption key (MEK) used to encrypt data at rest and generate a new random key. Because the previous key is permanently erased, all existing ciphertext on the NAND flash becomes immediately unrecoverable. Completes in a few seconds.

</details>

<details>
<summary><strong>Controller Compatibility & Automatic Fallback</strong></summary>

Not all NVMe controllers implement Cryptographic Erase (`SES=2`) or User Data Erase (`SES=1`). The Disk Hunter NVMe worker (`workers/nvme/run_wipe.sh`) inspects the controller's format capabilities and attempts the requested mode, falling back from Cryptographic Format to User Data Format when supported. If hardware secure erase is rejected by the controller, the backend reports a warning status and directs the technician to use block-level overwriting (`nwipe` Fill Zeros, PRNG, or DoD) in the Disk Shredding tab.

</details>

:::important
To execute NVMe administrative format commands inside an isolated Docker worker container, Disk Hunter mounts both the character controller device (for example `/dev/nvme0`) and the block namespace device (for example `/dev/nvme0n1`) into the container so `nvme-cli` can issue the required admin `ioctl` command sequences.
:::
