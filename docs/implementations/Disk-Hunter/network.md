---
title: Network Page & VLANs
sidebar_label: Network Page & VLANs
sidebar_position: 9
description: Host network inspection, static/DHCP plan validation, netplan YAML generation, 802.1Q VLAN sub-interfaces, and rollback-protected apply.
---

# Network Page & VLANs

The Network page (`network.html`, also reachable by clicking the host IP pill in the top bar) allows technicians to inspect the host's active network configuration and validate proposed static, DHCP, or 802.1Q VLAN plans **without modifying the running host by default**.

:::note
The Network page is **read-only by default**. Live changes can only be applied to the running host when `NETWORK_APPLY_ENABLED=true` is set in `.env`. Even when enabled, live changes are applied via `iproute2` / `dhclient` in memory with an automatic rollback timer and are **not persistent across reboots**—the generated netplan YAML is displayed so the administrator can place it under `/etc/netplan/` manually.
:::

## Host Telemetry Displayed

<details>
<summary><strong>Network Interfaces</strong></summary>

Lists every network interface detected on the host along with its MAC address, current IPv4 and IPv6 addresses with CIDR prefix lengths, MTU, operational state (`UP` / `DOWN`), and VLAN parent linkage if applicable.

</details>

<details>
<summary><strong>Default Gateway</strong></summary>

Displays the active system default gateway IP address and the network interface to which the default route is bound.

</details>

<details>
<summary><strong>DNS Servers</strong></summary>

Lists the upstream DNS nameservers currently configured on the host (resolved from `/etc/resolv.conf` or `systemd-resolved`).

</details>

## Validating & Applying a Network Plan

<details>
<summary><strong>Static or DHCP Plan Validation</strong></summary>

Select a target interface and mode (**Static** or **DHCP**). For Static mode, enter the proposed IPv4 address, prefix length, optional gateway, and comma-separated DNS servers. Clicking **Validate** checks all inputs and renders both the exact shell commands (`ip`, `dhclient`, `resolv.conf`) and the complete **netplan v2 YAML** that would be applied, without executing any changes on the host.

</details>

<details>
<summary><strong>Apply with Automatic Rollback Timer (Disabled by Default)</strong></summary>

Applying a plan requires `NETWORK_APPLY_ENABLED=true` in `.env` and refuses to modify the management interface carrying the active session unless explicitly targeting a safe sub-interface. When an apply is triggered:

1. The backend captures a snapshot of the current interface addresses, link state, default route, and DNS configuration.
2. The proposed changes are applied and a countdown rollback timer (`30` to `300` seconds) starts.
3. If the technician does not click **Confirm** before the timer expires (for example, if the new network settings cut off connectivity), the backend automatically restores the previous addresses, routes, and DNS configuration.

</details>

:::warning
Applying an incorrect network plan over a remote session is the most common cause of lost host connectivity. Always review the validated commands first and rely on the rollback timer—only click **Confirm** once you have verified that the UI remains reachable on the new configuration.
:::

## VLAN (802.1Q) Sub-Interfaces

<details>
<summary><strong>Enable VLAN (802.1Q) Mode</strong></summary>

Check **Use VLAN (802.1Q)** in Static mode to reveal the VLAN ID input. The interface selected in the **Interface** dropdown serves as the **parent interface**, and the plan creates a tagged 802.1Q sub-interface named `<parent>.<vlan_id>` (previewed live under **VLAN sub-interface**). Because the parent interface itself is never modified, applying a VLAN sub-interface plan does not drop an existing untagged management session on the parent interface.

- **VLAN ID Range** - Integer from `1` to `4094`. Out-of-range values display a validation hint and disable the Validate button.
- **Interface Name Length (`IFNAMSIZ`)** - Linux restricts network interface names to a maximum of 15 characters. Sub-interface names exceeding 15 characters are rejected during validation.
- **Tagged Switch Port Requirement** - The upstream switch port connected to the parent interface must carry the target VLAN ID as an 802.1Q tagged VLAN; otherwise the sub-interface will not receive traffic.
- **Host Kernel `8021q` Module** - The Linux kernel `8021q` module must be available on the host. If `ip link add ... type vlan` fails because the module is not loaded, the API response instructs the administrator to run `modprobe 8021q` on the host.

</details>

<details>
<summary><strong>Set as Default Route on VLAN</strong></summary>

When a gateway IP is provided in VLAN mode, a **Set as default route** checkbox appears. When checked, applying the plan executes `ip route replace default via <gateway> dev <parent>.<vlan_id>`. If the apply is rolled back, the previous default route is automatically restored.

</details>

<details>
<summary><strong>VLAN Apply &amp; Rollback Behavior</strong></summary>

VLAN apply honors the same `NETWORK_APPLY_ENABLED=true` gate and automatic rollback timer as standard plans. If a VLAN apply rolls back, the backend deletes the `<parent>.<vlan_id>` sub-interface if it was created by that apply and restores any replaced default route. Pre-existing VLAN interfaces are not deleted on rollback. To make the VLAN configuration persistent across reboots, copy the generated netplan `vlans:` YAML block into `/etc/netplan/` on the host.

</details>

<details>
<summary><strong>Remove a VLAN Sub-Interface (`POST /api/network/vlan/remove`)</strong></summary>

Detected 802.1Q sub-interfaces display a `VLAN <id> on <parent>` badge and a **Remove** button on their interface card. Clicking **Remove** (when `NETWORK_APPLY_ENABLED=true`) runs `ip link del <device>`, removing the sub-interface and its associated routes without modifying the parent interface. Removal is refused by default if the VLAN interface carries the active HTTP client connection or the active default route unless `force=true` is explicitly passed.

</details>
