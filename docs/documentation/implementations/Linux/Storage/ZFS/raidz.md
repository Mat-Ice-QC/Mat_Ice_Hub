---
pagination_next: null
pagination_prev: null
---


# ZFS: RAIDZ2 and RAIDZ3 

## What is RAIDZ?
**RAIDZ** is ZFS’s version of RAID (Redundant Array of Independent Disks), designed to offer data redundancy and protection against disk failures.

Unlike traditional RAID, **RAIDZ** avoids the "write hole" problem by ensuring all data and parity are written atomically, maintaining consistent and reliable storage.

---

## RAIDZ Levels Overview

| RAIDZ Level | Fault Tolerance | Parity Disks | Usable Space Formula | Recommended Minimum Disks |
|--------------|----------------|---------------|------------------------|-----------------------------|
| RAIDZ1 | 1 disk failure | 1 | (N - 1) × Disk Size | 3 |
| **RAIDZ2** | **2 disk failures** | **2** | **(N - 2) × Disk Size** | **4** |
| **RAIDZ3** | **3 disk failures** | **3** | **(N - 3) × Disk Size** | **5** |

---

## RAIDZ2: Double Parity Protection

### Description
RAIDZ2 stores **two parity blocks** for every stripe of data.  
This means it can survive **two simultaneous disk failures** without losing data.

### Example
If you have 6 drives of 4TB each:

```
Usable Capacity = (6 - 2) × 4TB = 16TB usable
```

### Pros
- Protects against two drive failures  
- Good balance between performance and redundancy  
- Excellent for medium to large storage systems  

### Cons
- Slightly reduced write performance compared to RAIDZ1  
- More storage overhead due to extra parity blocks  

### Example Command
```bash
zpool create tank raidz2 /dev/sda /dev/sdb /dev/sdc /dev/sdd /dev/sde /dev/sdf
```

---

## RAIDZ3: Triple Parity Protection

### Description
RAIDZ3 provides **three parity blocks** per stripe.  
It can tolerate **up to three disk failures** — ideal for large or critical storage pools.

### Example
If you have 8 drives of 4TB each:

```
Usable Capacity = (8 - 3) × 4TB = 20TB usable
```

### Pros
- Can survive three simultaneous disk failures  
- Highest level of redundancy in ZFS RAIDZ  
- Excellent for mission-critical or large-capacity pools  

### Cons
- Lower usable capacity due to triple parity  
- Slightly slower writes compared to RAIDZ2  

### Example Command
```bash
zpool create backup raidz3 /dev/sda /dev/sdb /dev/sdc /dev/sdd /dev/sde /dev/sdf /dev/sdg /dev/sdh
```

---

## Choosing Between RAIDZ2 and RAIDZ3

| Use Case | Recommended RAIDZ Level |
|-----------|------------------------|
| Home NAS or small server | RAIDZ1 or RAIDZ2 |
| Medium business storage | RAIDZ2 |
| Enterprise or mission-critical data | RAIDZ3 |
| Large-capacity pools (>10 drives) | RAIDZ3 for extra safety |

---

## Summary
- **RAIDZ2** protects against two disk failures — ideal for reliability and capacity balance.  
- **RAIDZ3** protects against three disk failures — best for maximum data safety.  

Both are part of ZFS’s powerful, self-healing, and flexible storage system that ensures data integrity even in large-scale environments.
