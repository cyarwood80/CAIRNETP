<div align="center">

# CAIRN Trust Fabric
### The Enterprise Trust Fabric — Secure • Orchestrate • Automate

[![Release](https://img.shields.io/github/v/release/cairn-trust-fabric/cairn-trust-fabric?color=2562EB&label=Release&style=flat-square)](https://github.com/cairn-trust-fabric/cairn-trust-fabric/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Linux%20Containers-14C8A6?style=flat-square)](https://cairnetp.com)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Runtime%20Sandbox-7C5AED?style=flat-square)](https://cairnetp.com/docs.html)
[![Compliance](https://img.shields.io/badge/Compliance-EU%20AI%20Act%20%7C%20NIST%20AI%20RMF-061220?style=flat-square)](https://cairnetp.com/compliance.html)
[![Website](https://img.shields.io/badge/Website-cairnetp.com-blue?style=flat-square)](https://cairnetp.com)

**We help organisations trust AI.**  
CAIRN inserts a deterministic governance and dual-runtime verification plane between enterprise user intent and model execution.

[Download cairn.exe](https://github.com/cairn-trust-fabric/cairn-trust-fabric/releases/latest) • [Documentation](https://cairnetp.com/docs.html) • [Compliance Mappings](https://cairnetp.com/compliance.html) • [Enterprise Licensing](https://cairnetp.com/licensing.html)

---

</div>

## Overview

Modern enterprises face a critical barrier to deploying autonomous AI agents and automated workflows: **unverifiable, probabilistic execution**. 

**CAIRN Trust Fabric** establishes a deterministic boundary:
1. **Default-Deny Ingress**: Every model output, tool request, and script is intercepted before touching the host system or network.
2. **Dual-Runtime Hardware Sandboxes**: Dynamic dispatch to ephemeral Linux Docker containers or native Windows Sandbox Hyper-V micro-VMs.
3. **Tiered Assurance Verification**: Progression through a 6-stage verification ladder from unverified code to deterministic, idempotent execution.
4. **Cryptographic Decision Ledgers**: Immutable, auditable provenance ledgers satisfying SOC 2, ISO 27001, and EU AI Act Article 14 human-oversight mandates.

---

## The 4-Tier Cairn Trust Architecture

```
         ┌─────────────────────────┐
         │     1. INTENT LAYER     │  Ingress Gate & Schema Validation
         └────────────┬────────────┘
                      ▼
         ┌─────────────────────────┐
         │   2. GOVERNANCE LAYER   │  Policy Engine, Egress Gate & ACLs
         └────────────┬────────────┘
                      ▼
         ┌─────────────────────────┐
         │   3. EXECUTION LAYER    │  Dual-Runtime Isolation (Docker / WinVM)
         └────────────┬────────────┘
                      ▼
         ┌─────────────────────────┐
         │    4. EVIDENCE LAYER    │  SHA-256 Decision Ledger & Audit Graph
         └─────────────────────────┘
```

---

## Quickstart Installation

### Option 1: PowerShell One-Liner (Windows x64)
```powershell
irm https://cairnetp.com/install.ps1 | iex
```

### Option 2: Direct Binary Download (GitHub Releases)
1. Download the latest release from [GitHub Releases](https://github.com/cairn-trust-fabric/cairn-trust-fabric/releases/latest):
   - `cairn-windows-x64.exe`
   - `SHA256SUMS.txt`
2. Verify binary integrity:
   ```powershell
   Get-FileHash .\cairn-windows-x64.exe -Algorithm SHA256
   ```
3. Initialize the Trust Fabric daemon:
   ```powershell
   .\cairn.exe init
   .\cairn.exe verify --runtime winvm --script "test_workload.py"
   ```

---

## Verification Assurance Ladder

Every action executed under the Trust Fabric is evaluated across 6 assurance tiers:

| Tier | Status | Description |
| :--- | :--- | :--- |
| **0. Unverified** | ⚠️ `Untrusted` | Raw LLM output or unparsed user script. |
| **1. Static Checked** | 🔍 `Inspected` | AST validation, secret scanning, credential regex checks. |
| **2. Sandbox Executed** | 🛡️ `Isolated` | Executed in read-only ephemeral Docker / Windows Sandbox VM. |
| **3. Behaviour Checked** | 📊 `Observed` | Memory, file delta, and network egress telemetry verified. |
| **4. Deterministic** | 🔒 `Reproducible`| Output verified to produce identical results across independent runs. |
| **5. Idempotent** | ✅ `Verified` | State changes can be safely re-run without side effects. |

---

## Binary Integrity & Security

All official binaries are built via automated signed GitHub Actions runners and hashed cryptographically:

* **Official Domain**: [https://cairnetp.com](https://cairnetp.com)
* **Security Contact**: `security@cairnetp.com`
* **Vulnerability Reporting**: See [SECURITY.md](SECURITY.md)

---

## Enterprise Licensing & Support

For multi-node enterprise licensing, custom sandbox integrations, and on-premises sovereign LLM deployments, contact [enterprise@cairnetp.com](mailto:enterprise@cairnetp.com) or visit [cairnetp.com/licensing.html](https://cairnetp.com/licensing.html).

© 2026 CAIRN ETP. All rights reserved.
