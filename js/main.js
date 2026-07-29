/* ==========================================================================
   CAIRN ETP — Main JavaScript & Mobile Navigation (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNavToggle();
  initCopyCodeButtons();
  highlightActiveNavLink();
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

  // Close drawer on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggleBtn.innerHTML = `<i class="fas fa-bars"></i>`;
    });
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      toggleBtn.innerHTML = `<i class="fas fa-bars"></i>`;
    }
  });
}

// Highlight active page link
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && (href === './' || href === 'index.html'))) {
      link.classList.add('active');
    } else if (currentPath === 'book.html' && href === 'book.html') {
      link.classList.add('active');
    }
  });
}

// Clipboard copy helper for terminal snippets
function initCopyCodeButtons() {
  const copyBtns = document.querySelectorAll('.copy-code-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeId = btn.getAttribute('data-code-target');
      const codeEl = document.getElementById(codeId);
      if (!codeEl) return;

      const text = codeEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
        btn.style.color = 'var(--success-green)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    });
  });
}
