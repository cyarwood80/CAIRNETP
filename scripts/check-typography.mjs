#!/usr/bin/env node
/**
 * scripts/check-typography.mjs
 * -----------------------------
 * One scale. Every font size resolves to a token.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * The site had **45 distinct font sizes** across its stylesheets and pages, and
 * twelve of them sat between 0.72rem and 0.95rem — 0.72, 0.75, 0.76, 0.78, 0.8,
 * 0.82, 0.85, 0.86, 0.88, 0.9, 0.92, 0.95. That is not a scale. It is twelve
 * separate decisions, and it is why a page can feel slightly wrong without a
 * reader being able to point at anything: the small type is never quite the same
 * small type twice.
 *
 * The CAIRN application has enforced exactly this rule on itself for months —
 * *"One scale, one weight set, one tracking set. Every font variable resolves."*
 * — and it rejected a stray `letter-spacing: 0.04em` on the day this was
 * written. A site selling that product should hold to what the product does.
 *
 * ── WHAT IT CHECKS, AND WHAT IT DOES NOT ────────────────────────────────────
 *
 * Every `font-size` must be `var(--text-*)`, and every token named must exist in
 * `:root`. A `clamp()` is allowed only through the three fluid tokens, because a
 * range replaced by a fixed step is a behaviour removed rather than a value
 * tidied.
 *
 * ── WEIGHTS AND FAMILIES, ADDED 2026-09-06 ─────────────────────────────────
 *
 * This file used to say, in as many words, that it checked sizes and "says
 * nothing about weights". Measuring the rendered pages found what that silence
 * had cost:
 *
 *   * A THIRD TYPEFACE. `.modal-close-btn` is a <button> with no font-family,
 *     so the close cross took the user agent default — Arial — on all five
 *     pages, on a site that loads exactly two families.
 *   * FIVE WEIGHTS, TWO OF THEM ORNAMENTAL. 400 on 325 elements, 700 on 131,
 *     600 on 69 — then 800 on five and 500 on two. A weight used twice across a
 *     whole site is not a decision anybody repeated, and each one is a font file
 *     on the critical path.
 *   * TWO DIFFERENT FONT REQUESTS. index.html and book.html asked Google for
 *     eight Jakarta weights; the other three asked for seven. A reader moving
 *     between pages re-fetched a stylesheet that should have been a cache hit.
 *
 * So the rule is now the one the product holds itself to — one scale, one weight
 * set — and it is enforced rather than aspired to: every font-weight must be in
 * WEIGHTS, every font-family must be a var(--font-*), and every page must carry
 * the same Google Fonts request.
 *
 * It still says nothing about whether the sizes are the RIGHT sizes, or about
 * line heights and spacing. Those are worth doing and are not done here;
 * claiming otherwise would make a passing run mean more than it does.
 *
 * Exit 0 every size resolves · 1 one does not · 2 UNCHECKED (could not look).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNCHECKED = 2;

/**
 * The weight set. Three, matching what the pages request from Google. Adding a
 * fourth means adding a font file, so it should be a decision rather than a
 * keystroke — which is what this list makes it.
 */
const WEIGHTS = new Set(['400', '600', '700', 'normal', 'bold', 'inherit']);

/** Every page sends the same request, or the second page pays for the first. */
const FONT_REQUEST =
    'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&family=Instrument+Sans:wght@400;600&display=swap';

const PAGES = ['index.html', 'compliance.html', 'gallery.html', 'licensing.html', 'book.html'];

const FILES = [
    'css/styles.css',
    'css/hybrid_additions.css',
    'index.html',
    'compliance.html',
    'gallery.html',
    'licensing.html',
    'book.html',
];

/** Token names declared in `:root`, from the stylesheet itself. */
export function declaredTokens(css) {
    return new Set([...css.matchAll(/(--text-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

/**
 * Every font-size declaration that is not a token reference.
 *
 * The token DEFINITIONS are `--text-x: 0.8rem`, never `font-size:`, so they are
 * not matched by this and do not have to be excluded by name — an exclusion list
 * would have to be maintained by whoever just added the thing it excludes.
 */
export function rawSizes(src) {
    // ── COMMENTS ARE NOT DECLARATIONS ───────────────────────────────────────
    // Stripped first, because the moment this file existed a comment explaining
    // why a rule has no `font-size` was itself reported as a `font-size` outside
    // the type system. That is the assertion-matching-its-own-explanation trap,
    // committed by the checker written to enforce discipline -- the seventh time
    // this project has hit it.
    //
    // Replaced with spaces rather than removed, so the line numbers in every
    // report still point at the real line.
    const blank = (m) => m.replace(/[^\n]/g, ' ');
    src = src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/<!--[\s\S]*?-->/g, blank);

    const out = [];
    const re = /font-size:\s*([^;}"']+)/g;
    let m;
    while ((m = re.exec(src))) {
        const value = m[1].trim();
        if (/^var\(--text-[a-z0-9-]+\)$/.test(value)) continue;

        // The root size is the exception, and it has to be: `html { font-size:
        // 16px }` is what a `rem` MEANS. Expressing it as a rem token would make
        // the scale define itself in terms of itself. Matched on the preceding
        // selector rather than on the value, so a stray `16px` anywhere else is
        // still reported.
        if (/html\s*\{[^}]*$/.test(src.slice(0, m.index))) continue;
        const line = src.slice(0, m.index).split('\n').length;
        out.push({ value, line });
    }
    return out;
}

async function main() {
    let css;
    try {
        css = await fs.readFile(path.join(ROOT, 'css', 'styles.css'), 'utf8');
    } catch (e) {
        console.error(`\n  UNCHECKED  could not read css/styles.css (${e.message}).\n`);
        process.exit(UNCHECKED);
    }

    const tokens = declaredTokens(css);
    if (tokens.size === 0) {
        console.error('\n  UNCHECKED  no --text-* tokens are declared, so nothing could be checked against.\n');
        process.exit(UNCHECKED);
    }

    const problems = [];
    const used = new Set();
    let declarations = 0;

    for (const rel of FILES) {
        let src;
        try {
            src = await fs.readFile(path.join(ROOT, rel), 'utf8');
        } catch {
            continue;
        }
        declarations += (src.match(/font-size:/g) || []).length;
        for (const { value, line } of rawSizes(src)) {
            problems.push(`${rel}:${line}  font-size: ${value}  — use a --text-* token`);
        }
        for (const m of src.matchAll(/var\((--text-[a-z0-9-]+)\)/g)) {
            used.add(m[1]);
            if (!tokens.has(m[1])) problems.push(`${rel}  var(${m[1]}) is used and never declared`);
        }

        // One weight set.
        for (const m of src.matchAll(/font-weight:\s*([a-z0-9-]+)/gi)) {
            if (!WEIGHTS.has(m[1].toLowerCase()))
                problems.push(`${rel}  font-weight: ${m[1]}  — the set is 400, 600, 700`);
        }

        // Two families, both behind a token. A raw stack here is how a third
        // typeface arrives deliberately; a MISSING declaration is how Arial did.
        for (const m of src.matchAll(/font-family:\s*([^;\n}"]+)/gi)) {
            const v = m[1].trim();
            if (!/^var\(--font-(?:heading|body|mono)\)$/.test(v))
                problems.push(`${rel}  font-family: ${v}  — use var(--font-heading|body|mono)`);
        }
    }

    for (const rel of PAGES) {
        let src;
        try {
            src = await fs.readFile(path.join(ROOT, rel), 'utf8');
        } catch {
            continue;
        }
        const requests = [...src.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g)].map(
            (m) => m[0],
        );
        if (requests.length !== 1) {
            problems.push(`${rel}  ${requests.length} Google Fonts request(s), expected exactly 1`);
        } else if (requests[0] !== FONT_REQUEST) {
            problems.push(`${rel}  font request differs from the other pages:\n      ${requests[0]}`);
        }
    }

    // A run that found no declarations at all has established nothing. The site
    // has a stylesheet; zero means this did not look.
    if (declarations === 0) {
        console.error('\n  UNCHECKED  no font-size declarations were found in any file.\n');
        process.exit(UNCHECKED);
    }

    console.log(`\n  ${declarations} font-size declaration(s) · ${tokens.size} tokens declared · ${used.size} used\n`);

    if (problems.length === 0) {
        console.log('  One scale, one weight set (400/600/700), three families, one font request.\n');
        const unused = [...tokens].filter((t) => !used.has(t));
        if (unused.length) console.log(`  Declared and unused: ${unused.join(', ')}\n`);
        return;
    }

    console.error(`  ${problems.length} declaration(s) outside the type system:\n`);
    for (const p of problems.slice(0, 25)) console.error(`    ${p}`);
    if (problems.length > 25) console.error(`    …and ${problems.length - 25} more`);
    console.error('');
    process.exitCode = 1;
}

if (process.argv[1] && path.basename(process.argv[1]) === 'check-typography.mjs') {
    main().catch((e) => {
        console.error(`check-typography failed: ${e.message}`);
        process.exit(UNCHECKED);
    });
}
