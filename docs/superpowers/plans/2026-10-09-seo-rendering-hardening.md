# SEO Rendering and Hardening Implementation Plan

> **For agentic workers:** Execute this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Make the six public Nandices pages crawlable from their initial HTML, close the reported SEO/GEO and security gaps, and verify the local production build before any GitHub push.

**Architecture:** Pre-render the existing React page tree for each known route during the Vite build, then hydrate that same tree in the browser. Keep page metadata in the existing route map, serve discovery files as static assets, and use Cloudflare's asset 404 mode plus the Worker for accurate error responses and security headers. Cloudflare must serve the existing no-trailing-slash canonical URLs without adding a slash redirect.

**Tech Stack:** React 19, Vite 7, Node tests, Cloudflare Workers Static Assets.

**Spec:** User-provided Nandices SEO/GEO and security findings in the conversation on 2026-10-09; project context in `AGENTS.md`, `docs` and the Segundo Cérebro Nandices MOC.

## Global Constraints

- Keep the six canonical routes `/`, `/docinhos`, `/estimativa`, `/caixa-degustacao`, `/personalizados`, and `/frete`.
- Preserve `/encomenda` redirects and `/api/` behavior.
- Use facts and public copy already present in the site; do not invent business claims or expose secrets.
- Add no dependency and do not deploy the Cloudflare Worker.
- Preserve the unrelated untracked `.idea/` directory in the original checkout.
- Commit and push to `main` only after the local production build passes the requested SEO audit for the findings in scope.

## Review Focus

- Server and client renders must match for each route so React hydration preserves page content and behavior.
- All six routes must contain a unique H1 and descriptive content in raw HTML and link to the other public routes.
- `lastmod` must represent the significant content change and must not be regenerated on every build.
- CSP must allow only the site resources and the existing Google Analytics integration needs.
- Unknown paths and `/.well-known/mcp.json` must return a real 404 while valid route, asset, API and redirect behavior remains intact.

---

### Task 1: Pre-render and hydrate the public routes

**Files:**
- Create: `src/App.jsx`
- Modify: `src/main.jsx`
- Modify: `vite.config.js`
- Modify: `tests/seo.test.js`

**Acceptance criteria:**
- [x] Each of the six generated HTML files includes the rendered page H1, body content, and global route links before JavaScript runs.
- [x] The browser hydrates the same route tree without replacing the HTML or producing hydration errors.
- [x] Existing tests and build remain green.

### Task 2: Complete page metadata and crawler discovery

**Files:**
- Modify: `src/data/routes.js`
- Modify: `vite.config.js`
- Create: `public/llms.txt`
- Create: `public/AGENTS.md`
- Modify: `tests/seo.test.js`

**Acceptance criteria:**
- [x] Every route has distinct title, description, canonical, Open Graph and Twitter card metadata.
- [x] Every route description is 120–160 characters; the home copy is shorter than the reported truncation width.
- [x] Sitemap lists exactly the six canonical URLs and has a stable `lastmod` matching the content update.
- [x] `llms.txt` and `AGENTS.md` are plain, useful public files with links to the canonical pages; HTML declares the `llms.txt` link.

### Task 3: Add accurate 404s and missing security headers

**Files:**
- Modify: `public/_headers`
- Create: `public/404.html`
- Modify: `worker/index.js`
- Modify: `wrangler.jsonc`
- Create: `tests/security.test.js`

**Acceptance criteria:**
- [x] Existing security headers remain, and responses include HSTS, CSP and COOP.
- [x] Cloudflare serves a 404 response for unknown paths and the unimplemented MCP discovery URL.
- [x] Redirect, API, no-trailing-slash canonical routes, sitemap and static discovery files retain the expected status and content type.

### Final checkpoint

- [x] `npm test -- --test-concurrency=1` passes (64/64).
- [x] `npm run build` passes and emits six route HTML files plus sitemap and public discovery/error assets.
- [x] Cloudflare local preview confirms status codes, HSTS/CSP/COOP headers, route content, redirect and API behavior; browser checks confirm no-JavaScript content and hydration, including a simulated 2027 browser clock.
- [x] SEOmator full crawl with JavaScript rendering scores 92/A across six pages. SSR, unique H1s, Twitter metadata, semantic structure, schema consistency, discovery files, and custom 404 pass. The local HTTP audit reports protocol/canonical/sitemap-domain warnings because production canonicals and sitemap correctly use the HTTPS domain; direct local responses confirm all six `lastmod` entries and security headers. Its missing `.well-known` manifest warning is expected because this site does not publish an MCP service.
- [x] Final review findings are fixed: the sweets page now has distinct H1 text, and copyright output no longer varies with the server or browser year.
- [x] Commits were pushed to `main` after final review and the scoped checkpoint passed.
