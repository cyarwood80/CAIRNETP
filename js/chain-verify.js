/**
 * CAIRN — the ledger, verified in the reader's own browser.
 *
 * ── WHY THIS IS THE DEMO, AND A HOSTED CAIRN IS NOT ─────────────────────────
 *
 * The obvious way to "show the product working" is to run an instance on a
 * server and drive it from the page. It would also contradict the product:
 * CAIRN is local-first, there is no CAIRN-operated server in a customer
 * deployment, and standing one up to sell the idea that you do not need one is
 * an argument against yourself. A hosted instance would also mean the records on
 * screen are ours, on our machine, under our control — which is precisely the
 * trust the product exists to remove.
 *
 * So the page ships the ARTEFACT instead, and the reader's browser checks it.
 * `evidence/ledger.jsonl` is a real bundle, exported by a real CAIRN, from a
 * throwaway vault driven through the real gates. Every hash below is recomputed
 * here, on their machine, from bytes they can download. Nothing is asserted.
 *
 * The tamper control is the part that matters. A verifier that only ever says
 * PASSED is indistinguishable from a picture of a verifier saying PASSED — so
 * the reader can break a record and watch the chain fail from that point on.
 *
 * ── THE ALGORITHM IS THE BUNDLE'S OWN, NOT A CONVENIENT VARIANT ─────────────
 *
 *     hash = SHA256(prevHash ‖ canonical_json(record minus hash and prevHash))
 *
 * verbatim from the `VERIFY.md` shipped inside every bundle, so what runs here
 * and what an auditor runs offline are the same check. If this file ever drifts
 * from that document, this one is wrong.
 */
(() => {
    'use strict';

    const GENESIS = '0'.repeat(64);

    /**
     * Canonical JSON: keys sorted recursively, at every level.
     *
     * The chain is over bytes, so any disagreement about key order is a
     * disagreement about the hash. Sorting at every level rather than only the
     * top is what makes `payload` — a nested object on every record — hash the
     * same here as it did when CAIRN wrote it.
     */
    function canon(v) {
        if (v === null || typeof v !== 'object') return JSON.stringify(v);
        if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
        return (
            '{' +
            Object.keys(v)
                .sort()
                .map((k) => JSON.stringify(k) + ':' + canon(v[k]))
                .join(',') +
            '}'
        );
    }

    async function sha256Hex(text) {
        const bytes = new TextEncoder().encode(text);
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Re-derive every record's hash and check it links to the one before.
     *
     * Reports the FIRST break and keeps going, because "the chain broke at
     * record 9" is the useful sentence — a tamper-evident ledger's whole claim
     * is that it can say where.
     */
    async function verifyChain(records, onProgress) {
        let prev = GENESIS;
        const broken = [];
        for (let i = 0; i < records.length; i++) {
            const { hash, prevHash, ...body } = records[i];
            const computed = await sha256Hex(prevHash + canon(body));
            if (computed !== hash) broken.push({ index: i, id: records[i].id, reason: 'hash does not match its contents' });
            else if (i > 0 && prevHash !== prev) broken.push({ index: i, id: records[i].id, reason: 'does not link to the record before it' });
            prev = hash;
            if (onProgress && i % 4 === 0) {
                onProgress(i + 1, records.length);
                await new Promise((r) => setTimeout(r, 0));
            }
        }
        if (onProgress) onProgress(records.length, records.length);
        return broken;
    }

    function el(id) {
        return document.getElementById(id);
    }

    function render(state) {
        const status = el('chain-status');
        const detail = el('chain-detail');
        const bar = el('chain-progress-bar');
        if (!status) return;

        if (state.phase === 'loading') {
            status.textContent = 'Loading the bundle…';
            status.className = 'chain-status chain-status-working';
            return;
        }
        if (state.phase === 'working') {
            status.textContent = `Hashing record ${state.done} of ${state.total}…`;
            status.className = 'chain-status chain-status-working';
            if (bar) bar.style.width = Math.round((state.done / state.total) * 100) + '%';
            return;
        }
        if (state.phase === 'error') {
            status.textContent = 'Could not check the bundle';
            status.className = 'chain-status chain-status-broken';
            // An unavailable check is not a pass, and must never read like one.
            if (detail) detail.textContent = state.message + ' Nothing was verified.';
            return;
        }

        const broken = state.broken;
        if (broken.length === 0) {
            status.textContent = `${state.total} of ${state.total} records verified`;
            status.className = 'chain-status chain-status-ok';
            if (detail)
                detail.textContent =
                    'Every hash was recomputed in this browser from the bundle you just downloaded. Nothing was taken on trust — including from us.';
        } else {
            const first = broken[0];
            status.textContent = `Chain broken at record ${first.index + 1} of ${state.total}`;
            status.className = 'chain-status chain-status-broken';
            if (detail)
                detail.textContent =
                    `${first.id} ${first.reason}. ` +
                    (state.repaired
                        ? 'Recomputing that record’s own hash fixes it and breaks its link to the next record instead. There is no edit that leaves the chain intact — that is what tamper-evident means.'
                        : 'Its stored hash still describes the original contents. Repair that hash and the break moves to the next record: try it.');
        }
    }

    async function main() {
        const mount = el('chain-verifier');
        if (!mount) return;

        let records;
        try {
            render({ phase: 'loading' });
            const res = await fetch('evidence/ledger.jsonl', { cache: 'no-store' });
            if (!res.ok) throw new Error(`the ledger returned ${res.status}.`);
            const text = await res.text();
            records = text
                .split('\n')
                .filter((l) => l.trim())
                .map((l) => JSON.parse(l));
            if (records.length === 0) throw new Error('the ledger held no records.');
        } catch (e) {
            render({ phase: 'error', message: e.message });
            return;
        }

        const pristine = JSON.parse(JSON.stringify(records));
        let working = records;
        let tamperedIndex = -1;
        let repaired = false;

        async function run() {
            const broken = await verifyChain(working, (done, total) => render({ phase: 'working', done, total }));
            render({ phase: 'done', broken, total: working.length, repaired });
        }

        const tamperBtn = el('chain-tamper');
        const repairBtn = el('chain-repair');
        const resetBtn = el('chain-reset');

        if (tamperBtn) {
            tamperBtn.addEventListener('click', async () => {
                // Change one field of one record, the way somebody covering their
                // tracks would: turn a refusal into a permission.
                working = JSON.parse(JSON.stringify(pristine));
                const target = working.findIndex(
                    (r) => String(r.outcome).toUpperCase().includes('DENIED') || String(r.decision).startsWith('DENY'),
                );
                tamperedIndex = target === -1 ? Math.floor(working.length / 2) : target;
                working[tamperedIndex].outcome = 'PERMITTED';
                working[tamperedIndex].reasoning = 'Approved by administrator.';
                repaired = false;
                if (resetBtn) resetBtn.hidden = false;
                if (repairBtn) repairBtn.hidden = false;
                tamperBtn.hidden = true;
                await run();
            });
        }

        // ── AND THE OBVIOUS NEXT MOVE, BECAUSE IT IS THE REAL ARGUMENT ───────
        // Breaking one record only proves the record is checked. Somebody
        // covering their tracks would then recompute that record's hash. Doing it
        // here shows the break move to the NEXT record instead: the chain has no
        // exit, and a demo that stopped at the first step would be arguing the
        // weaker half of the case.
        if (repairBtn) {
            repairBtn.addEventListener('click', async () => {
                const { hash, prevHash, ...body } = working[tamperedIndex];
                working[tamperedIndex].hash = await sha256Hex(prevHash + canon(body));
                repaired = true;
                repairBtn.hidden = true;
                await run();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                working = JSON.parse(JSON.stringify(pristine));
                tamperedIndex = -1;
                repaired = false;
                resetBtn.hidden = true;
                if (repairBtn) repairBtn.hidden = true;
                if (tamperBtn) tamperBtn.hidden = false;
                await run();
            });
        }

        await run();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
    else main();
})();
