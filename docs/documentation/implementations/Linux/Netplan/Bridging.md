---
pagination_next: null
pagination_prev: null
---

# Netplan: Bridging Interfaces

Network bridging is a way to create a virtual switch that connects multiple network interfaces (physical or virtual) on the same host. This is a common requirement for virtualization and container technologies to allow guest systems to connect to the external network. 

With Netplan, creating a bridge involves three key steps:

1. Disable the network configuration on the physical interface(s) you want to include in the bridge.
2. Define the bridge interface, specifying the physical interfaces as its members.
3. Configure the IP address, DHCP, and other network settings on the new bridge interface, not on the physical interfaces. 

---

## Example 1: Bridge with DHCP

This example creates a bridge named `br0` and uses DHCP to automatically assign an IP address. It disables DHCP on the physical interface `enp3s0`, making it a member of the bridge.  

**File:** `/etc/netplan/50-cloud-init.yaml`

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: false
      dhcp6: false
  bridges:
    br0:
      interfaces: [enp3s0]
      dhcp4: true
```

### Steps to apply

1. Create the file with the configuration above, or edit your existing Netplan file.  
2. Apply the configuration:  
   ```bash
   sudo netplan apply
   ```
3. Verify the bridge:  
   ```bash
   ip a
   ```
   Confirm that the new `br0` interface has an IP address.  

---

## Example 2: Bridge with Static IP

For a fixed IP address, you disable DHCP on both the physical interface and the bridge itself. The IP, gateway, and DNS are then configured on the bridge.  

**File:** `/etc/netplan/50-cloud-init.yaml`

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: false
  bridges:
    br0:
      interfaces: [enp3s0]
      dhcp4: false
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

This static IP example configures IP addresses, routes, and nameservers directly under the `br0` bridge definition.  

To bridge multiple physical interfaces, list them under the `interfaces` key for the bridge, disabling DHCP on each.  

Before applying, test with:  
```bash
sudo netplan try
```

Then apply permanently:  
```bash
sudo netplan apply
```

Verify the configuration:  
```bash
netplan status
ip a
```
