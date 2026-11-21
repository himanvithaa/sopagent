# STANDARD OPERATING PROCEDURE
## IT Network Troubleshooting and Incident Resolution
**Document ID:** SOP-IT-002  
**Version:** 3.0  
**Effective Date:** 2026-05-15  
**Review Cycle:** Semi-Annual  
**Classification:** Enterprise IT Operations Standard  

---

### 1. Document Overview & Metadata
* **Document ID:** SOP-IT-002
* **Version:** 3.0 (Supersedes Rev 2.0)
* **Title:** IT Network Troubleshooting and Incident Resolution Standard Operating Procedure
* **Effective Date:** May 15, 2026
* **Target Audience:** Network Operations Center (NOC) Engineers, Tier 1–3 Service Desk Specialists, Cloud Infrastructure Engineers, IT Incident Commanders
* **Scope of Infrastructure:** Enterprise Core Switches, Edge Routers, SD-WAN Gateways, Wireless Access Controllers, Next-Gen Firewalls, DNS/DHCP Services

---

### 2. Purpose
The purpose of this SOP is to establish a unified, disciplined methodology for identifying, triaging, troubleshooting, escalating, and resolving enterprise network anomalies and outages. By defining deterministic diagnostics, standardized ticket taxonomy, and explicit escalation thresholds, this procedure guarantees rapid Mean Time to Resolution (MTTR target < 45 minutes for P2, < 15 minutes for P1), preserves business continuity, and ensures rigorous auditability across all infrastructure domains.

---

### 3. Scope
This SOP covers:
* Enterprise campus local area networks (LAN) and virtual local area networks (VLANs).
* Software-Defined Wide Area Network (SD-WAN) and multiprotocol label switching (MPLS) circuits.
* Enterprise 802.11ax Wi-Fi infrastructure and authentication gateways (802.1X / RADIUS).
* Perimeter and internal Next-Generation Firewalls (NGFW), IPsec VPN tunnels, and BGP peering.
* Core network services including redundant Active Directory integrated DNS and high-availability DHCP failover clusters.

*Exclusions:* Individual client workstation OS repairs, hardware motherboards, and SaaS vendor internal software bugs outside enterprise network boundaries.

---

### 4. Roles & Responsibilities

| Role | Key Operational Responsibilities |
|---|---|
| **Tier 1 Service Desk Specialist** | First responder: intake incident, gather standardized triage telemetry, verify physical/link layer status, execute initial diagnostics, assign severity level. |
| **Tier 2 Network Operations Center (NOC) Engineer** | Intermediate triage: analyze switch MAC address tables, trace VLAN tagging, check routing tables, review firewall packet drops, inspect DHCP scopes. |
| **Tier 3 Principal Network Architect** | Advanced engineering: diagnose dynamic BGP routing flaps, multi-site SD-WAN policy failures, Core MTU misconfigurations, and complex packet captures. |
| **IT Incident Commander (P1/P2 Major Outages)** | Manage incident bridge, coordinate cross-functional communications, authorize emergency changes, lead stakeholder updates and Post-Incident Reviews. |

---

### 5. Initial Incident Identification & Triage
Incident ingestion occurs through three distinct channels:
1. **Automated Monitoring Alert:** SolarWinds, Datadog, Prometheus, or Cisco DNA Center triggers an automated webhook alert into the ITSM queue (ServiceNow / Jira Service Management).
2. **User / Helpdesk Ticket Submission:** End-user submits ticket via Employee Self-Service portal or calls the urgent IT Hotline.
3. **Infrastructure Syslog Trigger:** High-severity syslog notifications (Level 0 Emergency to Level 2 Critical) received by the centralized SIEM.

**Severity Level Matrix:**
* **P1 – Critical Outage (MTTR Target < 15m):** Total failure of core network switch, loss of primary data center uplink, collapse of enterprise DNS/DHCP cluster, or entire site offline.
* **P2 – High Degradation (MTTR Target < 45m):** Redundant firewall failover event, loss of one redundant ISP circuit, Wi-Fi outage affecting an entire floor or department (>50 users).
* **P3 – Moderate Disruption (MTTR Target < 4h):** Single access switch port failure, intermittent packet loss (<5%) on branch site, single user VPN authentication failure.
* **P4 – Minor Request / Anomaly (MTTR Target < 24h):** Static IP reservation request, minor DNS alias creation, non-critical telemetry reporting issue.

---

### 6. Standardized Information Collection
Before modifying any configuration or escalating, the initial responder must gather and log the following 7 mandatory data points in the ticket:
1. **Source Host & Identifier:** IP address, MAC address, hostname, operating system, and physical workstation location (Building, Floor, Desk).
2. **Target Destination:** Fully qualified domain name (FQDN), destination IP, and destination port (e.g., `erp.corp.internal:443`).
3. **Exact Error Manifestation:** Specific error codes (e.g., `DNS_PROBE_FINISHED_NXDOMAIN`, `ERR_CONNECTION_TIMED_OUT`, `HTTP 502 Bad Gateway`).
4. **Scope & Breadth:** Number of users affected (Single user, specific department, entire subnet, or site-wide).
5. **Timeline & Triggers:** Exact timestamp of first failure, whether the failure is continuous or intermittent, and any recent changes (patching, cabling).
6. **Network Connectivity Type:** Wired Gigabit Ethernet (Port ID / Patch Panel ID), Corporate 802.1X Wi-Fi, or Remote IPsec/SSL VPN.
7. **Initial Command Outputs:** Raw outputs from `ipconfig /all`, `ping <gateway_ip>`, `ping 8.8.8.8`, `tracert -d <dest_ip>`, and `nslookup <target_fqdn>`.

---

### 7. Step-by-Step Network Troubleshooting Workflow

#### Phase 1: Physical & Data Link Layer Verification (OSI Layers 1 & 2)
1. Verify Ethernet patch cable integrity: check link speed/duplex LED status on wall jack and network switch port.
2. Log in to access switch CLI; check port status: `show interface GigabitEthernet 1/0/12 status`. Verify port is up/up.
3. Check for physical errors: `show interface GigabitEthernet 1/0/12 | include CRC|errors|drops`. If CRC counter increments, replace patch cable and patch panel jack.
4. Check MAC address learning: `show mac address-table interface Gi1/0/12`. Confirm host MAC is correctly learned on the expected Access VLAN.
5. Inspect Spanning Tree state: `show spanning-tree interface Gi1/0/12`. Ensure port is in `FWD` (Forwarding) and not blocked by BPDU Guard.

#### Phase 2: Network & Addressing Verification (OSI Layer 3)
1. Verify client IP address allocation. Ensure IP is not in APIPA range (`169.254.x.x`).
2. Test default gateway reachability: run continuous ping `ping -t <gateway_ip>` (latency must be < 1 ms on local wired LAN).
3. If gateway is unreachable, verify ARP resolution on host: `arp -a`. Check whether the gateway IP matches the expected router VIP/MAC.
4. Check DHCP server scope status: inspect DHCP server console to verify free address capacity (>10% free pool remaining).
5. Check dynamic routing state: on core router, execute `show ip route <destination_ip>` and verify active route, metric, and next-hop reachability.

#### Phase 3: Transport, Firewall & Service Verification (OSI Layers 4–7)
1. Test TCP port accessibility from client using PowerShell: `Test-NetConnection -ComputerName <dest_ip> -Port <port_number>`.
2. Review Next-Generation Firewall live traffic logs: filter by Source IP, Destination IP, and Destination Port.
3. Check for dropped packets or security policy denials: inspect firewall threat inspection logs, SSL decryption engine, and IPS signatures.
4. Verify DNS resolution: execute `nslookup <target_fqdn> <dns_server_ip>` to ensure DNS forward lookup succeeds without timeout or NXDOMAIN.
5. If intermediate path issues occur, run MTU path discovery: `ping -f -l 1472 <dest_ip>` to check for packet fragmentation or black-hole routers.

#### Phase 4: Resolution Application & Change Control
1. If configuration changes are required on switches/firewalls, adhere to standard change control protocols.
2. In emergency P1 scenarios, acquire emergency change authorization from the on-call Incident Commander before writing changes.
3. Apply remediations: port un-shut, VLAN re-assignment, DHCP lease flush, firewall rule update, or routing policy route-map fix.

#### Phase 5: Verification & Ticket Closure
1. Conduct user-side validation: request user execute end-to-end operational workflow.
2. Confirm synthetic monitoring probes turn green in Datadog/SolarWinds dashboards.
3. Document root cause, resolution steps, and remediation timestamps in ticket before marking Resolved.

---

### 8. Common Network Problems and Documented Resolutions

| Observed Network Problem | Diagnostic Indicators & CLI Output | Documented Step-by-Step Resolution |
|---|---|---|
| **DHCP Scope Exhaustion (APIPA Address)** | Client receives `169.254.x.x` address; DHCP console displays 100% address utilization on VLAN subnet. | 1. Access Infoblox/Windows DHCP Server console.<br>2. Reclaim expired and abandoned reservations.<br>3. Expand subnet mask (e.g., from `/24` to `/23`) or lower DHCP lease time from 8 days to 4 hours in high-turnover zones.<br>4. Run `ipconfig /release && ipconfig /renew` on client. |
| **DNS Resolution Failure (NXDOMAIN)** | `nslookup` returns `*** Can't find server` or `Non-existent domain`; client can ping raw IP but cannot open domain URLs. | 1. Verify Active Directory integrated DNS service status: `Get-Service DNS`.<br>2. Check upstream DNS forwarders (e.g., 1.1.1.1 / 8.8.8.8) responsiveness.<br>3. Flush client DNS cache: `ipconfig /flushdns`.<br>4. Restart DNS service if replication storm occurs; re-test with `Resolve-DnsName`. |
| **VLAN Port Misconfiguration** | Client links up (amber LED), but cannot ping local default gateway; port assigned to incorrect VLAN ID. | 1. Run `show mac address-table interface <port>` to identify host MAC.<br>2. Verify port VLAN: `show interface <port> switchport`.<br>3. Enter configuration mode and assign correct VLAN: `interface Gi1/0/14`, `switchport access vlan 20`, `spanning-tree portfast`.<br>4. Re-check IP connectivity. |
| **Duplex / Speed Mismatch** | Heavy packet loss (>20%), high input error counters, late collisions reported on switch port: `show int <port>`. | 1. Identify mismatch: switch set to hardcoded 1000/Full while client NIC set to Auto-Negotiate.<br>2. Standardize interface configuration: `speed auto`, `duplex auto` on both ends.<br>3. Replace damaged Cat6 patch cable if 1000BASE-T fallback occurs due to wire pair attenuation. |
| **Next-Gen Firewall Security Policy Block** | TCP SYN sent from host, no SYN-ACK returned; firewall logs report `Action: Deny / Rule: CleanUp-Drop`. | 1. Open Palo Alto / Fortinet Firewall monitor log.<br>2. Filter by `(addr.src in <host_ip>) and (addr.dst in <target_ip>)`.<br>3. Verify security policy zoning (e.g., `Trust` to `Untrust` or `Branch` to `DMZ`).<br>4. Create formal Change Request (CR) to authorize required application service ports. |

---

### 9. Escalation Procedure
When an incident cannot be resolved within designated service thresholds, strict escalation protocols must be triggered:
* **Tier 1 to Tier 2 Escalation:**
  * *Threshold:* Elapsed troubleshooting time exceeds 15 minutes without root cause identification, or 5+ users report identical symptoms.
  * *Action:* Tier 1 updates ticket with all collected diagnostic data, sets ticket status to "Escalated to Tier 2", and alerts NOC Shift Lead via Teams/Slack channel `#noc-escalations`.
* **Tier 2 to Tier 3 Escalation:**
  * *Threshold:* Elapsed troubleshooting time exceeds 30 minutes, issue involves core routing (BGP/OSPF), data center spine-leaf fabrics, enterprise firewalls, or WAN carrier circuit failure.
  * *Action:* Tier 2 contacts Tier 3 On-Call Senior Engineer via PagerDuty and opens an active troubleshooting conference bridge.
* **P1 Critical Major Incident Escalation:**
  * *Threshold:* Severe business impact: entire site down, customer-facing revenue applications unreachable, loss of hospital/plant industrial operations.
  * *Action:* Immediately declare P1 Major Incident. PagerDuty auto-dials the IT Incident Commander, VP of Infrastructure, and Lead Network Architect within 5 minutes. Bridge opened: `bridge.corp.internal/p1-major`.

---

### 10. Resolution Verification Checklist
Before any network incident ticket can be marked as Resolved, the following 5 verification criteria must be fulfilled:
1. **User Confirmation:** Direct verification with affected user or department lead that applications and systems are fully functional.
2. **Ping & Latency Verification:** Zero packet loss over 100 consecutive ICMP packets; round-trip latency within baseline specs (<2 ms local LAN, <25 ms regional SD-WAN).
3. **Application Layer Verification:** Successful HTTP/HTTPS GET request yielding HTTP 200 OK on business-critical services.
4. **Monitoring Clearance:** All alerts on Datadog, SolarWinds, and PRTG return to Green / Normal status with no recurring flap triggers for 15 consecutive minutes.
5. **Configuration Backups:** If network device configurations were modified, issue `copy running-config startup-config` and trigger automated Git oxidized network backup.

---

### 11. Documentation & Post-Incident Review (PIR)
All P1 and P2 network incidents require a completed Post-Incident Review (PIR) document submitted within 48 hours. The PIR must document: exact timeline of events, root cause analysis (5 Whys), preventative architectural remedies, and updated monitoring alerts. PIRs must be approved by the Network Engineering Director and IT VP.

---

### 12. Document Approvals

| Role / Authority | Name & Title | Signature / Verification | Date |
|---|---|---|---|
| **Lead Author** | Elena Rostova, Principal Network Engineer | E. Rostova (Verified) | 2026-05-10 |
| **Security Director** | Michael Zhang, Chief Security Officer | M. Zhang (Verified) | 2026-05-12 |
| **VP IT Infrastructure** | Arthur Pendelton, VP Enterprise Infrastructure | A. Pendelton (Approved) | 2026-05-14 |

---

### 13. Revision History

| Version | Release Date | Description of Modifications | Approved By |
|---|---|---|---|
| **1.0** | 2024-05-01 | Initial network incident response procedure baseline | A. Pendelton |
| **2.0** | 2025-06-15 | Added SD-WAN branch gateway and BGP multi-homing troubleshooting | E. Rostova |
| **3.0** | 2026-05-15 | Added 802.11ax WiFi scope exhaustion and next-gen firewall table metrics | M. Zhang |
