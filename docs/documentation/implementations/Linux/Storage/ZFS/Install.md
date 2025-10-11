---
pagination_next: null
pagination_prev: null
---

# ZFS: Install

ZFS is a robust file system and volume manager designed for high storage capacities, data integrity, and easy management. This guide explains how to install and set up ZFS on common Linux distributions.

---


## Prerequisites

Before installing ZFS, ensure you have:

* Root or sudo privileges.
* A Linux system (Ubuntu, Debian, Fedora, CentOS, RHEL, etc.).
* At least one storage device to use for ZFS pools.

---

## Ubuntu / Debian

1. **Update your package list:**

```bash
sudo apt update
```

2. **Install ZFS utilities:**

```bash
sudo apt install zfsutils-linux zfs-dkms -y
```

3. **Load the ZFS kernel module:**

```bash
sudo modprobe zfs
```

---

## CentOS / RHEL / Fedora

1. **Enable EPEL and ZFS repositories:**

```bash
sudo dnf install -y epel-release
sudo dnf install -y https://zfsonlinux.org/epel/zfs-release.el8_8.noarch.rpm
```

2. **Import the ZFS repository key:**

```bash
sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-zfsonlinux
```

3. **Install ZFS packages:**

```bash
sudo dnf install -y zfs
```

4. **Load the ZFS kernel module:**

```bash
sudo modprobe zfs
```

---

## Verifying Installation

Check if ZFS is installed correctly:

```bash
zfs version
```

You should see output similar to:

```
zfs-2.1.9-1
zfs-kmod-2.1.9-1
```

---

## References

* [Official ZFS on Linux Documentation](https://openzfs.github.io/openzfs-docs/)
* [Ubuntu ZFS Guide](https://help.ubuntu.com/community/ZFS)
