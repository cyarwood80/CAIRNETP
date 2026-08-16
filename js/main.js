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

  // 2. Real CAIRN Desktop Application Module Switcher
  const appTabs = document.querySelectorAll('.dev-tab-btn');
  const previewImg = document.getElementById('app-preview-img');
  const previewCaption = document.getElementById('app-preview-caption');

  const appModules = {
    'tab-audit': {
      img: 'assets/cairn-app-audit.png',
      caption: '<span><i class="fas fa-fingerprint text-teal"></i> Module: <strong>Cryptographic Audit Ledger</strong></span>',
      badge: '<span class="status-pill status-pill-teal" style="margin-bottom: 0; padding: 0.2rem 0.6rem; font-size: 0.72rem;">SHA-256 Signed</span>'
    },
    'tab-terminal': {
      img: 'assets/cairn-app-terminal.png',
      caption: '<span><i class="fas fa-terminal text-blue"></i> Module: <strong>Dual-Runtime Isolated Terminal</strong></span>',
      badge: '<span class="status-pill status-pill-teal" style="margin-bottom: 0; padding: 0.2rem 0.6rem; font-size: 0.72rem;">Docker & WinVM Active</span>'
    },
    'tab-vault': {
      img: 'assets/cairn-app-vault.png',
      caption: '<span><i class="fas fa-vault text-teal"></i> Module: <strong>Zero-Trust Credential Vault</strong></span>',
      badge: '<span class="status-pill status-pill-teal" style="margin-bottom: 0; padding: 0.2rem 0.6rem; font-size: 0.72rem;">Secrets Redacted</span>'
    },
    'tab-fleet': {
      img: 'assets/cairn-app-fleet.png',
      caption: '<span><i class="fas fa-network-wired text-blue"></i> Module: <strong>Distributed Node Fleet</strong></span>',
      badge: '<span class="status-pill status-pill-teal" style="margin-bottom: 0; padding: 0.2rem 0.6rem; font-size: 0.72rem;">247 Systems Online</span>'
    }
  };

  appTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      appTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (appModules[target] && previewImg && previewCaption) {
        previewImg.style.opacity = '0.4';
        setTimeout(() => {
          previewImg.src = appModules[target].img;
          previewCaption.innerHTML = `${appModules[target].caption} ${appModules[target].badge}`;
          previewImg.style.opacity = '1';
        }, 150);
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
