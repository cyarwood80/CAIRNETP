#!/usr/bin/env node
/**
 * scripts/check-footer.mjs
 * ------------------------
 * One footer, byte for byte, on every page.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * There were FOUR footers on a five-page site, and they had drifted far enough
 * to be different components:
 *
 *   index.html                    `.footer-col-title` + `.footer-links`
 *   licensing / gallery / book    a bare <h4> and a plain <ul> inside
 *                                 `.footer-col`, which has NO RULES AT ALL
 *   compliance.html               a fourth shape again
 *
 * `.footer-col` matching nothing meant those lists rendered with user-agent
 * bullets and user-agent link blue, on a site that had just been through a
 * typography pass. A reader reported it as "too many fonts" — they were reading
 * unstyled markup, which is what an unstyled list looks like from the outside.
 *
 * The links had drifted too. gallery.html pointed at `index.html#trust-plane`,
 * an id that has never existed, and the homepage anchors were RELATIVE — so
 * `#architecture` in a footer shared by five pages was a dead link on four of
 * them. That is the same defect the header fix hit on 2026-09-06, sitting
 * quietly at the bottom of every page.
 *
 * ── WHAT IT CHECKS ──────────────────────────────────────────────────────────
 *
 * The `<footer>…</footer>` block on every page must be identical to the one on
 * index.html, ignoring only line endings — these pages are checked out CRLF and
 * a check that is always red is a check somebody switches off.
 *
 * It does NOT check that the links resolve. `check-deployable.mjs` covers local
 * files; nothing yet resolves in-page anchors across pages, and saying so is
 * better than implying a passing run means the footer works.
 *
 * Exit 0 identical · 1 drifted · 2 UNCHECKED (could not look).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNCHECKED = 2;

const CANONICAL = 'index.html';
const PAGES = ['compliance.html', 'licensing.html', 'gallery.html', 'book.html'];

function footerOf(html) {
    const start = html.indexOf('<footer class="site-footer">');
    if (start === -1) return null;
    const end = html.indexOf('</footer>', start);
    if (end === -1) return null;
    return html.slice(start, end + '</footer>'.length).replace(/\r\n/g, '\n');
}

async function main() {
    let base;
    try {
        base = footerOf(await fs.readFile(path.join(ROOT, CANONICAL), 'utf8'));
    } catch (e) {
        console.error(`\n  UNCHECKED  could not read ${CANONICAL} (${e.message}).\n`);
        process.exit(UNCHECKED);
    }
    if (!base) {
        console.error(`\n  UNCHECKED  ${CANONICAL} has no <footer class="site-footer"> to compare against.\n`);
        process.exit(UNCHECKED);
    }

    const drifted = [];
    let compared = 0;

    for (const page of PAGES) {
        let html;
        try {
            html = await fs.readFile(path.join(ROOT, page), 'utf8');
        } catch {
            continue;
        }
        const f = footerOf(html);
        if (f === null) {
            drifted.push(`${page}  has no site-footer block`);
            continue;
        }
        compared += 1;
        if (f !== base) {
            const i = [...f].findIndex((ch, n) => ch !== base[n]);
            drifted.push(
                `${page}  differs from ${CANONICAL} at character ${i}\n` +
                    `        expected: ${JSON.stringify(base.slice(i, i + 60))}\n` +
                    `        found:    ${JSON.stringify(f.slice(i, i + 60))}`,
            );
        }
    }

    // A run that compared nothing has established nothing.
    if (compared === 0) {
        console.error('\n  UNCHECKED  no pages were compared.\n');
        process.exit(UNCHECKED);
    }

    if (drifted.length === 0) {
        console.log(`\n  One footer, identical on ${compared + 1} page(s).\n`);
        return;
    }

    console.error(`\n  ${drifted.length} page(s) with a footer of their own:\n`);
    for (const d of drifted) console.error(`    ${d}`);
    console.error(`\n    Copy the block from ${CANONICAL}. There is one footer.\n`);
    process.exitCode = 1;
}

main().catch((e) => {
    console.error(`check-footer failed: ${e.message}`);
    process.exit(UNCHECKED);
});
