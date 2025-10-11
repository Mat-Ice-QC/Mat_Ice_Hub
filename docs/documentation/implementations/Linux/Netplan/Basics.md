---
pagination_next: null
pagination_prev: null
---

# Netplan: Basics

Netplan is a powerful and easy-to-use network configuration utility for Linux, most notably on Ubuntu 17.10 and newer. It uses a human-readable YAML format to describe network interfaces, making configuration straightforward and consistent.

---

### How Netplan Works

1.  **YAML files**: You define your network configuration in `.yaml` files stored in the `/etc/netplan/` directory.
2.  **Renderers**: Netplan reads these files and generates the necessary configuration for one of its backend renderers, either `systemd-networkd` (for servers) or `NetworkManager` (for desktops).
3.  **Apply configuration**: The `sudo netplan apply` command then takes the rendered configuration and applies it to your system.

### File Structure

Netplan configuration files follow a simple, hierarchical structure.

```yaml
network:
  version: 2
  renderer: networkd # or NetworkManager
  ethernets:
    enp3s0:
      ...
  bridges:
    br0:
      ...
  wifis:
    wlan0:
      ...
```    