/* ==========================================================================
   CAIRN ETP — Book Reader Modal Engine (book-reader.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBookReaderModal();
});

const CHAPTER_EXCERPTS = {
  ch1: {
    title: "Chapter 1: The Agentic Governance Crisis",
    subtitle: "Why Prompt Safety & Guardrail API Wrappers Fail at Autonomous Tool Execution",
    content: `
      <h3>1.1 The Illusion of Probabilistic Safety</h3>
      <p>As artificial intelligence shifts from passive text generation to autonomous agentic execution, traditional security paradigms crumble. An agent is not merely an endpoint that answers questions; it is a synthetic actor empowered with tool invocation, shell access, vector database queries, and system file manipulation.</p>
      <p>The fundamental mistake of early enterprise agent design was relying on the LLM itself—or soft system prompts—to police its own actions. Prompt injection, toxic context poisoning, and jailbreak vectors have repeatedly proven that an intelligence model cannot serve as its own security gatekeeper.</p>
      
      <h3>1.2 The Governance Gap</h3>
      <p>When an agent receives an instruction like <i>"Optimize my local database and clean up temporary logs,"</i> the reasoning engine may craft shell commands that inadvertently delete critical system configurations. In traditional setups, the command is executed immediately because the execution engine trusts the intelligence layer blindly.</p>
      <p><strong>CAIRN ETP</strong> solves this through <strong>Architectural Control</strong>: total physical separation between the reasoning intelligence (cloud LLMs) and the deterministic governance layer (local Trust Fabric).</p>
    `
  },
  ch2: {
    title: "Chapter 2: The Trust Fabric Pattern",
    subtitle: "Architectural Control & Deterministic Whitelisting",
    content: `
      <h3>2.1 Defining the Trust Fabric Layer</h3>
      <p>The CAIRN Trust Fabric acts as an unyielding air gap between what an agent <i>wants</i> to do and what the system <i>allows</i> it to do. It transforms arbitrary LLM proposals into strictly typed, cryptographic policy evaluations.</p>
      
      <h3>2.2 The Tri-Partite Execution Standard</h3>
      <p>Under the Trust Fabric architecture, every agent action passes through three deterministic gates before touching local hardware:</p>
      <ul>
        <li><strong>1. AST Security Analysis:</strong> Pre-flight static code scanning via STRIX for injection patterns and unsafe operations.</li>
        <li><strong>2. Deterministic Whitelist Check:</strong> Signature verification against immutable command manifests.</li>
        <li><strong>3. Vault Masking:</strong> Sensitive credentials, API keys, and environment tokens are masked at the OS boundary.</li>
      </ul>
    `
  },
  ch3: {
    title: "Chapter 3: STRIX Adversarial Red-Teaming",
    subtitle: "Automated Pre-Flight Security Auditing for Autonomous Agents",
    content: `
      <h3>3.1 Static & Dynamic AST Inspection</h3>
      <p>STRIX is the internal security auditor embedded directly within CAIRN ETP. Before any Python script, Node.js worker, or Shell payload proposed by an LLM is written to disk or sent to a child process, STRIX constructs an Abstract Syntax Tree (AST) of the payload.</p>
      <p>If STRIX detects arbitrary subprocess spawning, network sockets attempting unauthorized egress, or attempts to read local credentials, execution is halted in sub-millisecond time—producing an evidence-backed audit report for enterprise compliance.</p>
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

  // Open modal trigger buttons
  const readBtns = document.querySelectorAll('.open-reader-btn');
  readBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const chapterKey = btn.getAttribute('data-chapter') || 'ch1';
      openReader(chapterKey);
    });
  });

  // Close handlers
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
