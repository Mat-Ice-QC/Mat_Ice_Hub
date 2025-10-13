---
pagination_next: null
pagination_prev: null
---

# Cleaning Disks

This guide explains how to safely clean up old partitions, RAID MD arrays, ZFS pools, and LVM volumes from a given disk on a Linux system.

---

## 1. Identify the Disk

Before making any changes, identify the target disk. Replace `/dev/sdX` with your actual disk.

```bash
# List all disks
lsblk

# Show detailed disk info
sudo fdisk -l
```

---

## 2. Remove Existing Partitions

You can wipe all partitions on the disk using `wipefs` or `fdisk`.

```bash
# Show existing filesystem signatures
sudo wipefs /dev/sdX

# Remove all filesystem signatures
sudo wipefs -a /dev/sdX

# Optionally, remove partitions via fdisk
sudo fdisk /dev/sdX
# - Use 'd' to delete partitions
# - Use 'w' to write changes
```

>  Warning: This will erase all data on the disk.

---

## 3. Remove RAID MD Metadata

If the disk was part of a software RAID, clear its RAID superblock.

```bash
# Examine RAID metadata
sudo mdadm --examine /dev/sdX

# Remove RAID superblock
sudo mdadm --zero-superblock /dev/sdX
```

> This ensures the disk is no longer recognized as part of any RAID array.

---

## 4. Remove ZFS Metadata

If the disk was part of a ZFS pool, clear the ZFS labels.

```bash
# List ZFS pools
sudo zpool list

# Check which pool the disk belongs to
sudo zpool status

# Export the pool (if still active)
sudo zpool export <pool_name>

# Destroy ZFS pool (if you want to remove it entirely)
sudo zpool destroy <pool_name>

# Wipe ZFS labels from the disk
sudo wipefs -a /dev/sdX
```

> ZFS stores metadata in the first and last sectors of the disk, so wiping it removes the ZFS pool reference.

---

## 5. Remove LVM Metadata

If the disk was part of an LVM setup, remove its LVM configuration.

```bash
# List LVM physical volumes
sudo pvs

# Remove the physical volume
sudo pvremove /dev/sdX

# Optionally, remove any volume groups that are only on this disk
sudo vgdisplay
sudo vgremove <vg_name>

# Remove any logical volumes on this disk
sudo lvdisplay
sudo lvremove /dev/<vg_name>/<lv_name>
```

> This ensures that the disk is no longer recognized as part of any LVM volume group.

---

## 6. Optional: Securely Wipe the Disk

If you want to fully erase all data (including remnants of RAID, ZFS, or LVM), you can use `dd` or `shred`:

```bash
# Zero out the entire disk
sudo dd if=/dev/zero of=/dev/sdX bs=1M status=progress

# OR securely wipe
sudo shred -v /dev/sdX
```

> This can take a long time for large disks.

---

## 7. Verify the Disk is Clean

```bash
# List partitions
lsblk

# Show filesystem signatures
sudo wipefs /dev/sdX
```

The disk should now be clean and ready for new use.

---

## References

* [mdadm manual](https://man7.org/linux/man-pages/man8/mdadm.8.html)
* [ZFS on Linux Guide](https://openzfs.github.io/openzfs-docs/)
* [wipefs Documentation](https://man7.org/linux/man-pages/man8/wipefs.8.html)
* [LVM Documentation](https://man7.org/linux/man-pages/man8/lvm.8.html)
