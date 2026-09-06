/**
 * scripts/icons.mjs
 * -----------------
 * The icon set, as data. One definition per mark, drawn here rather than
 * fetched.
 *
 * ── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
 * Until 2026-09-06 every page pulled `font-awesome/6.4.0/css/all.min.css` from
 * cdnjs — **102,025 bytes, render-blocking, third-party** — to draw 34 distinct
 * marks. On a site whose argument is that CAIRN runs on your machine and phones
 * nowhere, the shop window could not render a heading without three external
 * origins. That is not only weight; it is the page contradicting the page.
 *
 * These are stroke drawings on a 24×24 grid at a single weight, so they inherit
 * `currentColor` and sit at the same optical weight as the type beside them.
 * Font Awesome mixes solid and outline glyphs at different optical weights,
 * which is part of why the old page read as a template.
 *
 * ── THE ONE BORROWED MARK ──────────────────────────────────────────────────
 * `github` is Simple Icons path data, **CC0-1.0** — public domain, no
 * attribution required. It is here because a repository link is a convention a
 * reader recognises before reading the label, and an approximation of a known
 * mark is worse than the mark.
 *
 * **Three marks were deliberately NOT drawn.** LinkedIn, Amazon and Windows are
 * trademarks Simple Icons no longer publishes. An approximation of a trademark
 * is a worse answer than a word, so those links are text now, or use a generic
 * mark: the Windows and Linux buttons already name the platform and the file
 * extension in the label, which is what a reader is actually looking for.
 *
 * ── HOW IT REACHES A PAGE ──────────────────────────────────────────────────
 * `scripts/sync-icons.mjs` writes a `<symbol>` sprite into each page between
 * markers, **containing only the marks that page uses**, and `--check` fails
 * the build when a page is stale or references a mark that is not defined here.
 * So a typo in a `<use href>` is a build failure rather than an invisible gap,
 * which is exactly the failure mode the icon font had: a wrong class name
 * rendered nothing and said nothing.
 */

/** Stroke geometry, stated once. */
export const STROKE = {
    'stroke-width': '1.7',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
};

/**
 * `body` is the symbol's contents. Stroke marks carry no fill and inherit
 * STROKE; a `filled` mark opts out of both.
 */
export const ICONS = {
    'arrow-right': { body: '<path d="M4 12h14.5"/><path d="M12.75 6.25 19 12l-6.25 5.75"/>' },
    'chevron-down': { body: '<path d="m6.5 9.75 5.5 5.25 5.5-5.25"/>' },
    menu: { body: '<path d="M4 7h16M4 12h16M4 17h16"/>' },
    check: { body: '<path d="m4.5 12.5 4.75 4.75L19.5 7"/>' },
    'check-circle': {
        body: '<circle cx="12" cy="12" r="8.75"/><path d="m8.1 12.2 2.75 2.75L16 9.8"/>',
    },
    minus: { body: '<path d="M6.5 12h11"/>' },
    ban: { body: '<circle cx="12" cy="12" r="8.75"/><path d="M5.8 5.8 18.2 18.2"/>' },
    'alert-circle': {
        body: '<circle cx="12" cy="12" r="8.75"/><path d="M12 7.5v5.25"/><circle cx="12" cy="16.4" r=".85" fill="currentColor" stroke="none"/>',
    },
    'help-circle': {
        body: '<circle cx="12" cy="12" r="8.75"/><path d="M9.55 9.6a2.5 2.5 0 1 1 3.6 2.35c-.75.42-1.15.95-1.15 1.8"/><circle cx="12" cy="16.5" r=".85" fill="currentColor" stroke="none"/>',
    },
    bolt: { body: '<path d="M13.6 2.75 5.5 13.4h5.6l-1.1 7.85 8.5-10.9h-5.7z"/>' },
    link: {
        body: '<path d="M10.1 13.9a4.4 4.4 0 0 0 6.25 0l2.6-2.6a4.42 4.42 0 0 0-6.25-6.25l-1.5 1.5"/><path d="M13.9 10.1a4.4 4.4 0 0 0-6.25 0l-2.6 2.6a4.42 4.42 0 0 0 6.25 6.25l1.5-1.5"/>',
    },
    eye: {
        body: '<path d="M2.75 12S6.6 5.9 12 5.9 21.25 12 21.25 12 17.4 18.1 12 18.1 2.75 12 2.75 12Z"/><circle cx="12" cy="12" r="2.9"/>',
    },
    key: {
        body: '<circle cx="8.1" cy="15.4" r="3.35"/><path d="M10.5 13 20 3.5"/><path d="m16.8 6.7 2.3 2.3"/><path d="m14.3 9.2 2.3 2.3"/>',
    },
    shield: { body: '<path d="M12 3 19.4 5.9v5.5c0 4.4-3 7.9-7.4 9.6-4.4-1.7-7.4-5.2-7.4-9.6V5.9z"/>' },
    'shield-check': {
        body: '<path d="M12 3 19.4 5.9v5.5c0 4.4-3 7.9-7.4 9.6-4.4-1.7-7.4-5.2-7.4-9.6V5.9z"/><path d="m8.7 11.8 2.4 2.4 4.2-4.4"/>',
    },
    mail: { body: '<rect x="3" y="5.5" width="18" height="13" rx="1.6"/><path d="m3.4 7 8.6 5.9L20.6 7"/>' },
    'mail-open': {
        body: '<path d="M3 10.4 12 4.2l9 6.2v8.1a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.5z"/><path d="m3 10.4 9 6.2 9-6.2"/>',
    },
    message: {
        body: '<path d="M20.5 5.6v8.2a1.6 1.6 0 0 1-1.6 1.6H9.6L5 19.4v-3.9h-.4A1.6 1.6 0 0 1 3 13.8V5.6A1.6 1.6 0 0 1 4.6 4h14.3a1.6 1.6 0 0 1 1.6 1.6Z"/>',
    },
    download: { body: '<path d="M12 3.4v11.2"/><path d="m7.4 10.2 4.6 4.6 4.6-4.6"/><path d="M4.2 19.8h15.6"/>' },
    'clipboard-check': {
        body: '<path d="M9.2 4.2h5.6v2.9H9.2z"/><path d="M14.8 5.6h2.9v14.2H6.3V5.6h2.9"/><path d="m8.9 12.9 2.2 2.2 3.9-4.1"/>',
    },
    'list-check': {
        body: '<path d="M9.5 6.5h10.5M9.5 12h10.5M9.5 17.5h10.5"/><path d="m3.4 6.2 1.3 1.3 2.2-2.4"/><path d="m3.4 11.7 1.3 1.3 2.2-2.4"/><path d="m3.4 17.2 1.3 1.3 2.2-2.4"/>',
    },
    stairs: { body: '<path d="M3.4 20.2v-3.9h4.4v-3.9h4.4V8.5h4.4V4.6h3.9"/>' },
    sliders: {
        body: '<path d="M4 7.2h8.6M17.4 7.2H20M4 16.8h4.6M13.4 16.8H20"/><circle cx="15" cy="7.2" r="2.4"/><circle cx="11" cy="16.8" r="2.4"/>',
    },
    server: {
        body: '<rect x="3.4" y="4.4" width="17.2" height="6.2" rx="1.5"/><rect x="3.4" y="13.4" width="17.2" height="6.2" rx="1.5"/><path d="M7 7.5h.02M7 16.5h.02"/>',
    },
    chip: {
        body: '<rect x="6.6" y="6.6" width="10.8" height="10.8" rx="1.6"/><path d="M9.9 9.9h4.2v4.2H9.9z"/><path d="M9.6 3.2v3.4M14.4 3.2v3.4M9.6 17.4v3.4M14.4 17.4v3.4M3.2 9.6h3.4M3.2 14.4h3.4M17.4 9.6h3.4M17.4 14.4h3.4"/>',
    },
    network: {
        body: '<rect x="9.2" y="3.2" width="5.6" height="4.4" rx="1"/><rect x="2.6" y="16.4" width="5.6" height="4.4" rx="1"/><rect x="15.8" y="16.4" width="5.6" height="4.4" rx="1"/><path d="M12 7.6v3.2M5.4 16.4v-2.4h13.2v2.4M12 10.8v3.2"/>',
    },
    laptop: { body: '<rect x="4.6" y="5" width="14.8" height="10" rx="1.5"/><path d="M2.4 18.6h19.2"/>' },
    monitor: {
        body: '<rect x="3" y="4.4" width="18" height="12.2" rx="1.6"/><path d="M9.4 20.2h5.2M12 16.6v3.6"/>',
    },
    terminal: {
        body: '<rect x="3" y="4.4" width="18" height="15.2" rx="1.8"/><path d="m7.6 9.6 2.8 2.6-2.8 2.6"/><path d="M13 15h3.6"/>',
    },
    users: {
        body: '<circle cx="9.2" cy="8.4" r="3.5"/><path d="M2.8 20c0-3.4 2.9-5.7 6.4-5.7s6.4 2.3 6.4 5.7"/><path d="M16.4 5.4a3.5 3.5 0 0 1 0 6"/><path d="M18.3 14.8c1.9.9 3 2.7 3 5.2"/>',
    },
    building: {
        body: '<path d="M4.2 20.4V4.4h9.6v16"/><path d="M13.8 9.6h6v10.8"/><path d="M7 8h1.4M11 8h1.4M7 12h1.4M11 12h1.4M7 16h1.4M11 16h1.4M16.4 13h1M16.4 16.6h1"/><path d="M2.6 20.4h18.8"/>',
    },
    quote: {
        body: '<path d="M9.6 6.4C6.8 7.5 5 9.7 5 12.6v5h5.6v-6.2H7.9c.2-1.4 1-2.4 2.4-3z"/><path d="M20 6.4c-2.8 1.1-4.6 3.3-4.6 6.2v5H21v-6.2h-2.7c.2-1.4 1-2.4 2.4-3z"/>',
    },
    /* Simple Icons, CC0-1.0. See the header: the only mark not drawn here. */
    github: {
        filled: true,
        body: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
    },
};

export const ICON_IDS = Object.keys(ICONS);
