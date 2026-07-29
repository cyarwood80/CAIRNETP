/* ==========================================================================
   CAIRN ETP — Book Reader Modal Engine (book-reader.js)
   Updated with excerpts from: CAIRN: Engineering a Sovereign AI Agent Platform
   Author: Chris Yarwood
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBookReaderModal();
});

const CHAPTER_EXCERPTS = {
  ch1: {
    title: "The Shift to Enterprise Utility",
    subtitle: "Preface — CAIRN: Engineering a Sovereign AI Agent Platform by Chris Yarwood",
    content: `
      <p>Artificial intelligence is evolving at a pace unlike anything I have experienced during my career in enterprise technology. Almost every week brings a new frontier model, another benchmark, another framework or another promise that the latest release changes everything. It is an exciting time to be an engineer, but it is also an easy time to become distracted by capability while overlooking architecture.</p>
      <p>Whether you are building autonomous agents, designing enterprise automation platforms or simply exploring the future of local AI, I believe the next generation of intelligent systems will be defined less by the models they contain and more by the way those models are orchestrated. This book is my contribution to that conversation.</p>
      <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(56,189,248,0.1); border-left: 3px solid var(--primary-cyan); border-radius: var(--radius-sm);">
        <strong>About the Author:</strong> Chris Yarwood is an enterprise engineer and technology architect with more than two decades of experience designing, delivering, and operating large-scale enterprise platforms.
      </div>
    `
  },
  ch2: {
    title: "Tier 1 & 2: Sovereignty & Memory Fabric",
    subtitle: "Ownership, Control Boundaries, Retrieval Relevance, Provenance",
    content: `
      <h3>Sovereignty & Governance Control</h3>
      <p>True sovereignty in AI deployment demands that control boundaries remain under enterprise ownership. The CAIRN platform enforces deterministic governance, evidence validation, and cryptographic key isolation between reasoning models and execution daemons.</p>
      
      <h3>Memory Fabric & Data Provenance</h3>
      <p>Autonomous agents require persistent, contextual memory. The CAIRN Memory Fabric evaluates retrieval relevance, tracks data provenance, and provides confidence scoring across local vector stores and knowledge structures.</p>
    `
  },
  ch3: {
    title: "Tier 3 & 4: Reasoning Architecture & Model Fleet",
    subtitle: "Model Utilization, Throughput, PowerShell & REST Execution Runtime",
    content: `
      <h3>Decoupled Reasoning Architecture</h3>
      <p>Intelligence models (whether cloud backbones or offline local LLMs) generate proposed plans. The CAIRN Trust Fabric evaluates these proposals deterministically before handing payload execution to the execution runtime.</p>
      
      <h3>Execution Runtime Telemetry</h3>
      <p>Supports PowerShell, Python, and REST calls with continuous evidence emission: Telemetry Events, Planning Events, Fleet Events, and Runtime Events.</p>
    `
  }
};

function initBookReaderModal() {
  const modalOverlay = document.getElementById('book-reader-modal');
  const modalTitle = document.getElementById('modal-chapter-title');
  const modalSubtitle = document.getElementById('modal-chapter-subtitle');
  const modalBody = document.getElementById('modal-chapter-body');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modalOverlay || !closeBtn) return;

  const readBtns = document.querySelectorAll('.open-reader-btn');
  readBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const chapterKey = btn.getAttribute('data-chapter') || 'ch1';
      openReader(chapterKey);
    });
  });

  closeBtn.addEventListener('click', closeReader);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeReader();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeReader();
  });

  function openReader(key) {
    const data = CHAPTER_EXCERPTS[key] || CHAPTER_EXCERPTS.ch1;
    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalBody.innerHTML = data.content;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeReader() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
