# Deployment notes

What the routing in `vercel.json` is for, what has been verified, and what has
not. Kept beside the config because JSON cannot hold a comment and the reasoning
is the part that rots first.

## The shape

`builds` names the static files explicitly and `api/index.py` as a function.
`routes` sends `/api/*` and the extensionless page aliases to Python, and
everything else to the filesystem.

**Before this, `routes` was a single entry sending `/(.*)` to `api/index.py`.**
Every stylesheet, script and image was therefore served by a Python lambda.
Measured against production on 2026-09-06: homepage 1.44s, `css/styles.css`
0.46s, `Cache-Control: public, max-age=0, must-revalidate`, `X-Vercel-Cache:
MISS` on every request. Nothing was edge-cached, ever.

## The static list is explicit, deliberately

It used to be tempting to write `{ "src": "*.html" }`. That glob was tried and
removed: `vercel build` runs against the working directory rather than against
git, so on a local `vercel deploy` it swept up `mockup_live_hybrid.html`,
`mockup_v290.html` and **`seo_dashboard.html`** — all `.gitignore`d, none of them
meant to be public, and the last one an internal dashboard. A CI deploy from git
would not have included them, which is exactly what makes it the kind of mistake
that ships on the one occasion somebody deploys from their laptop.

Name the pages. A new page is one line, and forgetting that line fails loudly
with a 404 rather than quietly publishing whatever else is lying around.

## What was verified, and how

Run against `vercel dev` on a detached worktree of the branch:

| | |
| --- | --- |
| Every route returns 200 with full content | `/`, `/book`, `/licensing`, `/gallery`, `/compliance`, `/css/*`, `/js/*`, `/assets/*`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`, `/api/health` |
| Pages are served from the filesystem, not the function | the Python function built once, for `/api/health`, and no page or asset request touched it |
| All five security headers reach an HTML response | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| `api/index.py` reports the right version | `/api/health` → `2.10.1` |
| `vercel.json` passes Vercel's own schema | an earlier revision carried a `"// note"` key as a comment; the CLI rejected it, and it would have failed the real deploy |

## What is NOT verified

**The `Cache-Control` headers on `/assets/*`, `/css/*` and `/js/*`.**
`vercel dev` returns `public, max-age=0, must-revalidate` for every static file
regardless of configuration — it disables caching locally on purpose — so a
correct header and a dropped header look identical there. The first revision set
them alongside a `dest` rewrite, which is a no-op that lets the filesystem phase
serve the file with its own headers; they are now set with `continue: true` and
no `dest`, which is the form that should survive. **Should**, not does.

Check it on a real deployment:

```
curl -sI https://<deployment>/css/styles.css | grep -i cache-control
curl -sI https://<deployment>/assets/cairn-logo.svg | grep -i cache-control
```

Expect `max-age=3600` and `max-age=31536000, immutable`. If they still say
`max-age=0`, the route-level header is not being applied in legacy `routes` mode
and the fix is to migrate off `builds`/`routes` onto `rewrites`/`headers`, which
cannot be mixed with `routes` and is therefore a separate change.

The move off the lambda is the change that mattered and it is verified. The cache
headers are the improvement on top, and they are not.

## Preview deployments are protected

The Vercel preview URLs return the Vercel login page rather than the site, so
they cannot be checked anonymously. Either open the preview while signed in, or
set a protection-bypass secret for automation.
