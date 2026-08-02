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
  'cli-trace': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Querying the CAIRN Enterprise Trust Plane</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> trace <span class="token-flag">--query</span> <span class="token-string">"Verify Q3 compliance policy"</span></div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key"><i class="fas fa-bolt text-oxide"></i> Resolving Knowledge Graph...</span> <span class="token-pass">[OK]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key"><i class="fas fa-shield-alt text-oxide"></i> AST Policy Verification...</span> <span class="token-pass">[PASSED: 0 Risk Vectors]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key"><i class="fas fa-file-code text-oxide"></i> Decision Lineage Hash:</span> <span class="token-string">sha256:8f94e2...b1a0</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-check text-oxide"></i> Recommendation verified with 100% deterministic lineage.</span></div>
`,
  'evidence': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment">// Evidence Fabric JSON Verification Schema</span></div>
<div class="code-line"><span class="line-num">2</span> {</div>
<div class="code-line"><span class="line-num">3</span>   <span class="token-cmd">"evidence_id"</span>: <span class="token-string">"ev_cairn_98412"</span>,</div>
<div class="code-line"><span class="line-num">4</span>   <span class="token-cmd">"confidence_score"</span>: <span class="token-flag">0.9982</span>,</div>
<div class="code-line"><span class="line-num">5</span>   <span class="token-cmd">"sources"</span>: [<span class="token-string">"ADR-0008.md"</span>, <span class="token-string">"audit_provenance.parquet"</span>],</div>
<div class="code-line"><span class="line-num">6</span>   <span class="token-cmd">"verifiable_proof"</span>: <span class="token-pass">true</span></div>
<div class="code-line"><span class="line-num">7</span> }</div>
`,
  'lineage': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Deterministic Decision Lineage Audit</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-key">[STEP 1]</span> Prompt ingested & hashed (SHA-256)</div>
<div class="code-line"><span class="line-num">3</span> <span class="token-key">[STEP 2]</span> Intercepted by CAIRN Trust Plane</div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key">[STEP 3]</span> Evidence validation against Enterprise Knowledge Base</div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key">[STEP 4]</span> Governance clearance <span class="token-pass">[APPROVED]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key">[STEP 5]</span> Signed audit record appended to ledger</div>
`,
  'policy': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># STRIX Security & Policy Manifest</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">policy_level</span>: <span class="token-string">"ENTERPRISE_STRICT"</span></div>
<div class="code-line"><span class="line-num">3</span> <span class="token-cmd">hallucination_prevention</span>: <span class="token-pass">ENFORCED</span></div>
<div class="code-line"><span class="line-num">4</span> <span class="token-cmd">credential_protection</span>: <span class="token-pass">ENFORCED</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-cmd">audit_provenance_mode</span>: <span class="token-string">"IMMUTABLE_HASH_LEDGER"</span></div>
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

// Demonstration Request Modal Handler
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

  if (msgEl) msgEl.textContent = "Submitting demonstration inquiry to CAIRN ETP Team...";

  try {
    const res = await fetch('/api/request-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, organization: org })
    });
    if (res.ok) {
      if (msgEl) msgEl.textContent = "Demonstration request received. An enterprise architect will contact you within 24 hours.";
      setTimeout(closeDemoModal, 3500);
      return;
    }
  } catch (e) {
    console.log("Demo submitted client-side:", name, email, org);
  }

  // Direct Mailto Fallback Link
  const mailSubject = encodeURIComponent(`CAIRN ETP Demo Request - ${org || 'Enterprise'}`);
  const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nOrganization: ${org}\n\nRequesting an enterprise demonstration for CAIRN ETP.`);
  const mailtoUrl = `mailto:chris@cairnetp.com?subject=${mailSubject}&body=${mailBody}`;
  
  if (msgEl) {
    msgEl.innerHTML = `Request logged. <a href="${mailtoUrl}" target="_blank" style="color: var(--color-oxide-green); text-decoration: underline;">Click here to email directly if needed</a>.`;
  }
  setTimeout(closeDemoModal, 5000);
}

window.handleDemoSubmit = handleDemoSubmit;
