/* ==========================================================================
   CAIRN ETP — Main JavaScript (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCopyCodeButtons();
  highlightActiveNavLink();
});

// Sticky header backdrop on scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Highlight current page in navigation header
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === './') || (currentPath === '' && href === './')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
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
