---
pagination_next: null
pagination_prev: null
---

# RAID MD: Basics

RAID (Redundant Array of Independent Disks) is a technology that allows combining multiple physical disks into a single logical unit for **redundancy, performance, or both**. In Linux, the `mdadm` tool is the standard utility for managing software RAID arrays.

---
## What is RAID?

RAID combines multiple disks into one logical storage unit. The main purposes are:

* **Redundancy:** Protect against disk failures.
* **Performance:** Improve read/write speeds.
* **Capacity:** Aggregate multiple disks into a single volume.

RAID can be implemented in **hardware** (via RAID controllers) or **software** (using Linux `mdadm`).

---

## RAID Levels

Common software RAID levels in Linux:

| Level       | Description                                  | Minimum Disks | Pros                          | Cons                             |
| ----------- | -------------------------------------------- | ------------- | ----------------------------- | -------------------------------- |
| **RAID 0**  | Striping                                     | 2             | High performance              | No redundancy                    |
| **RAID 1**  | Mirroring                                    | 2             | Redundancy                    | High disk overhead               |
| **RAID 4**  | Block-level striping with parity             | 3             | Fault tolerance               | Parity bottleneck                |
| **RAID 5**  | Block-level striping with distributed parity | 3             | Fault tolerance + performance | Rebuild can be slow              |
| **RAID 6**  | Like RAID 5 but with double parity           | 4             | Can tolerate 2 disk failures  | Slower writes                    |
| **RAID 10** | Stripe of mirrors                            | 4             | High performance + redundancy | Expensive (50% storage overhead) |

---

## Installing `mdadm`

To install `mdadm`:

```bash
sudo apt update
sudo apt install mdadm -y   # Debian/Ubuntu
# OR
sudo yum install mdadm -y   # RHEL/CentOS
```

Verify installation:

```bash
mdadm --version
```

---

## Creating a RAID Array

### Step 1: Identify Disks

```bash
lsblk
```

Make sure the disks are unmounted and do not contain important data.

### Step 2: Create the RAID

Example: Create a RAID 5 with three disks (`/dev/sdb`, `/dev/sdc`, `/dev/sdd`):

```bash
sudo mdadm --create --verbose /dev/md0 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd
```

### Step 3: Verify RAID Creation

```bash
cat /proc/mdstat
```

### Step 4: Format and Mount the RAID

```bash
sudo mkfs.ext4 /dev/md0
sudo mkdir -p /mnt/raid
sudo mount /dev/md0 /mnt/raid
```

### Step 5: Persist RAID Configuration

```bash
sudo mdadm --detail --scan >> /etc/mdadm/mdadm.conf
```

---

## Managing RAID Arrays

* **Check RAID details:**

```bash
sudo mdadm --detail /dev/md0
```

* **Stop RAID array:**

```bash
sudo mdadm --stop /dev/md0
```

* **Remove RAID array:**

```bash
sudo mdadm --remove /dev/md0
```

* **Add a new disk to RAID:**

```bash
sudo mdadm --add /dev/md0 /dev/sde
```

---

## Monitoring RAID

* **Check status:**

```bash
cat /proc/mdstat
```

* **Check RAID health:**

```bash
sudo mdadm --detail /dev/md0
```

* **Set up email notifications:**

Edit `/etc/mdadm/mdadm.conf` to include:

```text
MAILADDR admin@example.com
```

---

## References

* [mdadm Manual](https://man7.org/linux/man-pages/man8/mdadm.8.html)
* [Linux RAID Wiki](https://wiki.archlinux.org/title/RAID)
