/**
 * scripts/pages.mjs
 * -----------------
 * The pages this site publishes. ONE list, read by every check.
 *
 * Until 2026-09-16 the list existed five times — in check-deployable,
 * check-footer, check-typography and sync-icons, and as `LIVE_PAGES` in the
 * CAIRN repository's claims gate — plus as a `builds` entry in vercel.json and a
 * `<url>` in sitemap.xml. Adding receipt.html meant editing seven places, and
 * missing one fails silently: a page absent from check-footer simply has its
 * footer never compared. That is W2's shape (register.html, never added to
 * LIVE_PAGES, unchecked in the only mode that gated anything) waiting for the
 * next page.
 *
 * So the four local lists read this, and `check-deployable.mjs` asserts the two
 * that cannot import it — every page has a builds entry and a sitemap entry —
 * and that every root .html file is either here or exempt with a reason.
 * CAIRN's `LIVE_PAGES` is in another repository and stays a copy; its own
 * `undeclaredLivePages()` already fails when a page on disk is missing from it.
 */

export const PAGES = [
    'index.html',
    'compliance.html',
    'licensing.html',
    'gallery.html',
    'book.html',
    'receipt.html',
];

/** Root .html files that are not pages. Each needs a reason. */
export const EXEMPT = [
    {
        match: /^google[0-9a-f]+\.html$/i,
        why: 'Google Search Console ownership token. One line, no prose, not a page.',
    },
];

/** Root .html names that are neither declared nor exempt. */
export function undeclared(names) {
    return names
        .filter((n) => n.toLowerCase().endsWith('.html'))
        .filter((n) => !PAGES.includes(n))
        .filter((n) => !EXEMPT.some((e) => e.match.test(n)));
}
