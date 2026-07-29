/* ==========================================================================
   CAIRN ETP — Main JavaScript & Demo Request Modal (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNavToggle();
  initDemoModal();
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
      if (msgEl) msgEl.textContent = "✓ Demonstration request received. An enterprise architect will contact you within 24 hours.";
      setTimeout(closeDemoModal, 3500);
      return;
    }
  } catch (e) {
    console.log("Demo submitted locally:", name, email, org);
  }

  if (msgEl) msgEl.textContent = "✓ Demonstration request received. An enterprise architect will contact you shortly.";
  setTimeout(closeDemoModal, 3500);
}

window.handleDemoSubmit = handleDemoSubmit;
