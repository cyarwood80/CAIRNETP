#!/usr/bin/env node
/**
 * scripts/migrate-type-scale.mjs
 * -------------------------------
 * One-shot migration: 45 ad-hoc font sizes onto one scale.
 *
 * Run once, reviewed, then kept in the repository as the record of what moved
 * and by how much. `scripts/check-typography.mjs` is what enforces the result.
 *
 * ── WHY IT SNAPS TO THE NEAREST TOKEN ───────────────────────────────────────
 *
 * The point is one scale, not a redesign. Every value is mapped to the closest
 * token so the page looks like itself afterwards, and the drift is printed so
 * anything that moves more than a hair can be looked at rather than discovered.
 * A migration that silently resized headings would be rejected on sight, and the
 * scale would go with it.
 *
 *     node scripts/migrate-type-scale.mjs --check   report only
 *     node scripts/migrate-type-scale.mjs --write   rewrite the files
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The scale. Values chosen from the distribution actually in use so that the
 * dense body range (0.72–1.25rem, which is 130 of 154 declarations) snaps within
 * 0.05rem — under a pixel at a 16px root.
 */
export const SCALE = {
    '--text-2xs': 0.72,
    '--text-xs': 0.8,
    '--text-sm': 0.88,
    '--text-base': 0.95,
    '--text-md': 1.05,
    '--text-lg': 1.2,
    '--text-xl': 1.5,
    '--text-2xl': 1.75,
    // 2rem earns its own step: without it, three heading declarations moved 4px,
    // which is the one size of change a reader notices without being able to name.
    '--text-3xl': 2,
    '--text-4xl': 2.3,
    '--text-5xl': 2.75,
    '--text-display': 3.25,
};

const FILES = [
    'css/styles.css',
    'css/hybrid_additions.css',
    'index.html',
    'compliance.html',
    'gallery.html',
    'licensing.html',
    'book.html',
];

/** The token whose value is closest to `rem`, and how far it moved. */
export function nearest(rem) {
    let best = null;
    for (const [name, value] of Object.entries(SCALE)) {
        const drift = Math.abs(value - rem);
        if (!best || drift < best.drift) best = { name, value, drift };
    }
    return best;
}

async function main() {
    const write = process.argv.includes('--write');
    const moves = [];

    for (const rel of FILES) {
        const file = path.join(ROOT, rel);
        let src;
        try {
            src = await fs.readFile(file, 'utf8');
        } catch {
            continue;
        }

        // `clamp(...)` is left alone: those are deliberate responsive headings,
        // and snapping a fluid range to a fixed token would remove the behaviour
        // rather than tidy it. They are declared as tokens of their own instead.
        const out = src.replace(/font-size:\s*([0-9.]+)rem/g, (whole, num) => {
            const rem = parseFloat(num);
            const hit = nearest(rem);
            moves.push({ file: rel, from: rem, to: hit.name, toValue: hit.value, drift: hit.drift });
            return `font-size: var(${hit.name})`;
        });

        if (write && out !== src) await fs.writeFile(file, out, 'utf8');
    }

    const byDrift = [...new Map(moves.map((m) => [`${m.from}->${m.to}`, m])).values()].sort(
        (a, b) => b.drift - a.drift,
    );

    console.log(`\n  ${moves.length} declaration(s) mapped onto ${Object.keys(SCALE).length} tokens.\n`);
    console.log('  Largest movements (rem):\n');
    for (const m of byDrift.slice(0, 10)) {
        const px = (m.drift * 16).toFixed(1);
        console.log(
            `    ${String(m.from).padEnd(6)} -> ${m.to.padEnd(15)} ${String(m.toValue).padEnd(6)}  moved ${m.drift.toFixed(3)}rem (${px}px)`,
        );
    }
    const unchanged = moves.filter((m) => m.drift === 0).length;
    console.log(`\n  ${unchanged} of ${moves.length} did not move at all.`);
    console.log(write ? '\n  Files rewritten.\n' : '\n  Report only. Pass --write to apply.\n');
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
