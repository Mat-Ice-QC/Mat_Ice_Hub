---
pagination_next: null
pagination_prev: null
---

# ZFS: Basics 


## What is ZFS?
**ZFS (Zettabyte File System)** is a combined file system and logical volume manager originally developed by Sun Microsystems. It’s designed to provide high storage capacity, reliability, and ease of management.

---

## Key Features

### 1. **Pooled Storage**
Unlike traditional file systems that manage disks individually, ZFS uses a **storage pool (zpool)**.  
This allows multiple drives to be grouped together, with the file system dynamically allocating space across them as needed.

### 2. **Data Integrity**
ZFS uses **checksums** to verify data integrity.  
Whenever data is read, ZFS checks its checksum to ensure it hasn’t been corrupted — if it detects an error and redundancy is available, it automatically repairs the data.

### 3. **Snapshots and Clones**
- **Snapshots**: Read-only points-in-time of the file system that can be used for backups or restores.
- **Clones**: Writable copies of snapshots, useful for testing or versioning data.

### 4. **Compression and Deduplication**
ZFS supports **on-the-fly compression** and **deduplication** to save disk space and optimize performance.

### 5. **RAID-Z**
ZFS introduces **RAID-Z**, an improved form of RAID that protects against data loss due to disk failure and eliminates the “write hole” problem present in traditional RAID.

---

## Basic Structure

- **Pool (zpool)** → Group of disks managed together.
- **Dataset** → A file system or volume within the pool.
- **Snapshot/Clone** → Data versions or copies of datasets.

---

## Basic ZFS Commands

1. **Create a ZFS pool:**

```bash
sudo zpool create mypool /dev/sdb
```

2. **Check pool status:**

```bash
sudo zpool status
```

3. **Create a ZFS filesystem:**

```bash
sudo zfs create mypool/mydata
```

4. **List ZFS filesystems:**

```bash
zfs list
```

5. **Destroy a ZFS pool (Warning: Data loss!):**

```bash
sudo zpool destroy mypool
```