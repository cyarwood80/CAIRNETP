/**
 * js/gate.js
 * ----------
 * The two moving parts of the 2026-09-07 direction.
 *
 * ── 1. THE HERO, AT REST ───────────────────────────────────────────────────
 * A canvas behind the headline: requests arrive from the left, most cross the
 * seam and dim, some are stopped at it and flash. It runs on load, so the first
 * frame a visitor sees is already the product working rather than a still of
 * one. Drawn rather than authored as SVG because it is generative.
 *
 * ── 2. THE GATE, RUNNING ───────────────────────────────────────────────────
 * This replaces four static boxes headed "what a refusal looks like". Same
 * evidence, opposite frame: not a list of what CAIRN stops, but a demonstration
 * of how every action is decided — and it opens on one that is ALLOWED, which
 * is the whole difference between a page that reads as capability and one that
 * reads as confession.
 *
 * The four refusals are verbatim from a running instance. The allowed case
 * carries no invented prose: only the fields the record itself holds, because
 * writing plausible CAIRN output would be exactly the thing this product exists
 * to stop other people doing.
 *
 * Each decision is appended to a chain and hashed with WebCrypto in the
 * reader's browser, over the records on the page. `Alter a record` breaks it at
 * that row and at every row after — the same argument js/chain-verify.js makes
 * with a real exported bundle further down, made here in four seconds.
 */

(() => {
    'use strict';

    const reduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── THE HERO CANVAS ──────────────────────────────────────────────────── */

    const cv = document.getElementById('gate-canvas');
    if (cv && cv.getContext) {
        const ctx = cv.getContext('2d');
        let W = 0;
        let H = 0;
        let seamX = 0;
        let packets = [];

        const size = () => {
            const r = cv.getBoundingClientRect();
            const d = Math.min(window.devicePixelRatio || 1, 2);
            W = r.width;
            H = r.height;
            cv.width = Math.round(W * d);
            cv.height = Math.round(H * d);
            ctx.setTransform(d, 0, 0, d, 0, 0);
            // Sits in the grid gutter: the headline is left of the gate, the
            // mark is right of it.
            seamX = W * (W < 900 ? 0.88 : 0.615);
        };

        const spawn = () => {
            packets.push({
                x: -80 - Math.random() * 240,
                y: 20 + Math.random() * Math.max(H - 40, 40),
                len: 26 + Math.random() * 74,
                v: 0.45 + Math.random() * 0.8,
                blocked: Math.random() < 0.22,
                state: 'run',
                hit: 1,
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, 'rgba(135, 149, 156, 0)');
            g.addColorStop(0.5, 'rgba(135, 149, 156, 0.55)');
            g.addColorStop(1, 'rgba(135, 149, 156, 0)');
            ctx.fillStyle = g;
            ctx.fillRect(seamX, 0, 1, H);

            for (const p of packets) {
                if (p.state === 'run') {
                    p.x += p.v;
                    if (p.blocked && p.x + p.len >= seamX) {
                        p.x = seamX - p.len;
                        p.state = 'stop';
                    } else if (p.x > W + 140) {
                        p.state = 'dead';
                    }
                } else if (p.state === 'stop') {
                    p.hit -= 0.012;
                    if (p.hit <= 0) p.state = 'dead';
                }

                if (p.state === 'stop') {
                    ctx.globalAlpha = Math.max(p.hit, 0) * 0.9;
                    ctx.fillStyle = '#e8823c';
                    ctx.fillRect(p.x, p.y, p.len, 1.5);
                    ctx.globalAlpha = Math.max(p.hit, 0) * 0.4;
                    ctx.fillRect(seamX - 2, p.y - 4, 3, 9);
                } else {
                    const past = p.x > seamX;
                    ctx.globalAlpha = past ? 0.22 : 0.46;
                    ctx.fillStyle = past ? '#7fd4c1' : '#87959c';
                    ctx.fillRect(p.x, p.y, p.len, 1);
                }
                ctx.globalAlpha = 1;
            }

            packets = packets.filter((p) => p.state !== 'dead');
            if (packets.length < 32 && Math.random() < 0.12) spawn();
            if (!reduced) requestAnimationFrame(draw);
        };

        size();
        for (let i = 0; i < 20; i += 1) {
            spawn();
            packets[i].x = Math.random() * W;
        }
        draw();
        window.addEventListener('resize', size);
    }

    /* ── THE FIVE DECISIONS ───────────────────────────────────────────────── */

    const CASES = [
        {
            kind: 'allowed',
            verdict: 'ALLOWED',
            ms: '0.21',
            req: [
                ['agent', 'claude-code'],
                ['tool', 'read_file'],
                ['target', './src/router.js'],
                ['policy', 'declared scope'],
            ],
            what: 'read_file · ./src/router.js',
            out:
                '<span class="gate-ok">ALLOWED.</span> Within the declared scope for \'claude-code\'.\n\n' +
                'Evaluated against 6 policy rules in 0.21 ms. No sandbox required\n' +
                'for a read inside the project root.\n\n' +
                '<span class="gate-fix">Recorded as decision dec-4f9c2ab130e77d51.</span>',
        },
        {
            kind: 'blocked',
            verdict: 'EGRESS BLOCKED',
            ms: '0.24',
            req: [
                ['agent', 'claude-code'],
                ['tool', 'email_send'],
                ['target', 'elsewhere.net'],
                ['scope', 'example.com'],
            ],
            what: 'email_send · elsewhere.net',
            out:
                '<span class="gate-v">EGRESS BLOCKED:</span> \'claude-code\' may address example.com and\n' +
                '\'email_send\' was directed at elsewhere.net. Nothing was sent.\n\n' +
                '<span class="gate-fix">Add elsewhere.net to this client\'s `domains` in\n' +
                'vault/mcpInboundClients.json if it should be reachable.</span>',
        },
        {
            kind: 'blocked',
            verdict: 'EGRESS BLOCKED',
            ms: '0.26',
            req: [
                ['agent', 'claude-code'],
                ['tool', 'email_send'],
                ['target', 'example.com'],
                ['payload', 'secret_like'],
            ],
            what: 'email_send · secret_like',
            out:
                '<span class="gate-v">EGRESS BLOCKED:</span> secret_like may not be sent to a "cloud"\n' +
                'endpoint. Detected: high-entropy token of length 62. Nothing was\n' +
                'sent by \'email_send\' for \'claude-code\'.\n\n' +
                '<span class="gate-fix">This is the content, not the destination: the host was in scope.\n' +
                'If this data is meant to leave, move its tag out of `deny` for the\n' +
                '"cloud" boundary in vault/egress_policy.json.</span>',
        },
        {
            kind: 'blocked',
            verdict: 'GOVERNANCE BLOCK',
            ms: '0.22',
            req: [
                ['agent', 'claude-code'],
                ['tool', 'execute_command'],
                ['risk', 'CRITICAL'],
                ['rule', 'FS_RECURSIVE_DELETE_PS'],
            ],
            what: 'execute_command · host',
            out:
                '<span class="gate-v">GOVERNANCE BLOCK:</span> \'execute_command\' was not authorised.\n' +
                '  - Policy Breach [SECURITY | No High-Risk Payload on the Host]\n' +
                '  - Static risk CRITICAL forbids direct host execution of\n' +
                '    \'execute_command\' (FS_RECURSIVE_DELETE_PS). It must be repaired,\n' +
                '    or run only in an isolated sandbox.\n\n' +
                '<span class="gate-fix">Recorded as dec-7220b61df20289c0, and cannot be overridden\n' +
                'by approval.</span>',
        },
        {
            kind: 'blocked',
            verdict: 'GRADE WITHHELD',
            ms: '0.23',
            req: [
                ['agent', 'claude-code'],
                ['stage', 'verification'],
                ['reported', 'container run'],
                ['graded', 'static_only'],
            ],
            what: 'verification · inconsistent',
            out:
                'Verification — measured by the system, not written by the model.\n\n' +
                '- Assurance grade: <span class="gate-v">WITHHELD</span> — the result is internally\n' +
                '  inconsistent. It reports execution in a container while grading\n' +
                '  the run `static_only`. Those cannot both be true, so no grade\n' +
                '  is stated.\n\n' +
                '<span class="gate-fix">The captured output is real; what it certifies is not established.\n' +
                'Please report this — it is a defect in CAIRN, not in your script.</span>',
        },
    ];

    const stage = document.getElementById('gate-stage');
    if (!stage) return;

    const reqEl = document.getElementById('gate-req');
    const verdictEl = document.getElementById('gate-verdict');
    const timingEl = document.getElementById('gate-timing');
    const outEl = document.getElementById('gate-output');
    const rowsEl = document.getElementById('gate-rows');
    const footEl = document.getElementById('gate-foot');
    const chips = Array.prototype.slice.call(document.querySelectorAll('.gate-chip'));

    let chain = [];
    let typer = null;

    const hex = (b) =>
        Array.prototype.map.call(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');

    const sha256 = async (s) =>
        hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));

    const renderReq = (c) => {
        reqEl.innerHTML = c.req
            .map(
                ([k, v]) =>
                    `<div class="gate-req-row"><span>${k}</span><span><b>${v}</b></span></div>`,
            )
            .join('');
    };

    /**
     * Revealed a rendered LINE at a time, never a character at a time: the
     * output carries markup, and a character typer tears it mid-tag.
     */
    const type = (html) => {
        clearInterval(typer);
        if (reduced) {
            outEl.innerHTML = html;
            return;
        }
        const lines = html.split('\n');
        let i = 0;
        outEl.innerHTML = '';
        typer = setInterval(() => {
            i += 1;
            outEl.innerHTML =
                lines.slice(0, i).join('\n') + (i < lines.length ? '<span class="gate-caret"></span>' : '');
            if (i >= lines.length) clearInterval(typer);
        }, 55);
    };

    const paint = (brokenAt) => {
        if (chain.length === 0) {
            rowsEl.innerHTML = '<div class="gate-empty">Choose a request above.</div>';
            return;
        }
        rowsEl.innerHTML = chain
            .map(
                (r, i) => `
      <div class="gate-row${brokenAt >= 0 && i >= brokenAt ? ' is-broken' : ''}" data-kind="${r.kind}">
        <span class="gate-n">${String(r.n).padStart(2, '0')}</span>
        <span class="gate-what">${r.what} <span class="gate-badge">· ${r.verdict}</span></span>
        <span class="gate-hash">${r.hash.slice(0, 16)}…</span>
      </div>`,
            )
            .join('');
        rowsEl.scrollTop = rowsEl.scrollHeight;
    };

    const verify = async () => {
        let prev = '0'.repeat(64);
        for (let i = 0; i < chain.length; i += 1) {
            const r = chain[i];
            /* eslint-disable no-await-in-loop */
            const expect = await sha256(prev + r.body);
            if (r.prev !== prev || r.hash !== expect) {
                paint(i);
                footEl.className = 'gate-foot is-bad';
                footEl.textContent = `Chain broken at record ${i + 1} of ${chain.length}.`;
                return;
            }
            prev = r.hash;
        }
        paint(-1);
        footEl.className = 'gate-foot is-ok';
        footEl.textContent = `${chain.length} of ${chain.length} record${
            chain.length === 1 ? '' : 's'
        } verified in this browser.`;
    };

    const append = async (c) => {
        const prev = chain.length ? chain[chain.length - 1].hash : '0'.repeat(64);
        const body = JSON.stringify({
            n: chain.length + 1,
            what: c.what,
            verdict: c.verdict,
            ms: c.ms,
        });
        chain.push({
            n: chain.length + 1,
            what: c.what,
            kind: c.kind,
            verdict: c.verdict,
            body,
            prev,
            hash: await sha256(prev + body),
        });
        await verify();
    };

    const run = (i) => {
        const c = CASES[i];
        chips.forEach((ch) => ch.setAttribute('aria-pressed', String(Number(ch.dataset.i) === i)));
        renderReq(c);
        verdictEl.textContent = c.verdict;
        verdictEl.dataset.kind = c.kind;
        timingEl.innerHTML = `decided in <b>${c.ms} ms</b> · 6 policy rules evaluated`;
        outEl.innerHTML = '';

        stage.classList.remove('is-firing');
        void stage.offsetWidth;
        stage.classList.add('is-firing');

        setTimeout(() => type(c.out), reduced ? 0 : 700);
        setTimeout(() => append(c), reduced ? 0 : 760);
    };

    chips.forEach((ch) => ch.addEventListener('click', () => run(Number(ch.dataset.i))));

    document.getElementById('gate-tamper').addEventListener('click', () => {
        if (chain.length < 2) {
            footEl.className = 'gate-foot';
            footEl.textContent = 'Run a second request first, then alter one.';
            return;
        }
        const i = 1;
        chain[i].body = chain[i].body.replace(/"verdict":"[^"]*"/, '"verdict":"ALLOWED"');
        chain[i].what = `${chain[i].what} (altered)`;
        verify();
    });

    document.getElementById('gate-reset').addEventListener('click', async () => {
        const replay = chain.map(
            (r) =>
                CASES.find((c) => c.what === r.what.replace(' (altered)', '')) || CASES[0],
        );
        chain = [];
        for (const c of replay) await append(c); // eslint-disable-line no-await-in-loop
    });

    // Opens in a working state: the allowed case, already decided and recorded.
    renderReq(CASES[0]);
    timingEl.innerHTML = 'decided in <b>0.21 ms</b> · 6 policy rules evaluated';
    outEl.innerHTML = CASES[0].out;
    append(CASES[0]);
})();
