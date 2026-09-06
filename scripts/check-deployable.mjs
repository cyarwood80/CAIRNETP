#!/usr/bin/env node
/**
 * scripts/check-deployable.mjs
 * -----------------------------
 * Everything the pages link to is something the deploy will actually contain.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * `vercel.json` names static files explicitly rather than globbing `*.html`,
 * because `vercel build` runs against the working directory and a glob swept up
 * `seo_dashboard.html` and two mockups on a local `vercel deploy`. That decision
 * was right and `DEPLOYMENT-NOTES.md` records it, including the sentence:
 *
 *     "A new page is one line, and forgetting that line fails loudly with a 404
 *      rather than quietly publishing whatever else is lying around."
 *
 * It failed loudly on the very next deploy, to the person who wrote it.
 * `register.html` and `evidence/` were added after that list and never added to
 * it, so production served a 404 for the register and — worse — for
 * `evidence/ledger.jsonl`, which is what the homepage verifier fetches. The hero
 * of the site read **"Could not check the bundle — the ledger returned 404."**
 *
 * Failing loudly is not the same as being caught. A note in a document is not a
 * check, and the note said what would happen without preventing it.
 *
 * ── WHAT IT CHECKS ──────────────────────────────────────────────────────────
 *
 * Every local `href`, `src` and fetched path in the pages resolves to a file the
 * `builds` list covers. External URLs, anchors and `mailto:` are skipped.
 *
 * ── WHAT IT CANNOT SEE ──────────────────────────────────────────────────────
 *
 * A path assembled at runtime from variables. `chain-verify.js` fetches a
 * literal `evidence/ledger.jsonl`, which is why the literal is matched — a path
 * built by concatenation would not be found, and this would pass while the page
 * still 404s. Keep asset paths literal.
 *
 * Exit 0 everything referenced is deployable · 1 something is not · 2 UNCHECKED.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNCHECKED = 2;

const PAGES = ['index.html', 'register.html', 'compliance.html', 'gallery.html', 'licensing.html', 'book.html'];
const SCRIPTS = ['js/main.js', 'js/chain-verify.js'];

/** Turn a `builds` src into a test for whether it covers a given path. */
export function coverage(builds) {
    const globs = builds.map((b) => b.src);
    return (rel) => {
        const p = rel.replace(/\\/g, '/');
        return globs.some((g) => {
            if (g === p) return true;
            if (g.endsWith('/**')) return p.startsWith(g.slice(0, -2));
            return false;
        });
    };
}

/** Local paths a page or script refers to. */
export function referencedPaths(src) {
    const found = new Set();
    for (const m of src.matchAll(/(?:href|src)="([^"]+)"/g)) found.add(m[1]);
    for (const m of src.matchAll(/fetch\(\s*'([^']+)'/g)) found.add(m[1]);
    for (const m of src.matchAll(/fetch\(\s*"([^"]+)"/g)) found.add(m[1]);
    return [...found].filter(
        (u) =>
            !/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/.test(u) &&
            // `/api/*` is routed to the Python function, not to a file on disk.
            // Asserting a file exists for it would report the contact form as
            // broken while it works, which is the reassuring direction to be
            // wrong in and therefore the one to rule out explicitly.
            !/^\/?api\//.test(u) &&
            u.trim() !== '',
    );
}

async function main() {
    let config;
    try {
        config = JSON.parse(await fs.readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
    } catch (e) {
        console.error(`\n  UNCHECKED  vercel.json could not be read (${e.message}).\n`);
        process.exit(UNCHECKED);
    }
    const builds = config.builds || [];
    if (builds.length === 0) {
        console.error('\n  UNCHECKED  vercel.json declares no builds, so nothing could be checked against.\n');
        process.exit(UNCHECKED);
    }
    const covered = coverage(builds);

    const problems = [];
    let checked = 0;

    for (const rel of [...PAGES, ...SCRIPTS]) {
        let src;
        try {
            src = await fs.readFile(path.join(ROOT, rel), 'utf8');
        } catch {
            // A page named here and absent is itself worth reporting: the list
            // above is the site's own idea of what it publishes.
            problems.push(`${rel} is referenced by this check and does not exist`);
            continue;
        }

        for (const ref of referencedPaths(src)) {
            checked++;
            const clean = ref.split('#')[0].split('?')[0].replace(/^\.?\//, '');
            if (clean === '') continue;

            const onDisk = await fs
                .access(path.join(ROOT, clean))
                .then(() => true)
                .catch(() => false);

            if (!onDisk) problems.push(`${rel} -> ${ref}  (no such file)`);
            else if (!covered(clean)) problems.push(`${rel} -> ${ref}  (exists, but no builds entry covers it — it will 404 in production)`);
        }
    }

    if (checked === 0) {
        console.error('\n  UNCHECKED  no local references were found in any page, which cannot be right.\n');
        process.exit(UNCHECKED);
    }

    console.log(`\n  ${checked} local reference(s) across ${PAGES.length} page(s) and ${SCRIPTS.length} script(s)\n`);

    if (problems.length === 0) {
        console.log('  Everything the pages reference is on disk and covered by a builds entry.\n');
        return;
    }

    console.error('  NOT DEPLOYABLE:\n');
    for (const p of problems) console.error(`    ${p}`);
    console.error(
        '\n  Add the file to `builds` in vercel.json. The explicit list is deliberate —\n' +
            '  see DEPLOYMENT-NOTES.md — and this is the check that makes forgetting a line\n' +
            '  fail here rather than on the live site.\n',
    );
    process.exitCode = 1;
}

if (process.argv[1] && path.basename(process.argv[1]) === 'check-deployable.mjs') {
    main().catch((e) => {
        console.error(`check-deployable failed: ${e.message}`);
        process.exit(UNCHECKED);
    });
}
