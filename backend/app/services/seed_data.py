import os
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.models.log import UserActivity
from app.services.document_parser import DocumentParser
from app.services.vector_store import vector_store
from app.core.config import settings

SAMPLE_SOPS = [
    {
        "id": "SOP-IT-001",
        "title": "SOP-IT-001: Server Connectivity & Network Outage Troubleshooting Procedure",
        "category": "IT Operations",
        "filename": "SOP-IT-001_Server_Connectivity_Troubleshooting.txt",
        "description": "Comprehensive standard operating procedure for identifying, isolating, and resolving production server connectivity and reachability issues.",
        "content": """STANDARD OPERATING PROCEDURE: SERVER CONNECTIVITY TROUBLESHOOTING
Document ID: SOP-IT-001 | Category: IT Operations | Version: 3.2
Effective Date: 2026-01-15 | Review Frequency: Annual

1. PURPOSE & SCOPE
This document outlines mandatory procedures for diagnosing and mitigating unexpected network connectivity failures to production server clusters. Applies to all Tier-1 and Tier-2 Systems Administrators and Network Engineers.

2. INITIAL TRIAGE & SYMPTOM ASSESSMENT
Step 1: Verify host physical status and hypervisor availability via out-of-band management (iDRAC/iLO).
Step 2: Execute reachability checks from the management bastion:
  - Run ICMP ping test: ping -c 4 <target_ip>
  - Check TCP port connectivity: nc -zv -w 3 <target_ip> 22
Step 3: Review switch port link status on the top-of-rack (ToR) switch for interface flapping or errors.

3. NETWORK STACK DIAGNOSTIC PROTOCOL
Step 4: Connect to the server console via remote management console:
  - Check local network interface states: ip link show
  - Inspect IP configuration and gateway routes: ip route show
  - Verify DNS resolver responsiveness: resolvectl status or cat /etc/resolv.conf
Step 5: Check firewall policy drops:
  - Inspect active iptables rules: sudo iptables -L -n -v
  - Verify UFW / firewalld status: sudo ufw status verbose
Step 6: Inspect network socket exhaustion:
  - Check established connections: ss -tulpn
  - Look for SYN_RECV or TIME_WAIT overflow.

4. CORRECTIVE REMEDIATION ACTIONS
Action A: If default gateway route is missing:
  - Re-add default gateway: sudo ip route add default via <gateway_ip> dev eth0
  - Restart systemd-networkd: sudo systemctl restart systemd-networkd
Action B: If interface is down or flapping:
  - Bounce interface: sudo ip link set dev eth0 down && sudo ip link set dev eth0 up
  - Check dmesg for driver crash: sudo dmesg -T | grep -i eth
Action C: If DNS failure is causing service disconnects:
  - Test query to secondary internal DNS: dig @10.0.0.53 auth.internal.company.net
  - Flush DNS cache: sudo resolvectl flush-caches

5. SAFETY PRECAUTIONS & ESCALATION MATRIX
- WARNING: Never execute 'systemctl restart networking' on bonded production interfaces during peak business hours (08:00 - 18:00 UTC) without Change Control approval.
- Escalation: If packet loss exceeds 20% across multiple nodes on the same rack, immediately notify the Network Operations Center (NOC) Duty Manager and declare a P2 Incident.
- Reference internal incident bridge: #ops-incident-sev2 on Slack."""
    },
    {
        "id": "SOP-SEC-004",
        "title": "SOP-SEC-004: Emergency Security Incident Response & Credential Compromise Protocol",
        "category": "Security",
        "filename": "SOP-SEC-004_Emergency_Security_Incident_Response.txt",
        "description": "Standard containment, revocation, and forensic preservation instructions when unauthorized credential access or token leakage is detected.",
        "content": """STANDARD OPERATING PROCEDURE: EMERGENCY SECURITY INCIDENT RESPONSE
Document ID: SOP-SEC-004 | Category: Security | Version: 4.1
Effective Date: 2026-02-01 | Classification: Enterprise Confidential

1. PURPOSE & APPLICABILITY
Provides step-by-step containment protocol for critical security alerts, including leaked API keys, compromised admin credentials, and unauthorized SSH sessions.

2. IMMEDIATE CONTAINMENT ACTIONS (0 - 15 MINUTES)
Step 1: Revoke active session tokens immediately:
  - Terminate user sessions in Okta / Identity Provider dashboard.
  - Invalidate OAuth2 refresh tokens for the affected service account.
Step 2: Isolate infected endpoint or server from the production network:
  - Quarantine host using firewall isolation rule or hypervisor network disconnect.
  - DO NOT power off the virtual machine to preserve volatile RAM memory for forensics.
Step 3: Rotate compromised credentials across AWS Secrets Manager and Vault:
  - Issue rotation command: vault kv patch secret/prod/api-keys revoked=true
  - Invalidate AWS IAM access keys: aws iam update-access-key --access-key-id <KEY_ID> --status Inactive

3. FORENSIC EVIDENCE PRESERVATION
Step 4: Dump active memory before taking any restart action:
  - Run LiME memory dump if host is Linux: insmod lime.ko "path=/tmp/mem.dump format=raw"
Step 5: Snapshot persistent disks in cloud infrastructure:
  - Create disk snapshot with forensic tag: aws ec2 create-snapshot --volume-id <vol-id> --description "FORENSIC-SOP-SEC-004"
Step 6: Export audit logs:
  - Archive auditd log: sudo cp /var/log/audit/audit.log /tmp/forensic-audit.log
  - Check SSH authorization log: sudo grep 'Accepted' /var/log/auth.log

4. REMEDIATION & RESTORATION
Step 7: Re-image compromised host from certified golden image.
Step 8: Deploy fresh keys and verify authentication audit trail.

5. REGULATORY NOTIFICATION & NOTES
- Mandatory: Notify the Chief Information Security Officer (CISO) and Legal within 60 minutes of confirmed exfiltration.
- Never discuss containment procedures in public Slack channels. Use the encrypted #sec-emergency channel only."""
    },
    {
        "id": "SOP-SVR-012",
        "title": "SOP-SVR-012: Production Linux Host Kernel Panic & High Memory Utilization Recovery",
        "category": "Server Maintenance",
        "filename": "SOP-SVR-012_Linux_Kernel_Memory_Recovery.txt",
        "description": "Detailed operational guide for diagnosing OOM killer events, kernel panics, and runaway process memory leaks on Linux servers.",
        "content": """STANDARD OPERATING PROCEDURE: LINUX KERNEL PANIC & MEMORY RECOVERY
Document ID: SOP-SVR-012 | Category: Server Maintenance | Version: 2.5
Effective Date: 2026-03-10 | Maintenance Tier: 2

1. SCOPE
Applies to Ubuntu 22.04 LTS and RHEL 9 production hosts running container workloads, databases, and microservices.

2. SYMPTOM DIAGNOSIS & IDENTIFICATION
Step 1: Check memory consumption and swap utilization:
  - Run memory overview: free -h -w
  - Inspect top memory-consuming processes: ps aux --sort=-%mem | head -n 15
Step 2: Check kernel Out-Of-Memory (OOM) killer invocations:
  - Inspect kernel messages: sudo dmesg -T | grep -i -E 'oom-killer|out of memory|killed process'
  - View journal log: sudo journalctl -k -b -0 --grep="invoked oom-killer"
Step 3: Analyze dirty memory pages and buffer cache:
  - Inspect vmstat: vmstat 1 10
  - Check active slab allocations: sudo slabtop -o

3. STEP-BY-STEP RECOVERY ACTIONS
Action 1: Immediate pressure relief:
  - Gracefully throttle runaway batch worker processes: sudo systemctl stop worker-celery@*
  - If server is thrashing swap space: echo 3 | sudo tee /proc/sys/vm/drop_caches (ONLY if I/O is non-critical)
Action 2: Adjust OOM score adjustments for critical daemons:
  - Protect database daemon: echo -1000 | sudo tee /proc/$(pgrep mysqld)/oom_score_adj
Action 3: Recovery from soft lockup / CPU stalls:
  - Check kernel panic logs saved by kdump in /var/crash/
  - Analyze crash dump with crash utility: crash /usr/lib/debug/... /var/crash/.../vmcore

4. PRECAUTIONARY NOTES & TUNING
- DO NOT disable swap entirely on hosts with overcommit enabled (vm.overcommit_memory=2).
- Ensure vm.swappiness is set between 10 and 20 for database servers.
- If reboot is unavoidable, issue sysrq sync first: echo s | sudo tee /proc/sysrq-trigger"""
    },
    {
        "id": "SOP-NET-008",
        "title": "SOP-NET-008: Cisco & Juniper Core Switch VLAN Configuration & Routing Protocol Audit",
        "category": "Network Management",
        "filename": "SOP-NET-008_Core_Switch_VLAN_Configuration.txt",
        "description": "Standard procedures for provisioning new VLANs, configuring 802.1Q trunking, and auditing BGP / OSPF routing neighbors across datacenter switches.",
        "content": """STANDARD OPERATING PROCEDURE: SWITCH VLAN & ROUTING CONFIGURATION
Document ID: SOP-NET-008 | Category: Network Management | Version: 5.0
Effective Date: 2026-04-12 | Authorization: Network Architecture Board

1. PURPOSE
Mandatory procedure for modifying VLAN assignments, trunk ports, and BGP peering sessions on datacenter distribution switches.

2. PRE-CONFIGURATION AUDIT CHECKLIST
Step 1: Backup current running-config before any modification:
  - Cisco NX-OS: copy running-config bootflash:backup-$(date +%Y%m%d).cfg
  - Juniper Junos: commit confirmed 10 (reverts automatically if connection drops)
Step 2: Verify existing VLAN database:
  - Check VLAN presence: show vlan brief
  - Verify spanning-tree root bridge: show spanning-tree vlan <vlan-id>

3. VLAN CREATION & TRUNK ASSIGNMENT STEPS
Step 3: Provision new VLAN on core switch:
  - conf t
  - vlan 250
  - name APP_TIER_INTERNAL
  - end
Step 4: Tag VLAN on 802.1Q trunk uplink interfaces:
  - interface Ethernet1/49-50
  - switchport trunk allowed vlan add 250
  - description UPLINK-TO-DIST-SW02
Step 5: Verify spanning-tree topology is stable:
  - show spanning-tree vlan 250 detail | grep -i 'root|topology'

4. BGP PEERING AUDIT & TROUBLESHOOTING
Step 6: Check neighbor adjacency state:
  - show ip bgp summary
  - If state is ACTIVE or IDLE, check MTU mismatch and TCP port 179 reachability.
  - Test ping with do-not-fragment bit: ping 10.254.1.1 df-bit size 1500

5. SAFETY WARNINGS
- WARNING: Always utilize 'commit confirmed 10' on Juniper devices to prevent accidental lockout.
- Never configure trunk native VLAN as VLAN 1. Default untagged traffic must be routed to isolated blackhole VLAN 999."""
    },
    {
        "id": "SOP-OPS-022",
        "title": "SOP-OPS-022: Database Replication Lag Mitigation & High Availability Failover Runbook",
        "category": "Troubleshooting",
        "filename": "SOP-OPS-022_Database_Replication_Failover.txt",
        "description": "Critical runbook for detecting primary-replica synchronization latency, promoting read-replicas, and managing zero-downtime failover.",
        "content": """STANDARD OPERATING PROCEDURE: DATABASE REPLICATION LAG & FAILOVER
Document ID: SOP-OPS-022 | Category: Troubleshooting | Version: 3.8
Effective Date: 2026-05-18 | Incident Priority: P1 / P2

1. SCOPE
Covers PostgreSQL streaming replication and MySQL semi-synchronous replication failovers across multi-zone datacenter clusters.

2. LAG DETECTION & METRIC EVALUATION
Step 1: Query replication delay on standby replicas:
  - PostgreSQL: SELECT client_addr, state, sync_state, pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replay_lag_bytes FROM pg_stat_replication;
  - MySQL: SHOW REPLICA STATUS\\G (Inspect Seconds_Behind_Source)
Step 2: If replication lag exceeds 60 seconds or 500MB WAL backlog:
  - Inspect disk I/O saturation on replica: iostat -xz 1 10
  - Check if long-running analytical queries are blocking VACUUM or WAL apply workers:
    SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 5;

3. CORRECTIVE MITIGATION STEPS
Action A: Terminate blocking query on replica:
  - SELECT pg_cancel_backend(<pid>); or SELECT pg_terminate_backend(<pid>);
Action B: If network bandwidth bottleneck is detected:
  - Enable WAL compression in postgresql.conf: wal_compression = zstd
  - Reload configuration: SELECT pg_reload_conf();

4. EMERGENCY MANUAL PROMOTION RUNBOOK (PRIMARY OUTAGE)
Step 3: Confirm primary database host is definitively unreachable (fencing).
Step 4: Promote most up-to-date standby replica:
  - PostgreSQL command: pg_ctl promote -D /var/lib/postgresql/data
  - Verify node is now read-write: SELECT pg_is_in_recovery(); (Must return FALSE)
Step 5: Re-point application connection poolers (PgBouncer) via DNS / Consul service discovery:
  - consul kv put service/database/primary-host "db-replica-01.internal"
  - Reload PgBouncer: psql -p 6432 -U pgbouncer -c "RELOAD;"

5. POST-FAILOVER VERIFICATION
- Verify connection pool status and client error rates in Grafana dashboard.
- Notify DBA on-call team for split-brain inspection before bringing old primary back online."""
    },
    {
        "id": "SOP-GEN-003",
        "title": "SOP-GEN-003: Change Management Approval & Scheduled Maintenance Notification Procedure",
        "category": "General Procedures",
        "filename": "SOP-GEN-003_Change_Management_Procedure.txt",
        "description": "Standard enterprise workflow for submitting Request for Change (RFC), maintenance window scheduling, and stakeholder broadcast guidelines.",
        "content": """STANDARD OPERATING PROCEDURE: CHANGE MANAGEMENT & MAINTENANCE
Document ID: SOP-GEN-003 | Category: General Procedures | Version: 6.0
Effective Date: 2026-06-01 | Compliance: ITIL v4 / SOC2 Type II

1. OBJECTIVE & COMPLIANCE
Ensures that all infrastructure and application changes maintain service level agreements (SLAs), minimize downtime risks, and maintain traceable audit records.

2. CHANGE CATEGORIZATION
- Standard Change: Pre-approved, low-risk routine changes (e.g., certificate renewals, minor OS patch sets). Requires 24h notice.
- Normal Change: Non-routine modifications with potential service impact (e.g., schema migrations, firewall modifications). Requires CAB review 48h prior.
- Emergency Change: Urgent remediation to restore service during P1/P2 incidents. Requires verbal sign-off from Incident Commander.

3. SUBMISSION WORKFLOW & REQUIREMENTS
Step 1: Create RFC ticket in ITSM portal with:
  - Detailed technical execution plan.
  - Step-by-step rollback runbook with tested backout criteria.
  - Expected customer impact and maintenance window timeline.
Step 2: Schedule during approved maintenance windows:
  - Standard Window: Tuesdays & Thursdays 02:00 - 05:00 UTC.
  - Major Infrastructure Window: Sundays 01:00 - 04:00 UTC.
Step 3: Broadcast customer notification:
  - Send email announcement to affected stakeholders at least 72 hours in advance.
  - Post banner notice on system status portal.

4. EXECUTION & POST-IMPLEMENTATION REVIEW (PIR)
Step 4: Hold pre-maintenance bridge check-in 15 minutes prior to window start.
Step 5: Execute tasks following written checklist. Record start and stop times.
Step 6: Execute validation smoke tests before closing the window.
Step 7: If rollback criteria is met at any point, abort immediately and execute rollback plan.

5. AUDIT REQUIREMENTS
- All execution logs must be attached to the closed RFC ticket within 24 hours.
- Failed changes require an automatic Post-Incident Review meeting within 3 business days."""
    }
]


def seed_database_if_empty(db: Session):
    existing_count = db.query(Document).count()
    if existing_count > 0:
        return

    storage_dir = os.path.join(settings.STORAGE_DIRECTORY, "documents")
    os.makedirs(storage_dir, exist_ok=True)

    for doc_data in SAMPLE_SOPS:
        doc_id = doc_data["id"]
        filename = doc_data["filename"]
        file_path = os.path.join(storage_dir, filename)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(doc_data["content"])

        file_size = len(doc_data["content"].encode("utf-8"))

        pages_data, page_count = DocumentParser.extract_text_from_file(file_path, "txt")
        chunks = DocumentParser.chunk_document(
            pages_data,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

        now = datetime.now(timezone.utc)
        doc = Document(
            id=doc_id,
            title=doc_data["title"],
            filename=filename,
            file_path=os.path.abspath(file_path),
            file_size=file_size,
            file_type="txt",
            category=doc_data["category"],
            description=doc_data["description"],
            status="indexed",
            chunk_count=len(chunks),
            page_count=page_count,
            created_at=now,
            updated_at=now
        )
        db.add(doc)

        for chunk_item in chunks:
            chunk_obj = DocumentChunk(
                id=f"{doc_id}_chunk_{chunk_item['chunk_index']}",
                document_id=doc_id,
                chunk_index=chunk_item["chunk_index"],
                page_number=chunk_item["page_number"],
                section_title=chunk_item["section_title"],
                content=chunk_item["content"],
                created_at=now
            )
            db.add(chunk_obj)

        db.commit()

        # Add vectors to ChromaDB
        vector_store.add_document_chunks(
            document_id=doc_id,
            document_title=doc_data["title"],
            category=doc_data["category"],
            chunks=chunks
        )

        act = UserActivity(
            id=str(uuid.uuid4()),
            activity_type="upload",
            description=f"Initial seed: {doc_data['title']}",
            target_id=doc_id,
            created_at=now
        )
        db.add(act)
        db.commit()
