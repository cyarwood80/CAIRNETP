#!/usr/bin/env node
/**
 * scripts/check-metrics.mjs
 * --------------------------
 * The figures on the homepage say what `data/site-metrics.json` says.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * The hero strip was hardcoded HTML under a comment reading "Live Telemetry
 * Strip". It showed **2,856 automated tests** when the real figure was 3,303,
 * and **133 tracked claims** when the register held 143. Neither had ever been
 * live; both had simply drifted since somebody typed them.
 *
 * A number on a marketing page rots silently, and on a product whose proposition
 * is "our records can be trusted" a stale figure under the word *live* is the
 * same defect the product exists to prevent.
 *
 * So there is one source and a check that the page agrees with it. Declare, then
 * assert — the pattern CAIRN uses for its own claims register.
 *
 * ── WHAT IT CANNOT DO, STATED SO A PASS IS NOT READ AS MORE ─────────────────
 *
 * It cannot tell whether the figures are TRUE. `site-metrics.json` is a
 * declaration by a human, and this only proves the page repeats it faithfully.
 * Checking the values against the CAIRN source repository needs both repos in
 * one place, and that belongs in the release procedure that already publishes
 * the changelog — noted in `measuredAgainst` so a reader can see which version
 * the numbers were taken from.
 *
 * Exit 0 the page agrees · 1 it disagrees · 2 UNCHECKED (could not look).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNCHECKED = 2;

/** Every `data-metric` value in the page, as key → rendered text. */
export function metricsInPage(html) {
    const out = new Map();
    const re = /data-metric="([A-Za-z0-9_]+)"[^>]*>([^<]*)</g;
    let m;
    while ((m = re.exec(html))) out.set(m[1], m[2].trim());
    return out;
}

async function main() {
    let html, declared;
    try {
        html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
        declared = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'site-metrics.json'), 'utf8'));
    } catch (e) {
        console.error(`\n  UNCHECKED  could not read the page or the metrics file (${e.message}).\n`);
        process.exit(UNCHECKED);
    }

    const inPage = metricsInPage(html);
    const figures = declared.figures || {};

    // Zero is the answer a broken matcher gives. The page carries a strip, so
    // finding no metrics at all means this did not look, rather than that the
    // page is clean.
    if (inPage.size === 0) {
        console.error(
            '\n  UNCHECKED  no `data-metric` attributes were found in index.html.\n' +
                '             Either the strip was removed, or this check no longer matches the markup.\n',
        );
        process.exit(UNCHECKED);
    }

    const problems = [];
    for (const [key, meta] of Object.entries(figures)) {
        if (!inPage.has(key)) problems.push(`${key}: declared as "${meta.value}" and not shown on the page`);
        else if (inPage.get(key) !== meta.value)
            problems.push(`${key}: page shows "${inPage.get(key)}", metrics file declares "${meta.value}"`);
    }
    for (const key of inPage.keys()) {
        if (!figures[key]) problems.push(`${key}: shown on the page and not declared in data/site-metrics.json`);
    }

    console.log(
        `\n  Hero figures — ${inPage.size} on the page, ${Object.keys(figures).length} declared` +
            `  ·  measured ${declared.measuredAt} against ${declared.measuredAgainst}\n`,
    );

    if (problems.length === 0) {
        console.log('  The page says what data/site-metrics.json says.\n');
        return;
    }

    console.error('  DISAGREES:\n');
    for (const p of problems) console.error(`    ${p}`);
    console.error(
        '\n  Change data/site-metrics.json first, then the page. A figure that moves in\n' +
            '  one and not the other is how "2,856 automated tests" survived 447 tests of drift.\n',
    );
    process.exitCode = 1;
}

if (process.argv[1] && path.basename(process.argv[1]) === 'check-metrics.mjs') {
    main().catch((e) => {
        console.error(`check-metrics failed: ${e.message}`);
        process.exit(UNCHECKED);
    });
}
