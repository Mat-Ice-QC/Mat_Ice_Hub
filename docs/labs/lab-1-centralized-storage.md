---
id: lab-1-centralized-storage
title: "Laboratory 1: Running VMs from Centralized Storage"
sidebar_label: "Lab 1: Centralized Storage"
---

# Laboratory 1: Running VMs/Computers from Centralized Storage

This laboratory focuses on running virtual machines (VMs) or bare-metal compute nodes entirely off centralized, high-capacity storage pools, rather than local disks. This architectural pattern allows for high availability, easier backups, thin provisioning, and fluid migration of workloads between compute hosts.

## 1. Storage Protocols and Technologies

Centralized storage fundamentally requires robust network protocols to serve disks to remote clients. These break down into two categories: block-level and file-level storage.

### Block Storage (iSCSI, Fibre Channel, NVMe-oF)
Block storage presents a raw storage volume over the network. The compute node treats it as a physical hard drive, formatting it with its own local filesystem (like ext4, VMFS, NTFS, or Cluster Shared Volumes).
- **iSCSI (Internet Small Computer Systems Interface):** Uses standard Ethernet networks. Extremely common for VM datastores due to its balance of performance, low cost, and wide support across hypervisors (Proxmox, ESXi, Hyper-V).
- **NVMe-oF (NVMe over Fabrics):** Provides significantly lower latency and higher IOPS by extending the NVMe protocol across RDMA or TCP networks. Ideal for high-performance databases.

### File-Level Storage (NFS, SMB/CIFS)
File storage presents a pre-formatted filesystem over the network. The hypervisor or compute node mounts the shared folder and places VM disk images (`.qcow2`, `.vmdk`, etc.) inside it.
- **NFS (Network File System):** A staple in Unix/Linux environments. NFSv3 and NFSv4 are widely supported by hypervisors for storing VM images. Excellent for shared access.
- **SMB/CIFS (Server Message Block):** The Windows-native standard. Supported by Hyper-V and increasingly other hypervisors. Often requires specific configuration (SMB 3.0+) for VM hosting to ensure proper file locking and performance.

---

## 2. Architectural Setup

A typical lab setup separates the **Storage Node** (SAN/NAS) from the **Compute Node(s)** (Hypervisors).

### Components
1.  **Storage Node (Target):**
    *   **OS:** TrueNAS SCALE, OpenMediaVault, or standard Linux/FreeBSD.
    *   **Storage Pool:** ZFS is highly recommended for its snapshot capabilities, caching (ARC/L2ARC), and data integrity.
    *   **Network Interface:** 10GbE or faster is crucial for avoiding network bottlenecks.
2.  **Compute Node(s) (Initiator/Client):**
    *   **OS/Hypervisor:** Proxmox VE, VMware ESXi, or Windows Server Hyper-V.
    *   **Network Interface:** Dedicated storage NIC (often on a separate VLAN) to segregate storage traffic from VM traffic.
3.  **Network Fabric:**
    *   A high-speed switch connecting the compute and storage nodes. Using Jumbo Frames (MTU 9000) is standard practice to reduce CPU overhead and improve throughput.

---

## 3. Configuration & Exact Replication Steps

Here is a practical guide to setting up an **iSCSI** target on a Linux/ZFS storage node and consuming it on a Proxmox VE compute node.

### Phase 1: Storage Node (Target Setup)
*Assuming a Debian/Ubuntu-based system with ZFS installed.*

1.  **Create a ZFS Zvol (Block Device):**
    Create a 500GB volume named `vm-storage` inside your `tank` pool.
    ```bash
    sudo zfs create -V 500G tank/vm-storage
    ```

2.  **Install iSCSI Target Software (TargetCLI):**
    ```bash
    sudo apt update
    sudo apt install targetcli-fb
    ```

3.  **Configure the iSCSI Target:**
    Enter the targetcli shell:
    ```bash
    sudo targetcli
    ```
    Inside the shell, execute the following commands:
    ```text
    /> backstores/block create name=vm-storage dev=/dev/zvol/tank/vm-storage
    /> iscsi/ create iqn.2023-10.com.example:storage.target1
    /> iscsi/iqn.2023-10.com.example:storage.target1/tpg1/luns create /backstores/block/vm-storage
    /> iscsi/iqn.2023-10.com.example:storage.target1/tpg1/portals create 0.0.0.0
    /> iscsi/iqn.2023-10.com.example:storage.target1/tpg1 set attribute authentication=0 demo_mode_write_protect=0 generate_node_acls=1 cache_dynamic_acls=1
    /> exit
    ```
    *(Note: This configures unauthenticated access for lab purposes. In production, configure CHAP authentication and restrict ACLs to specific initiator IQNs).*

### Phase 2: Compute Node (Proxmox VE - Initiator Setup)

1.  **Log into the Proxmox Web GUI.**
2.  Navigate to **Datacenter -> Storage -> Add -> iSCSI**.
3.  **Configure the iSCSI Connection:**
    *   **ID:** `remote-iscsi`
    *   **Portal:** `[IP_Address_of_Storage_Node]`
    *   **Target:** Select the target IQN (`iqn.2023-10.com.example:storage.target1`) from the dropdown.
    *   **Use LUNs directly:** Uncheck (unless passing raw LUNs to VMs). We will use LVM on top.
4.  **Create LVM on the iSCSI Target:**
    *   Go to **Datacenter -> Storage -> Add -> LVM**.
    *   **ID:** `remote-lvm`
    *   **Base storage:** Select the `remote-iscsi` storage created above.
    *   **Base volume:** Select the LUN.
    *   **Volume group:** Name it `vg-remote-vm`.
    *   **Shared:** Check this box (crucial if you have multiple Proxmox nodes).
5.  **Create a VM:**
    When creating a new virtual machine, select `remote-lvm` as the storage for the Hard Disk. The VM will now boot and run entirely over the network.

---

## 4. Performance Considerations

Running VMs over a network requires careful tuning to approach local-disk performance.

*   **Network Bandwidth & Latency:** 1GbE limits you to ~110MB/s, which is slower than a standard SATA SSD. 10GbE (~1.1GB/s) or 40GbE is strongly recommended. Use dedicated physical switches or isolated VLANs to prevent congestion.
*   **Jumbo Frames:** Set the MTU to 9000 on the storage NICs, compute NICs, and the switch ports connecting them. This drastically reduces the number of packets required to transfer large storage blocks.
*   **Caching Structure (ZFS):** If using ZFS, ensure adequate RAM for the ARC. Consider an NVMe drive for an SLOG (ZFS Intent Log) if you are dealing with synchronous writes (databases, NFS).
*   **Protocol Overhead:** iSCSI generally provides lower CPU overhead and better random I/O latency than NFS, but NFS is significantly easier to manage and configure for shared storage clusters.
*   **Multipathing (MPIO):** For high availability and load balancing, configure iSCSI Multipathing to utilize multiple network links simultaneously.
