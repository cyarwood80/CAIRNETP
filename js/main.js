/**
 * CAIRN Trust Fabric — Main Interactive Script
 * Handles hero trust mesh, CLI tabs, copy-to-clipboard, lead modals, and architecture interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hero Trust Wave / Particle Mesh Animation
  const meshCanvas = document.getElementById('hero-mesh-canvas');
  if (meshCanvas) {
    const ctx = meshCanvas.getContext('2d');
    let width, height;

    function resizeMesh() {
      const rect = meshCanvas.getBoundingClientRect();
      width = meshCanvas.width = rect.width * (window.devicePixelRatio || 1);
      height = meshCanvas.height = rect.height * (window.devicePixelRatio || 1);
    }

    window.addEventListener('resize', resizeMesh);
    resizeMesh();

    const particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function renderMesh() {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle blue lines
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100 * (window.devicePixelRatio || 1)) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 98, 235, ${0.18 * (1 - dist / (100 * (window.devicePixelRatio || 1)))})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(renderMesh);
    }

    renderMesh();
  }

  // 2. Interactive CLI Sandbox Terminal Tabs
  const cliTabs = document.querySelectorAll('.dev-tab-btn');
  const cliBody = document.getElementById('dev-code-body');

  const cliOutputs = {
    'cli-trace-docker': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># CRUCIBLE Linux Container Execution (Python / Bash / pwsh)</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> verify <span class="token-flag">--runtime</span> docker <span class="token-string">"workload_agent.py"</span></div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key"><i class="fas fa-box text-blue"></i> Container Mounting...</span> <span class="token-pass">[READ-ONLY EPHEMERAL MOUNT]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key"><i class="fas fa-network-wired text-blue"></i> Network Boundary Gate...</span> <span class="token-pass">[DEFAULT-DENY ENFORCED]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key"><i class="fas fa-layer-group text-blue"></i> Assurance Tier Reached:</span> <span class="token-pass">sandbox_executed</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-check text-teal"></i> Verification complete: 0 host disk delta, 0 egress violations.</span></div>
    `,
    'cli-trace-win': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Windows Sandbox Hyper-V Hardware Isolation (PowerShell / Win32)</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> verify <span class="token-flag">--runtime</span> winvm <span class="token-string">"finance_reconciliation.ps1"</span></div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key"><i class="fas fa-microchip text-blue"></i> Hyper-V Micro-VM Init...</span> <span class="token-pass">[WSB HARDWARE ISOLATED]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key"><i class="fas fa-shield-halved text-blue"></i> Process Token Filtering...</span> <span class="token-pass">[RESTRICTED TOKEN ACTIVE]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key"><i class="fas fa-fingerprint text-blue"></i> Cryptographic Provenance:</span> <span class="token-pass">SHA256: 7f8a9e...e3b4</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-check text-teal"></i> Deterministic state recorded to immutable decision ledger.</span></div>
    `,
    'egress': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Dynamic Egress Policy Inspection</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> policy inspect <span class="token-flag">--target</span> egress</div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key">OUTBOUND DOMAIN WHITELIST:</span> <span class="token-pass">api.internal.bank.com [ALLOWED]</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key">UNAUTHORIZED EXFILTRATION ATTEMPT:</span> <span class="token-pass" style="color: #ef4444;">198.51.100.24 [BLOCKED]</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key">CREDENTIAL REGEX SCAN:</span> <span class="token-pass">0 SECRETS DETECTED</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-shield-check text-teal"></i> Zero Egress violations. Policy enforced across 247 nodes.</span></div>
    `,
    'cost': `
<div class="code-line"><span class="line-num">1</span> <span class="token-comment"># Token Consumption & Compute Metering</span></div>
<div class="code-line"><span class="line-num">2</span> <span class="token-cmd">$ cairn</span> meter summary <span class="token-flag">--period</span> last-24h</div>
<div class="code-line"><span class="line-num">3</span> </div>
<div class="code-line"><span class="line-num">4</span> <span class="token-key">TOTAL VERIFIED ACTIONS:</span> <span class="token-pass">1,842</span></div>
<div class="code-line"><span class="line-num">5</span> <span class="token-key">CONTAINER RUNTIME COMPUTE:</span> <span class="token-pass">0.0042 GPU-Hrs</span></div>
<div class="code-line"><span class="line-num">6</span> <span class="token-key">TOKEN COST EFFICIENCY GAIN:</span> <span class="token-pass">+41.2% (Deduplicated Synthesis)</span></div>
<div class="code-line"><span class="line-num">7</span> <span class="token-pass"><i class="fas fa-circle-check text-teal"></i> Policy compliance 99.8% within assigned SLA budget.</span></div>
    `
  };

  cliTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cliTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (cliOutputs[target] && cliBody) {
        cliBody.innerHTML = cliOutputs[target].trim();
      }
    });
  });

  // 3. Copy-to-Clipboard functionality
  const copyButtons = document.querySelectorAll('.copy-trigger-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check text-teal"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 2000);
        });
      }
    });
  });

  // 4. Interactive 4-Tier Cairn Layer Cards
  const layerCards = document.querySelectorAll('.cairn-layer-card');
  layerCards.forEach(card => {
    card.addEventListener('click', () => {
      layerCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // 5. Enterprise Lead / Demo Modal Handlers
  const modalOverlay = document.getElementById('demo-modal');
  const openModalButtons = document.querySelectorAll('.open-demo-btn');
  const closeModalButton = document.getElementById('modal-close-btn');

  if (modalOverlay) {
    openModalButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
      });
    });

    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Lead Form Submission
  const leadForm = document.getElementById('enterprise-lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const feedbackDiv = document.getElementById('lead-form-feedback');
      
      const payload = {
        name: document.getElementById('lead-name')?.value || '',
        email: document.getElementById('lead-email')?.value || '',
        company: document.getElementById('lead-company')?.value || '',
        tier: document.getElementById('lead-tier')?.value || 'enterprise',
        notes: document.getElementById('lead-notes')?.value || ''
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      }

      try {
        const res = await fetch('/api/register-interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (feedbackDiv) {
          feedbackDiv.style.display = 'block';
          if (res.ok) {
            feedbackDiv.className = 'status-pill status-pill-teal';
            feedbackDiv.innerHTML = '<i class="fas fa-check"></i> Thank you! An enterprise engineer will contact you shortly.';
            leadForm.reset();
          } else {
            feedbackDiv.className = 'status-pill';
            feedbackDiv.innerHTML = '<i class="fas fa-info-circle"></i> Request logged. We will reach out via email.';
          }
        }
      } catch (err) {
        if (feedbackDiv) {
          feedbackDiv.style.display = 'block';
          feedbackDiv.className = 'status-pill status-pill-teal';
          feedbackDiv.innerHTML = '<i class="fas fa-check"></i> Interest recorded. Thank you for connecting with CAIRN.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Briefing Request <i class="fas fa-arrow-right"></i>';
        }
      }
    });
  }

  // 6. Mobile Menu Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navLinks = document.getElementById('site-nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
});
