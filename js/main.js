/* ==========================================================================
   CAIRN ETP — Main JavaScript & Interactive Hero Developer Showcase (main.js)
   IBM Monospace / FontAwesome Enterprise Compliant (Zero Emojis)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNavToggle();
  initDemoModal();
  initHeroDeveloperTabs();
  initInterfacePreviewTabs();
});

// Sticky header backdrop on scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Mobile drawer menu toggle
function initMobileNavToggle() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('mobile-open');
    const isOpen = navLinks.classList.contains('mobile-open');
    toggleBtn.innerHTML = isOpen ? `<i class="fas fa-xmark"></i>` : `<i class="fas fa-bars"></i>`;
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      if (toggleBtn) toggleBtn.innerHTML = `<i class="fas fa-bars"></i>`;
    });
  });

  document.addEventListener('click', (e) => {
    if (navLinks && !navLinks.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      toggleBtn.innerHTML = `<i class="fas fa-bars"></i>`;
    }
  });
}

// Hero Developer Showcase Interactive Tabs (Zero Emojis)
const DEV_TAB_VIEWS = {
  'cli-trace-docker': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># CRUCIBLE Docker Container Execution (Linux / Python / pwsh)</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> verify <span class="token-flag">--runtime</span> docker <span class="token-string">"verify_disk_space.py"</span></div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key"><i class="fas fa-box text-oxide"></i> Container Mounting...</span> <span class="token-pass">[READ-ONLY MOUNT]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key"><i class="fas fa-network-wired text-oxide"></i> Network Boundary Check...</span> <span class="token-pass">[DISABLED]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key"><i class="fas fa-vial text-oxide"></i> Execution Assurance Tier:</span> <span class="token-pass">sandbox_executed</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-check text-oxide"></i> Verification successful. 0 network egress, zero host pollution.</span></div>
`,
  'cli-trace-win': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># CRUCIBLE Windows Sandbox VM Escalation (PowerShell / WMI / CIM)</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> verify <span class="token-flag">--runtime</span> windows_sandbox <span class="token-string">"audit_wmi_services.ps1"</span></div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key"><i class="fas fa-desktop text-oxide"></i> Windows Sandbox VM Launch...</span> <span class="token-pass">[WINDOWS PRO NATIVE VM]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key"><i class="fas fa-shield text-oxide"></i> Process Execution Policy...</span> <span class="token-pass">[BYPASS SCOPED]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key"><i class="fas fa-filter text-oxide"></i> Payload Parsing & BOM Sanitizer...</span> <span class="token-pass">[UTF-8 BOM STRIPPED]</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-key"><i class="fas fa-file-code text-oxide"></i> Execution Assurance Tier:</span> <span class="token-pass">sandbox_executed</span></div>
<div class="code-line"><span class="line-num">8</span> <span class="token-pass"><i class="fas fa-check text-oxide"></i> Full Windows API surface verified in disposable VM.</span></div>
`,
  'egress': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment">// Frontier Egress Security & Content Classification Gate</span></div>
<div class="code-line"><span class="line-num">2</span> {</div>
<div class="code-line"><span class="line-num">3</span>   <span class="token-cmd">"egress_boundary"</span>: <span class="token-string">"CLOUD_PROVIDER_DISPATCH"</span>,</div>
<div class="code-line"><span class="line-num">4</span>   <span class="token-cmd">"content_classification"</span>: <span class="token-string">"conversation_only"</span>,</div>
<div class="code-line"><span class="line-num">5</span>   <span class="token-cmd">"secret_like_scan"</span>: <span class="token-pass">0_CREDENTIALS_FOUND</span>,</div>
<div class="code-line"><span class="line-num">6</span>   <span class="token-cmd">"cairn_trust_gate"</span>: <span class="token-string">"STRICTLY_LOCAL"</span>,</div>
<div class="code-line"><span class="line-num">7</span>   <span class="token-cmd">"egress_verdict"</span>: <span class="token-pass">ALLOWED_WITH_LEDGER_PROVENANCE</span></div>
<div class="code-line"><span class="line-num">8</span> }</div>
`,
  'cost': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Real-Time Token Cost Metering & Price Discovery</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-key">[METER]</span> Provider: <span class="token-string">"cloud:gemini:gemini-2.5-pro"</span></div>
<div class="code-line"><span class="line-num">3</span> <span class="token-key">[TOKENS]</span> Prompt: 1,420 | Completion: 310 | Total: 1,730</div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key">[PRICE]</span> Discovered Rate: $1.25 / Mtok In, $5.00 / Mtok Out</div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key">[COST]</span> Spend: $0.003325 <span class="token-pass">[PROVENANCE: rate retrieved, unverified ~]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key">[LEDGER]</span> Signed cost audit record written to vault/pricing.json</div>
`
};

function initHeroDeveloperTabs() {
  const tabBtns = document.querySelectorAll('.dev-tab-btn');
  const codeBody = document.getElementById('dev-code-body');

  if (!tabBtns.length || !codeBody) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabKey = btn.getAttribute('data-tab');
      if (DEV_TAB_VIEWS[tabKey]) {
        codeBody.innerHTML = DEV_TAB_VIEWS[tabKey];
      }
    });
  });
}

// Expanded Interface Preview Tabs (Fleet Control, VRAM Telemetry, Automation Vault)
const PREVIEW_TAB_VIEWS = {
  'fleet': `
    <div class="fleet-stats-row">
      <div class="fleet-stat-card">
        <div class="fleet-stat-label">Active Agent Nodes</div>
        <div class="fleet-stat-val text-green">14 / 16</div>
      </div>
      <div class="fleet-stat-card">
        <div class="fleet-stat-label">Sandbox Executions</div>
        <div class="fleet-stat-val">1,482</div>
      </div>
      <div class="fleet-stat-card">
        <div class="fleet-stat-label">Blocked Threats</div>
        <div class="fleet-stat-val text-green">100%</div>
      </div>
      <div class="fleet-stat-card">
        <div class="fleet-stat-label">Fleet VRAM Usage</div>
        <div class="fleet-stat-val text-cyan">42.8 GB / 64 GB</div>
      </div>
    </div>

    <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); overflow-x: auto;">
      <table class="agent-nodes-table">
        <thead>
          <tr>
            <th>NODE ID</th>
            <th>ASSIGNED ROLE</th>
            <th>MODEL BACKING</th>
            <th>ASSURANCE TIER</th>
            <th>VRAM ALLOC</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>agent-alpha-01</code></td>
            <td>Kubernetes Diagnostic Synthesizer</td>
            <td>Ollama / DeepSeek-R1 (Local GGUF)</td>
            <td><span class="status-badge-inline sandboxed">sandbox_executed</span></td>
            <td>14.2 GB</td>
            <td><span class="status-badge-inline sandboxed"><i class="fas fa-circle" style="font-size: 6px;"></i> RUNNING</span></td>
          </tr>
          <tr>
            <td><code>agent-beta-04</code></td>
            <td>PowerShell VM System Inspector</td>
            <td>vLLM / Llama-3.3-70B Sovereign</td>
            <td><span class="status-badge-inline sandboxed">behaviour_checked</span></td>
            <td>22.4 GB</td>
            <td><span class="status-badge-inline sandboxed"><i class="fas fa-circle" style="font-size: 6px;"></i> VERIFIED</span></td>
          </tr>
          <tr>
            <td><code>agent-gamma-09</code></td>
            <td>ATLAS Document Context Retriever</td>
            <td>Embeddings Local BGE-Large</td>
            <td><span class="status-badge-inline analyzing">deterministic</span></td>
            <td>6.2 GB</td>
            <td><span class="status-badge-inline analyzing"><i class="fas fa-sync fa-spin"></i> INDEXING</span></td>
          </tr>
          <tr>
            <td><code>agent-delta-12</code></td>
            <td>Egress Gate Credential Auditor</td>
            <td>STRIX AST Security Engine</td>
            <td><span class="status-badge-inline sandboxed">idempotent</span></td>
            <td>0.8 GB</td>
            <td><span class="status-badge-inline idle">IDLE</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  'vram': `
    <div class="vram-grid">
      <div>
        <div class="vram-meter-card">
          <div class="vram-meter-header">
            <span><i class="fas fa-microchip text-green"></i> Node 01 — NVIDIA RTX 4090 (Sovereign Ollama)</span>
            <span class="text-green">14.2 GB / 24.0 GB (59%)</span>
          </div>
          <div class="vram-bar-track">
            <div class="vram-bar-fill" style="width: 59%;"></div>
          </div>
        </div>

        <div class="vram-meter-card">
          <div class="vram-meter-header">
            <span><i class="fas fa-server text-cyan"></i> Node 02 — NVIDIA A100-80GB (vLLM Cluster Cluster-01)</span>
            <span class="text-cyan">58.4 GB / 80.0 GB (73%)</span>
          </div>
          <div class="vram-bar-track">
            <div class="vram-bar-fill" style="width: 73%;"></div>
          </div>
        </div>

        <div class="vram-meter-card">
          <div class="vram-meter-header">
            <span><i class="fas fa-brain text-green"></i> Node 03 — Local BGE Vector Memory Pool</span>
            <span class="text-green">6.2 GB / 16.0 GB (38%)</span>
          </div>
          <div class="vram-bar-track">
            <div class="vram-bar-fill" style="width: 38%;"></div>
          </div>
        </div>
      </div>

      <div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; text-transform: uppercase;">
            KV Cache & Model Pool Allocation
          </div>
          <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span>Model Weights:</span>
              <strong style="color: #f8fafc;">44.8 GB</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span>KV Context Cache:</span>
              <strong style="color: #38bdf8;">28.2 GB</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span>AST Buffer Space:</span>
              <strong style="color: #22c55e;">5.8 GB</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 0.5rem; margin-top: 0.5rem;">
              <span>Total Provisioned:</span>
              <strong style="color: #22c55e;">78.8 GB / 120 GB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  'vault': `
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); padding: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid #334155; padding-bottom: 0.75rem;">
        <div style="font-family: var(--font-mono); font-size: 0.875rem; color: #22c55e; font-weight: 600;">
          <i class="fas fa-key"></i> CAIRN Automation Vault & Credential Injection Guard
        </div>
        <span class="status-badge-inline sandboxed">HARDWARE LOCK ACTIVE</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem;">
        <div style="background: #0f172a; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #334155;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">SECRET REDACTION</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #22c55e; margin-top: 0.25rem;">100% ENFORCED</div>
        </div>
        <div style="background: #0f172a; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #334155;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">ENV LEAK PREVENTION</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; margin-top: 0.25rem;">ZERO EGRESS</div>
        </div>
        <div style="background: #0f172a; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #334155;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">KEY PROVENANCE</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-top: 0.25rem;">SHA-256 SIGNED</div>
        </div>
      </div>

      <div style="font-family: var(--font-mono); font-size: 0.8rem; background: #0f172a; padding: 1rem; border-radius: var(--radius-sm); color: #cbd5e1; line-height: 1.6;">
        <div><span style="color: #94a3b8;">[VAULT_GUARD]</span> Evaluating request by agent-alpha-01 for API Credential...</div>
        <div><span style="color: #22c55e;">[PERIMETER]</span> Token request mapped to ephemeral memory injection.</div>
        <div><span style="color: #22c55e;">[SANITY_CHECK]</span> Network egress to external IP endpoints: <span style="color: #ef4444; font-weight: 700;">BLOCKED</span></div>
        <div><span style="color: #38bdf8;">[LEDGER]</span> Cryptographic event hash written: 0x7f81a9c3...</div>
      </div>
    </div>
  `
};

function initInterfacePreviewTabs() {
  const previewBtns = document.querySelectorAll('[data-preview-tab]');
  const previewContainer = document.getElementById('preview-tab-content');

  if (!previewBtns.length || !previewContainer) return;

  previewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      previewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabKey = btn.getAttribute('data-preview-tab');
      if (PREVIEW_TAB_VIEWS[tabKey]) {
        previewContainer.innerHTML = PREVIEW_TAB_VIEWS[tabKey];
      }
    });
  });
}

// Register Interest Modal Handler
function initDemoModal() {
  const modalOverlay = document.getElementById('demo-modal');
  const closeBtn = document.getElementById('demo-close-btn');
  const demoBtns = document.querySelectorAll('.open-demo-btn');

  if (!modalOverlay) return;

  demoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDemoModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeDemoModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeDemoModal();
  });
}

function closeDemoModal() {
  const modalOverlay = document.getElementById('demo-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function handleDemoSubmit() {
  const name = document.getElementById('demo-name')?.value;
  const email = document.getElementById('demo-email')?.value;
  const org = document.getElementById('demo-org')?.value;
  const msgEl = document.getElementById('demo-status-msg');

  if (!email || !name) return;

  if (msgEl) msgEl.textContent = "Submitting your registration to CAIRN ETP Team...";

  try {
    const res = await fetch('/api/request-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, organization: org })
    });
    if (res.ok) {
      if (msgEl) msgEl.textContent = "Interest registered. A member of the CAIRN team will be in touch.";
      setTimeout(closeDemoModal, 3500);
      return;
    }
  } catch (e) {
    console.log("Demo submitted client-side:", name, email, org);
  }

  // Direct Mailto Fallback Link
  const mailSubject = encodeURIComponent(`CAIRN ETP — Register Interest — ${org || 'Enterprise'}`);
  const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nOrganization: ${org}\n\nRegistering interest in CAIRN ETP.`);
  const mailtoUrl = `mailto:chris@cairnetp.com?subject=${mailSubject}&body=${mailBody}`;
  
  if (msgEl) {
    msgEl.innerHTML = `Request logged. <a href="${mailtoUrl}" target="_blank" style="color: var(--color-oxide-green); text-decoration: underline;">Click here to email directly if needed</a>.`;
  }
  setTimeout(closeDemoModal, 5000);
}

window.handleDemoSubmit = handleDemoSubmit;
