#!/usr/bin/env node
/**
 * scripts/build-register.mjs
 * ---------------------------
 * Generate `register.html` from the CAIRN source repository's `docs/CLAIMS.md`.
 *
 * ── WHY THIS IS GENERATED AND NOT WRITTEN ───────────────────────────────────
 *
 * The register is the most defensible page CAIRN has: 143 claims, each with a
 * status, the code that implements it, and — for the `Partial` ones — the
 * limitation stated in the row rather than in a footnote. No competitor in AI
 * governance publishes their own limitations.
 *
 * Which is exactly why it must not be retyped. A hand-copied register drifts
 * from the real one, and a stale claim on a marketing page is the failure the
 * register exists to prevent, committed by the page that advertises it. The
 * generator reads the source of truth; if the two disagree, this file loses.
 *
 *     node scripts/build-register.mjs --claims ../CAIRN/docs/CLAIMS.md
 *
 * ── WHAT IT DELIBERATELY DOES NOT DO ────────────────────────────────────────
 *
 * It does not filter. Every row ships, including `Never`, `Partial` and
 * `Roadmap`, and the counts at the top are of what is actually there. A register
 * that quietly published only the `Works` rows would be worse than no register:
 * it would carry the credibility of full disclosure while being a highlight reel.
 *
 * It does not rewrite the prose. The limitation text is the register's, verbatim.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNCHECKED = 2;

const STATUSES = ['Works', 'Partial', 'Roadmap', 'Never', 'Deferred'];

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Inline markdown the register actually uses: `code` and **bold**. */
function inline(s) {
    return esc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/_([^_]+)_/g, '<em>$1</em>');
}

/**
 * Parse the register into sections of rows.
 *
 * Split on `|` outside backticks, because implementation cells routinely contain
 * a pipe inside code — `Get-Service | Where-Object` — and a naive split silently
 * shifts every later column by one. The failure is quiet: a status column that
 * suddenly holds a file path still renders.
 */
export function splitRow(line) {
    const cells = [];
    let cur = '';
    let inCode = false;
    for (const ch of line) {
        if (ch === '`') inCode = !inCode;
        if (ch === '|' && !inCode) {
            cells.push(cur);
            cur = '';
        } else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.trim()).filter((c, i, a) => !(i === 0 && c === '') && !(i === a.length - 1 && c === ''));
}

export function parseRegister(md) {
    const sections = [];
    let section = null;
    for (const line of md.split('\n')) {
        const heading = /^##\s+(.+?)\s*$/.exec(line);
        if (heading) {
            section = { title: heading[1], rows: [] };
            sections.push(section);
            continue;
        }
        if (!section || !line.trim().startsWith('|')) continue;
        const cells = splitRow(line);
        // Two cells is a valid row. `| Multi-tenant / RBAC | **Roadmap** |` has no
        // implementation column BECAUSE IT IS NOT IMPLEMENTED, and requiring
        // three silently dropped it -- discarding one of the most honest rows in
        // the register from the page whose whole argument is that nothing is
        // hidden. A filter that removes the failures is the exact defect this
        // page exists to disprove.
        if (cells.length < 2) continue;
        if (/^-+$/.test(cells[0].replace(/[\s|:-]/g, '') || '-')) continue;
        if (/^claim$/i.test(cells[0])) continue;

        const status = STATUSES.find((s) => new RegExp(`\\*\\*${s}\\b`, 'i').test(cells[1]));
        if (!status) continue;
        section.rows.push({ claim: cells[0], status, implementation: cells[2] || '', notes: cells[3] || '' });
    }
    return sections.filter((s) => s.rows.length > 0);
}

async function main() {
    const argIdx = process.argv.indexOf('--claims');
    const claimsPath = argIdx > -1 ? process.argv[argIdx + 1] : path.join(ROOT, '..', 'CAIRN', 'docs', 'CLAIMS.md');

    let md;
    try {
        md = await fs.readFile(claimsPath, 'utf8');
    } catch (e) {
        console.error(`\n  UNCHECKED  could not read the register at ${claimsPath} (${e.message}).`);
        console.error('             register.html was NOT regenerated, and the published one may be stale.\n');
        process.exit(UNCHECKED);
    }

    const sections = parseRegister(md);
    const rows = sections.flatMap((s) => s.rows);
    if (rows.length === 0) {
        console.error('\n  UNCHECKED  no claim rows parsed. The register format has changed, or this parser is wrong.\n');
        process.exit(UNCHECKED);
    }

    const counts = {};
    for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
    const reconciled = (/Last reconciled: \*\*([0-9-]+)\*\*/.exec(md) || [])[1] || 'unknown';

    const chips = STATUSES.filter((s) => counts[s]).map(
        (s) =>
            `<span class="reg-count reg-count-${s.toLowerCase()}"><strong>${counts[s]}</strong> ${esc(s)}</span>`,
    );

    const body = sections
        .map(
            (s) => `
        <section class="reg-section">
          <h2>${esc(s.title)}</h2>
          <div class="reg-rows">
            ${s.rows
                .map(
                    (r) => `
            <article class="reg-row reg-${r.status.toLowerCase()}">
              <div class="reg-row-head">
                <h3>${inline(r.claim)}</h3>
                <span class="reg-status reg-status-${r.status.toLowerCase()}">${esc(r.status)}</span>
              </div>
              <div class="reg-impl">${inline(r.implementation)}</div>
              ${r.notes ? `<div class="reg-notes">${inline(r.notes)}</div>` : ''}
            </article>`,
                )
                .join('')}
          </div>
        </section>`,
        )
        .join('');

    const template = await fs.readFile(path.join(ROOT, 'scripts', 'register.template.html'), 'utf8');
    const html = template
        .replace('<!--TOTAL-->', String(rows.length))
        .replace('<!--CHIPS-->', chips.join(''))
        .replace('<!--RECONCILED-->', esc(reconciled))
        .replace('<!--ROWS-->', body);

    await fs.writeFile(path.join(ROOT, 'register.html'), html, 'utf8');

    console.log(`\n  register.html — ${rows.length} claims across ${sections.length} sections, reconciled ${reconciled}\n`);
    for (const s of STATUSES.filter((x) => counts[x])) console.log(`    ${String(counts[s]).padStart(4)}  ${s}`);
    console.log('');
}

if (process.argv[1] && path.basename(process.argv[1]) === 'build-register.mjs') {
    main().catch((e) => {
        console.error(`build-register failed: ${e.message}`);
        process.exit(UNCHECKED);
    });
}
