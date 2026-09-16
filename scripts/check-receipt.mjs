#!/usr/bin/env node
/**
 * scripts/check-receipt.mjs
 * -------------------------
 * receipt.html says what evidence/ says — the values AND the limits.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The receipt page prints 44 values from a real ledger and makes five claims
 * about what can and cannot be established from them. Both halves rot in the
 * same way metrics did on the homepage: a bundle is re-exported, a value
 * changes, and the page goes on saying the old one in a font that looks exactly
 * as authoritative.
 *
 * So, in order:
 *
 *   1. every receipt on the page is in the ledger, and re-derives and links
 *      using js/receipt.js — the file the browser runs, not a copy of it;
 *   2. every `data-field` value equals the ledger field it names, and every
 *      `data-derived` value equals what it is derived from;
 *   3. the ledger file matches manifest.json;
 *   4. THE LIMITS STILL HOLD. The page says altering an earlier record breaks a
 *      receipt's position check, and that recomputing every later hash makes it
 *      pass again. Both are executed here. If either ever stops being true the
 *      page is wrong and this fails — including in the direction that would be
 *      good news;
 *   5. the page's statements about THIS bundle's protections match the bundle:
 *      it says unsigned and unanchored, so signature.txt must say UNSIGNED and
 *      anchors.json must hold no tokens. Re-export a signed bundle and this
 *      fails until the copy is rewritten to match.
 *
 * Mutation-tested: `--self-test` alters one displayed value in memory and
 * requires step 2 to catch it.
 *
 * Exit 0 clean · 1 the page disagrees with the bundle · 2 UNCHECKED.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const R = require(path.join(ROOT, 'js/receipt.js'));
const UNCHECKED = 2;
const ALTER_INDEX = 5; // must match js/receipt-page.js

const unescape = (s) =>
    s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const render = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

/** Each receipt article, with the fields it displays. */
export function receiptsIn(html) {
    const out = [];
    for (const m of html.matchAll(/<article class="receipt"[^>]*data-receipt="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
        const fields = [...m[2].matchAll(/data-field="([^"]+)">([^<]*)</g)].map((f) => ({ path: f[1], shown: unescape(f[2]) }));
        const derived = [...m[2].matchAll(/data-derived="([^"]+)">([^<]*)</g)].map((f) => ({ name: f[1], shown: unescape(f[2]) }));
        out.push({ id: m[1], fields, derived });
    }
    return out;
}

/** Problems with one receipt's displayed values against its record. */
export function valueProblems(receipt, record) {
    const problems = [];
    for (const f of receipt.fields) {
        const actual = render(get(record, f.path));
        if (f.shown !== actual) problems.push(`${receipt.id} ${f.path}: page shows ${JSON.stringify(f.shown)}, ledger has ${JSON.stringify(actual)}`);
    }
    for (const d of receipt.derived) {
        if (d.name !== 'failed-rules') {
            problems.push(`${receipt.id} derived "${d.name}" has no derivation defined here`);
            continue;
        }
        const pc = record.payload.policyContext;
        const failed = JSON.stringify(pc.builtinRulesEvaluated.filter((x) => !pc.builtinRulesPassed.includes(x)));
        if (d.shown !== failed) problems.push(`${receipt.id} failed-rules: page shows ${d.shown}, derived ${failed}`);
    }
    return problems;
}

async function main() {
    const selfTest = process.argv.includes('--self-test');
    let html, ledgerBytes, manifest, audit, signature, anchors;
    try {
        html = await fs.readFile(path.join(ROOT, 'receipt.html'), 'utf8');
        ledgerBytes = await fs.readFile(path.join(ROOT, 'evidence/ledger.jsonl'));
        manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'evidence/manifest.json'), 'utf8'));
        audit = R.parseLedger(await fs.readFile(path.join(ROOT, 'evidence/audit.jsonl'), 'utf8'));
        signature = await fs.readFile(path.join(ROOT, 'evidence/signature.txt'), 'utf8');
        anchors = JSON.parse(await fs.readFile(path.join(ROOT, 'evidence/anchors.json'), 'utf8'));
    } catch (e) {
        console.error(`\n  UNCHECKED  ${e.message}\n`);
        process.exit(UNCHECKED);
    }

    const ledger = R.parseLedger(ledgerBytes.toString('utf8'));
    const receipts = receiptsIn(html);
    const problems = [];

    if (receipts.length === 0) {
        console.error('\n  UNCHECKED  receipt.html contains no receipts, which cannot be right.\n');
        process.exit(UNCHECKED);
    }
    let fieldCount = 0;

    for (const rc of receipts) {
        const record = ledger.find((r) => r.id === rc.id);
        if (!record) {
            problems.push(`${rc.id} is on the page and not in evidence/ledger.jsonl`);
            continue;
        }
        const v = await R.verifyReceipt(ledger, rc.id);
        if (!v.contents) problems.push(`${rc.id} does not re-derive`);
        if (!v.position) problems.push(`${rc.id} position check fails at record ${v.firstBreak.index + 1}: ${v.firstBreak.reason}`);
        if (rc.fields.length === 0) problems.push(`${rc.id} displays no data-field values, so nothing on it is checked`);
        fieldCount += rc.fields.length + rc.derived.length;

        if (selfTest) {
            const mutated = { ...rc, fields: rc.fields.map((f, i) => (i === 0 ? { ...f, shown: f.shown + 'x' } : f)) };
            if (valueProblems(mutated, record).length === 0) problems.push('SELF-TEST: an altered displayed value was not caught');
        }
        problems.push(...valueProblems(rc, record));
    }

    const shownAt = /data-manifest="generatedAt">([^<]*)</.exec(html);
    if (!shownAt || shownAt[1] !== manifest.generatedAt)
        problems.push(`the page's export date is ${shownAt ? shownAt[1] : 'missing'}; manifest.json says ${manifest.generatedAt}`);

    const fileHash = await R.sha256Hex(new Uint8Array(ledgerBytes));
    if (fileHash !== manifest.files?.['ledger.jsonl']?.sha256)
        problems.push('evidence/ledger.jsonl does not match the sha256 manifest.json gives for it');

    // ── 4. The limits, executed ─────────────────────────────────────────────
    const deny = receipts.find((r) => ledger.find((x) => x.id === r.id)?.decision.startsWith('DENY'));
    if (!deny) problems.push('the page has no refused receipt, and the demonstration runs on one');
    else {
        const denyIndex = ledger.findIndex((x) => x.id === deny.id);
        if (denyIndex <= ALTER_INDEX) problems.push(`the refused receipt must come after record ${ALTER_INDEX + 1} for the demonstration to mean anything`);
        const altered = JSON.parse(JSON.stringify(ledger));
        altered[ALTER_INDEX].outcome = altered[ALTER_INDEX].outcome === 'EXECUTED' ? 'REJECTED' : 'EXECUTED';
        const a = await R.verifyReceipt(altered, deny.id);
        if (a.position) problems.push('LIMIT: the page says altering an earlier record breaks the position check. It did not.');
        const rewritten = await R.rewriteFrom(ledger, ALTER_INDEX, (r) => {
            r.outcome = r.outcome === 'EXECUTED' ? 'REJECTED' : 'EXECUTED';
        });
        const b = await R.verifyReceipt(rewritten, deny.id);
        if (!(b.position && b.contents))
            problems.push(
                'LIMIT: the page says a full rewrite from an altered record verifies. It no longer does — if that is a real improvement, the page is now understating CAIRN and must be rewritten.',
            );
    }

    // ── 5. What the page says about this bundle's protections ───────────────
    const unsigned = signature.trim().startsWith('UNSIGNED');
    if (!unsigned) problems.push('signature.txt holds a signature, and receipt.html says this bundle is UNSIGNED. Rewrite the copy.');
    if ((anchors.tokens || []).length !== 0) problems.push('anchors.json holds timestamp tokens, and receipt.html says it holds none. Rewrite the copy.');
    if (!/UNSIGNED/.test(html)) problems.push('receipt.html no longer states that the bundle is unsigned');

    const cov = R.crossCheckAudit(audit, ledger);

    console.log(
        `\n  Receipts — ${receipts.length} on the page, ${fieldCount} displayed value(s) · ${cov.withReceipt} of ${cov.gateEvents} gate decision(s) have a receipt\n`,
    );
    if (problems.length) {
        console.error('  receipt.html DISAGREES WITH THE BUNDLE:\n');
        for (const p of problems) console.error(`    ${p}`);
        console.error('');
        process.exit(1);
    }
    console.log(`  The page says what evidence/ says, and the limits it states still hold.${selfTest ? ' Self-test caught the mutation.' : ''}\n`);
}

main();
