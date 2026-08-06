/* ==========================================================================
   CAIRN ETP — Main JavaScript & Interactive Hero Developer Showcase (main.js)
   IBM Monospace / FontAwesome Enterprise Compliant (Zero Emojis)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNavToggle();
  initDemoModal();
  initHeroDeveloperTabs();
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
