---
pagination_next: null
pagination_prev: null
---


# Netplan: Interface Bonding

Network **bonding** (also known as **link aggregation**) combines multiple network interfaces into a single logical interface to increase throughput, improve redundancy, or both.  
If one interface fails, traffic automatically switches to the others, ensuring network continuity.

With **Netplan**, setting up a bonded interface involves three main steps:

1. **Disable** individual configuration (like DHCP) on the physical interfaces you plan to bond.  
2. **Define** a bond interface that lists these physical interfaces as its members.  
3. **Configure** the IP settings (DHCP or static) on the **bond interface**, not the physical ones.

---

## Example 1: Bond with DHCP

This example creates a bond named `bond0` using **mode balance-rr** (round-robin), and assigns its IP address via **DHCP**.  
It disables DHCP on the physical interfaces `enp3s0` and `enp4s0`.

**File:** `/etc/netplan/50-bonding.yaml`

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: false
      dhcp6: false
    enp4s0:
      dhcp4: false
      dhcp6: false

  bonds:
    bond0:
      interfaces: [enp3s0, enp4s0]
      parameters:
        mode: balance-rr
        mii-monitor-interval: 100
      dhcp4: true
```

### Steps to apply

1. Save the configuration file above to `/etc/netplan/50-bonding.yaml`.  
2. Apply the configuration:  
   ```bash
   sudo netplan apply
   ```
3. Verify the bond interface:  
   ```bash
   ip a
   ```
   You should see `bond0` with an IP address obtained via DHCP.  

---

## Example 2: Bond with Static IP

This example assigns a **static IP address** to the bonded interface instead of using DHCP.

**File:** `/etc/netplan/50-bonding.yaml`

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: false
      dhcp6: false
    enp4s0:
      dhcp4: false
      dhcp6: false

  bonds:
    bond0:
      interfaces: [enp3s0, enp4s0]
      parameters:
        mode: active-backup
        primary: enp3s0
        mii-monitor-interval: 100
      dhcp4: false
      addresses:
        - 192.168.1.50/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

### Explanation

- `mode: active-backup` — Only one interface is active at a time. If the primary (`enp3s0`) fails, another interface takes over automatically.  
- `mii-monitor-interval: 100` — Checks link status every 100 ms.  
- `addresses`, `routes`, and `nameservers` — Configure static IP settings for the bonded interface.

---

### Testing and Verification

Before applying permanently, test your configuration:
```bash
sudo netplan try
```

Apply it permanently:
```bash
sudo netplan apply
```

Check the bond status:
```bash
cat /proc/net/bonding/bond0
```

Check the network interfaces:
```bash
ip a
```

---

### Common Bonding Modes

| Mode | Description |
|------|--------------|
| **balance-rr (0)** | Round-robin load balancing across all interfaces. |
| **active-backup (1)** | One interface active; others standby. High availability. |
| **balance-xor (2)** | Transmit based on hash (MAC/IP). |
| **broadcast (3)** | Sends traffic on all interfaces simultaneously. |
| **802.3ad (4)** | IEEE 802.3ad dynamic link aggregation (requires switch support). |
| **balance-tlb (5)** | Adaptive transmit load balancing. |
| **balance-alb (6)** | Adaptive load balancing (transmit + receive). |

---

With Netplan, interface bonding provides both **performance** and **resilience**.  
Always verify your configuration with `netplan status` and monitor bond health via `/proc/net/bonding/bond0`.
