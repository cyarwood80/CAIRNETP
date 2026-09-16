/**
 * js/receipt-page.js
 * ------------------
 * Wires receipt.html to js/receipt.js. Everything that decides anything is in
 * receipt.js; this file only fetches the bundle and writes sentences.
 *
 * The sentences carry their scope. "Verified" alone is not used anywhere on this
 * page, for the reason CAIRN's own assurance vocabulary gives for refusing it: it
 * is a claim no single check here can support.
 */
(function () {
    'use strict';

    var R = window.CairnReceipt;
    var ALTER_INDEX = 5; // record 6, an ALLOW, well before the refused receipt

    function $(sel) {
        return document.querySelector(sel);
    }
    function setCheck(name, text, ok) {
        var el = document.querySelector('[data-check="' + name + '"]');
        if (!el) return;
        el.textContent = text;
        el.className = 'receipt-check-result ' + (ok === true ? 'is-ok' : ok === false ? 'is-broken' : '');
    }
    function setStatus(text, state) {
        var el = $('#attack-status');
        el.textContent = text;
        el.className = 'chain-status chain-status-' + state;
    }
    function show(id, on) {
        var el = document.getElementById(id);
        if (el) el.hidden = !on;
    }

    async function fetchText(url) {
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(url + ' returned ' + res.status);
        return new Uint8Array(await res.arrayBuffer());
    }

    async function main() {
        if (!R) return;
        var receipts = Array.prototype.map.call(document.querySelectorAll('[data-receipt]'), function (el) {
            return el.getAttribute('data-receipt');
        });

        var ledgerBytes, manifest, audit;
        try {
            ledgerBytes = await fetchText('evidence/ledger.jsonl');
            manifest = JSON.parse(new TextDecoder().decode(await fetchText('evidence/manifest.json')));
            audit = R.parseLedger(new TextDecoder().decode(await fetchText('evidence/audit.jsonl')));
        } catch (e) {
            ['contents', 'position', 'file', 'coverage'].forEach(function (c) {
                setCheck(c, 'Could not check: ' + e.message, false);
            });
            setStatus('Could not load the bundle: ' + e.message, 'broken');
            return;
        }
        var pristine = R.parseLedger(new TextDecoder().decode(ledgerBytes));

        // ── 1 and 2, per receipt ────────────────────────────────────────────
        var allContents = true;
        var allPosition = true;
        for (var i = 0; i < receipts.length; i++) {
            var v = await R.verifyReceipt(pristine, receipts[i]);
            var foot = document.querySelector('[data-verify="' + receipts[i] + '"]');
            allContents = allContents && v.found && v.contents;
            allPosition = allPosition && v.found && v.position;
            if (foot) {
                if (!v.found) foot.textContent = 'This receipt is not in the published ledger.';
                else if (v.contents && v.position)
                    foot.textContent =
                        'Checked in this browser: contents re-derive, and ' +
                        (v.index === 0 ? 'it is the first record in the chain' : 'records 1–' + (v.index + 1) + ' link unbroken') +
                        '. Unsigned — origin not established.';
                else foot.textContent = 'Check failed at record ' + (v.firstBreak ? v.firstBreak.index + 1 : v.index + 1) + '.';
                foot.className = 'receipt-foot ' + (v.contents && v.position ? 'is-ok' : 'is-broken');
            }
        }
        setCheck(
            'contents',
            allContents ? 'Both receipts re-derive to the hash they carry.' : 'A receipt does not re-derive.',
            allContents,
        );
        setCheck(
            'position',
            allPosition ? 'Every record up to each receipt re-derives and links to the one before.' : 'The chain breaks before a receipt.',
            allPosition,
        );

        // ── 3, the file against the manifest ────────────────────────────────
        var expected = manifest.files && manifest.files['ledger.jsonl'] && manifest.files['ledger.jsonl'].sha256;
        var actual = await R.sha256Hex(ledgerBytes);
        setCheck(
            'file',
            expected === actual
                ? 'ledger.jsonl hashes to ' + actual.slice(0, 16) + '…, the figure manifest.json gives.'
                : 'ledger.jsonl does not match manifest.json.',
            expected === actual,
        );

        // ── 4, gate decisions without a receipt ─────────────────────────────
        var cov = R.crossCheckAudit(audit, pristine);
        setCheck(
            'coverage',
            cov.withoutReceipt.length === 0
                ? 'All ' + cov.gateEvents + ' gate decisions in audit.jsonl have a receipt in the ledger.'
                : cov.withoutReceipt.length + ' of ' + cov.gateEvents + ' gate decisions have no receipt.',
            cov.withoutReceipt.length === 0,
        );

        // ── The limit, demonstrated ─────────────────────────────────────────
        var denyId = $('#receipt-deny') && $('#receipt-deny').getAttribute('data-receipt');
        var base = await R.verifyReceipt(pristine, denyId);
        var intact = 'Intact. The refused receipt is record ' + (base.index + 1) + ', and everything before it links.';
        setStatus(intact, 'ok');

        function alter(r) {
            r.outcome = r.outcome === 'EXECUTED' ? 'REJECTED' : 'EXECUTED';
        }

        $('#attack-alter').addEventListener('click', async function () {
            var working = JSON.parse(JSON.stringify(pristine));
            alter(working[ALTER_INDEX]);
            var v = await R.verifyReceipt(working, denyId);
            setStatus(
                v.position
                    ? 'Unexpected: the chain still verifies.'
                    : 'Broken at record ' + (v.firstBreak.index + 1) + ': ' + v.firstBreak.reason + '.',
                v.position ? 'ok' : 'broken',
            );
            $('#attack-detail').textContent =
                'Record ' +
                (ALTER_INDEX + 1) +
                "'s outcome was flipped. The refused receipt itself is untouched and still re-derives — but its position check fails, because a record before it no longer matches its hash.";
            show('attack-alter', false);
            show('attack-rewrite', true);
            show('attack-reset', true);
        });

        $('#attack-rewrite').addEventListener('click', async function () {
            var rewritten = await R.rewriteFrom(pristine, ALTER_INDEX, alter);
            var v = await R.verifyReceipt(rewritten, denyId);
            var text = rewritten
                .map(function (r) {
                    return JSON.stringify(r);
                })
                .join('\n');
            var fileHash = await R.sha256Hex(text + '\n');
            setStatus(
                v.position && v.contents
                    ? 'Intact again. Every check on the chain passes — on a ledger that has been altered.'
                    : 'The rewrite did not verify.',
                v.position && v.contents ? 'warning' : 'broken',
            );
            $('#attack-detail').textContent =
                'Every hash from record ' +
                (ALTER_INDEX + 1) +
                ' onward was recomputed, and the refused receipt now carries a different hash that re-derives perfectly. ' +
                (fileHash === expected
                    ? ''
                    : 'The file no longer matches manifest.json — but the manifest is unsigned, so whoever rewrote the ledger could rewrite that figure too. ') +
                'Only something the rewriter cannot reach tells these apart.';
            show('attack-rewrite', false);
        });

        $('#attack-reset').addEventListener('click', function () {
            setStatus(intact, 'ok');
            $('#attack-detail').textContent =
                'Alter an earlier record and the refused receipt’s position check fails. Then do what an attacker with write access would: recompute every hash after the change.';
            show('attack-alter', true);
            show('attack-rewrite', false);
            show('attack-reset', false);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
    else main();
})();
