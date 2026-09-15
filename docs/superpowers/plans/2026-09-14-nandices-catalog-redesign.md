# Nandices Catalog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy order configurator with a three-page digital catalog that converts product and estimate interest through WhatsApp.

**Architecture:** Keep the existing React/Vite/Cloudflare Worker application and manual pathname routing. `/`, `/docinhos`, and `/frete` are the only public pages; the Worker and Vite dev middleware redirect legacy `/encomenda` paths to `/docinhos`. Catalog data remains in `src/data/catalog.js`; pure estimate and WhatsApp helpers are separated from UI and analytics.

**Tech Stack:** React 19, Vite 7, Cloudflare Worker, Node test runner, Playwright, CSS, Sharp.

**Spec:** `docs/superpowers/specs/2026-09-14-nandices-catalog-redesign-design.md`

## Global Constraints

- Public/indexable pages are exactly `/`, `/docinhos`, and `/frete`; do not add routes, route libraries, pages, hashes, or public deep links.
- `/encomenda` and `/encomenda/` are legacy-only HTTP 301 redirects to `/docinhos`.
- Header destinations are Logo → `/`, Bolos → `/`, Doces Personalizados → `/`, Docinhos → `/docinhos`, Caixa Degustação → `/docinhos`, Frete → `/frete`; Encomenda does not exist.
- Catalog renders all 12 items simultaneously: 6 Tradicionais, 5 Gourmet, 1 Pistache. Category controls scroll internally without changing URL or history.
- No Configurator, order state, order session, flavor distribution, cup selection, cart, checkout, or payment remains.
- Docinhos and cake calculators start collapsed; the former rounds estimates to commercial multiples of 50, while the latter uses `max(1.5, guests / 10)` and R$ 90/kg.
- Forminhas are informative; Caixa is inside `/docinhos`; Bolos and Doces Personalizados stay in Home.
- WhatsApp is the conversion path; GA4 is optional and receives no PII. Freight behavior and Mapbox/ViaCEP Worker behavior remain intact.
- Preserve the approved local hero AVIF/preload work, add no unnecessary dependencies, do not deploy or merge `main`.
- Every task ends GREEN: migrate all imports and consumers before deleting a file, run its focused tests and relevant build, and commit only the integrated state.

---

## File map

| File | Planned responsibility |
|---|---|
| `src/main.jsx` | manual page composition, final header, Home, no order state |
| `src/components/SweetsCatalog.jsx` | all category sections and catalog-local content composition |
| `src/components/ProductCard.jsx` | catalog card and product WhatsApp CTA |
| `src/components/Planner.jsx` | collapsed sweets estimator without storage/configurator handoff |
| `src/components/ExpandableSection.jsx` | existing accessible collapsed-panel primitive |
| `src/components/WhatsApp.jsx` | rename to `WhatsAppLink.jsx` if imports are updated in the same task |
| `src/components/CakeCalculator.jsx` | new collapsed cake estimator |
| `src/components/ForminhasSection.jsx` | new informative cups section |
| `src/components/TastingBox.jsx` | new canonical tasting-box section |
| `src/lib/planning.js` | retain only `estimateSweets` and new `estimateCake` |
| `src/lib/orders.js` | replace with `src/lib/whatsapp.js`; no analytics dependency |
| `src/lib/analytics.js` | valid catalog events and only the three page paths |
| `src/lib/session.js`, `src/components/Configurator.jsx` | remove after consumer search |
| `src/data/routes.js`, `vite.config.js`, `worker/index.js` | three-route SEO/static output, dev redirect, production redirect |
| `src/pages.css`, `src/style.css`, `src/refinements.css` | header/catalog/calculator layouts and legacy CSS removal |
| `tests/*.test.js` | replace order-flow coverage with redirect, catalog, calculator, navigation, SEO and analytics coverage |
| `README.md`, `docs/*.md` | accurate catalog architecture and historical-doc cleanup |

### Task 1: Preserve the current diff, isolate execution, and establish a catalog test baseline

**Files:**
- Create: temporary backup branch/commit and linked worktree during execution

**Interfaces:**
- Produces: the isolated worktree that every remaining task uses; baseline output for `npm test` and `npm run build`.

- [ ] **Step 1: Invoke `superpowers:using-git-worktrees` and inspect the current checkout**

Run: `git status --short`, `git diff --stat`, `git diff --staged --stat`, `git branch --show-current`.

Expected: the audited unstaged hero and legacy-order changes are visible; no staged change is accidentally included.

- [ ] **Step 2: Make a safety point without treating it as product code**

Create branch `codex/backup-pre-catalog-redesign`, stage the current audited diff on that branch, and commit it as `chore: backup pre-catalog redesign worktree state`. Create a `codex/nandices-catalog-redesign` worktree from that backup commit. Continue only in the linked worktree; do not reset, restore, or overwrite the source checkout.

- [ ] **Step 3: Run baseline commands in the worktree**

Run: `npm ci`, `npm test`, `npm run build`.

Expected: record each exit code before changing behavior. If a baseline command fails, invoke `superpowers:systematic-debugging` and record root cause before implementation.

- [ ] **Step 4: Record a green baseline and keep the setup integrated**

Run: `node --test tests/delivery.test.js tests/delivery-ui.test.js tests/delivery-errors.test.js tests/delivery-proxy.test.js`.

Expected: PASS. Do not remove an imported helper, component, or test file in this setup task; no product commit is made here.

### Task 2: Replace order helpers with pure estimates and independent WhatsApp links

**Files:**
- Modify: `src/lib/planning.js`, `src/data/commerce.js`, `src/components/Planner.jsx`
- Create: `src/lib/whatsapp.js`, `tests/whatsapp.test.js`
- Modify: `src/components/WhatsApp.jsx`, `src/components/Delivery.jsx`, `src/main.jsx`
- Create: `tests/catalog-architecture.test.js`

**Interfaces:**
- Produces: `estimateSweets(eventId, guests)` returning `{event,guests,rawMin,rawMax,min,max}`.
- Produces: `estimateCake(guests)` returning `{guests,kg,estimatedCents}`.
- Produces: `createWhatsAppLink(message)`, `productMessage(name)`, `sweetsEstimateMessage(result)`, `cakeEstimateMessage(result)`, `deliveryMessage(mode,address,quote)`, and the single public `PHONE` export from `src/lib/whatsapp.js`.
- Consumes: `EVENTS`, `LOT_SIZE`, `CAKE`, `money`, and `number` from `src/data/commerce.js`.

- [ ] **Step 1: Confirm commercial units and write failing helper tests**

Read `src/data/commerce.js` before editing and record that `CAKE.perKg` is cents when its configured value is `9000`. Derive expected monetary assertions from `CAKE.perKg` or resulting cents; do not add a second phone or price constant in tests.

In `tests/catalog-architecture.test.js`, add:

```js
import {estimateSweets,estimateCake} from '../src/lib/planning.js';
import {CAKE} from '../src/data/commerce.js';
test('estimativas mantêm a faixa do evento e arredondam apenas para múltiplos comerciais de 50',()=>{
 assert.deepEqual(estimateSweets('aniversario',40),{event:'Aniversário',guests:40,rawMin:120,rawMax:200,min:150,max:200});
});
test('estimativa de bolo usa a unidade monetária configurada',()=>{
 assert.equal(CAKE.perKg,9000);
 assert.deepEqual(estimateCake(23),{guests:23,kg:2.3,estimatedCents:20700});
});
```

In `tests/whatsapp.test.js`, add:

```js
import {estimateCake} from '../src/lib/planning.js';
import {PHONE,createWhatsAppLink,productMessage} from '../src/lib/whatsapp.js';
for(const [guests,kg,cents] of [[5,1.5,13500],[10,1.5,13500],[20,2,18000],[23,2.3,20700],[25,2.5,22500],[35,3.5,31500]]){
 test(`bolo para ${guests} convidados`,()=>assert.deepEqual(estimateCake(guests),{guests,kg,estimatedCents:cents}));
}
test('link de produto codifica uma consulta sem pressupor pedido',()=>{
 const url=new URL(createWhatsAppLink(productMessage('Pistache')));
 assert.equal(url.pathname,`/${PHONE}`);
 assert.match(url.searchParams.get('text'),/Pistache/);
 assert.doesNotMatch(url.searchParams.get('text'),/undefined|null|NaN|Quantidade:/i);
});
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/catalog-architecture.test.js tests/whatsapp.test.js`.

Expected: FAIL because `estimateCake` and `src/lib/whatsapp.js` are absent.

- [ ] **Step 3: Implement minimal pure helpers**

Keep `planEvent` only if renamed to `estimateSweets`; its rounding is:

```js
const roundToCommercialQuantity=value=>Math.max(LOT_SIZE,Math.ceil(value/LOT_SIZE)*LOT_SIZE);
export function estimateCake(guests){
 if(!Number.isSafeInteger(guests)||guests<1)throw new RangeError('Informe uma quantidade inteira de convidados maior que zero.');
 const kg=Math.max(CAKE.minKg,guests/10);
 return {guests,kg,estimatedCents:Math.round(kg*CAKE.perKg)};
}
```

Create `whatsapp.js` as the single telephone/message source and move link construction, product/estimate messages, and unchanged delivery message there. Leave `track` exclusively in analytics-facing code. Keep legacy order exports temporarily because `Configurator.jsx` still consumes them; Task 3 removes those consumers and then deletes the legacy helpers.

- [ ] **Step 4: Update current consumers in one pass**

Change `WhatsApp.jsx`, `Delivery.jsx`, `Planner.jsx`, and `main.jsx` imports to `whatsapp.js`; import `track` from `analytics.js` rather than from a WhatsApp helper. Add `estimateSweets` and `estimateCake` without deleting order helpers yet. Do not change delivery calculation, CEP validation, Mapbox/ViaCEP calls, Worker behavior, cost calculation, or delivery-message wording beyond importing the same message helper.

- [ ] **Step 5: Confirm GREEN and legacy absence**

Run: `node --test tests/catalog-architecture.test.js tests/whatsapp.test.js tests/delivery.test.js tests/delivery-ui.test.js tests/delivery-errors.test.js tests/delivery-proxy.test.js`.

Expected: tests PASS; Delivery behavior is unchanged and WhatsApp links derive their pathname from the one exported `PHONE` value.

- [ ] **Step 6: Refactor names and commit**

Use `estimateSweets` consistently in new UI/tests, preserve `LOT_SIZE` as the estimate rounding constant, and remove unused imports. Run the focused tests and `npm run build`, then `git add src tests && git commit -m "refactor: add estimate and whatsapp helpers"`.

### Task 3: Add real legacy redirects and restrict routes, SEO, and analytics to three pages

**Files:**
- Modify: `worker/index.js`, `vite.config.js`, `src/data/routes.js`, `src/lib/analytics.js`, `src/main.jsx`, `src/lib/planning.js`
- Modify: `tests/seo.test.js`, `tests/analytics-ui.test.js`, `tests/performance-ui.test.js`, `tests/order-rules.test.js`, `tests/orders.test.js`, `tests/order-flow-ui.test.js`
- Create: `tests/legacy-redirect.test.js`
- Remove: `src/components/Configurator.jsx`, `src/lib/orders.js`, `src/lib/session.js`, `tests/order-improvements.test.js`, `tests/order-session-ui.test.js`

**Interfaces:**
- Produces: Worker `fetch()` returns `Response.redirect(new URL('/docinhos', request.url),301)` for both legacy paths.
- Produces: Vite dev/preview middleware returns the equivalent 301 before SPA fallback.

- [ ] **Step 1: Write failing redirect and route-list tests**

```js
for(const path of ['/encomenda','/encomenda/']) test(`${path} is a permanent legacy redirect`,async()=>{
 const response=await worker.fetch(new Request(`https://example.test${path}`),{ASSETS:{fetch:async()=>new Response('asset')}});
 assert.equal(response.status,301);
 assert.equal(response.headers.get('location'),'https://example.test/docinhos');
});
test('route metadata exposes only public pages',()=>assert.deepEqual(Object.keys(routeMetadata),['/','/docinhos','/frete']));
test('legacy React order route is not rendered',async()=>{
 await page.goto(base+'/encomenda');
 await expect(page.locator('#configurador')).toHaveCount(0);
});
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/legacy-redirect.test.js tests/seo.test.js tests/analytics-ui.test.js`.

Expected: FAIL because the Worker delegates `/encomenda` to assets and metadata includes it.

- [ ] **Step 3: Implement the smallest route changes**

Add the two-path redirect before `/api/*` and `env.ASSETS.fetch` in `worker/index.js`. Add matching Vite dev and preview middleware before static fallback. Remove `/encomenda` from `routeMetadata`, the React route, `Configurator` imports/lazy imports, order state, session reads, callbacks, and static HTML generation. Migrate/delete every remaining Configurator consumer in this same task, then delete `Configurator.jsx`, `orders.js`, `session.js`, legacy order functions in `planning.js`, and their dedicated tests. Make analytics pageviews accept only the remaining metadata keys.

- [ ] **Step 4: Confirm GREEN**

Run: `node --test tests/legacy-redirect.test.js tests/seo.test.js tests/analytics-ui.test.js tests/order-rules.test.js tests/orders.test.js tests/order-flow-ui.test.js`.

Expected: PASS; sitemap assertions count exactly three `<loc>` elements.

- [ ] **Step 5: Commit**

Run: `rg -n "Configurator|readSession|saveSession|finalOrderMessage|resizeOrder|summarizeOrder|order-v2" src tests` and verify no consumer remains.

Run: `npm run build`, then `git add worker vite.config.js src tests && git commit -m "refactor: remove legacy order flow and redirect route"`.

### Task 4: Convert the catalog and cards to simultaneous categories with internal scrolling

**Files:**
- Modify: `src/components/SweetsCatalog.jsx`, `src/components/ProductCard.jsx`, `src/main.jsx`, `src/pages.css`, `src/style.css`
- Create: `tests/catalog-ui.test.js`

**Interfaces:**
- Consumes: `sweets` and `productMessage`.
- Produces: category sections with internal element IDs/ref targets; controls call `element.scrollIntoView({behavior})` and do not call History APIs.

- [ ] **Step 1: Write a failing browser test for all catalog behavior**

```js
await page.goto(base+'/docinhos');
await expect(page.locator('[data-category="Tradicional"] article')).toHaveCount(6);
await expect(page.locator('[data-category="Gourmet"] article')).toHaveCount(5);
await expect(page.locator('[data-category="Pistache"] article')).toHaveCount(1);
const before=await page.url();
await page.getByRole('button',{name:'Gourmet',exact:true}).click();
await expect(page.locator('[data-category="Gourmet"]')).toBeInViewport();
assert.equal(page.url(),before);
await expect(page.getByText('Adicionar à encomenda')).toHaveCount(0);
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/catalog-ui.test.js`.

Expected: FAIL because the catalog filters to one category and category controls are buttons with filter state.

- [ ] **Step 3: Implement simultaneous rendering and cards**

Group `sweets` by existing `category` in data order; render three `<section data-category=...>` blocks. Render category buttons that scroll internal section elements with `behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'`. Keep URL unchanged. Remove filter state, count/status for filtered data, selection panel, order props, and all ProductCard selected rendering. Give cards a `WA` CTA with `productMessage(product.name)`.

- [ ] **Step 4: Add sticky-safe and mobile CSS**

Apply `scroll-margin-top` to category sections, use `flex-wrap` or stacked category controls at narrow widths, and preserve existing responsive grids. Remove selectors only used by `.filters`, `.selection-panel`, `.select-sweet`, and order selection.

- [ ] **Step 5: Confirm GREEN at compact and desktop widths**

Run: `node --test tests/catalog-ui.test.js tests/product-links.test.js`.

Expected: PASS with all 12 cards at 390 and 1440 widths, correct WhatsApp encoding, and no selection controls.


- [ ] **Step 6: Confirm the integrated catalog task and commit**

Run: `npm run build` and `rg -n "activeCategory|setCategory|filteredProducts|selected|onToggle" src/components/SweetsCatalog.jsx src/components/ProductCard.jsx`. Expected: build PASS and no filter/selection implementation remains. Then `git add src tests && git commit -m "feat: convert docinhos to vertical catalog"`.

### Task 5: Add both estimators and informative catalog sections

**Files:**
- Create: `src/components/CakeCalculator.jsx`, `src/components/ForminhasSection.jsx`, `src/components/TastingBox.jsx`
- Modify: `src/components/Planner.jsx`, `src/components/SweetsCatalog.jsx`, `src/main.jsx`, `src/data/commerce.js`, `src/pages.css`, `src/style.css`
- Modify: `tests/catalog-ui.test.js`, `tests/catalog-architecture.test.js`

**Interfaces:**
- Consumes: `estimateSweets`, `estimateCake`, `sweetsEstimateMessage`, `cakeEstimateMessage`, `TASTING`, `CUPS`, and `ExpandableSection`.
- Produces: collapsed accessible estimator buttons and static Forminhas/Tasting sections without selection state.

- [ ] **Step 1: Write failing browser and unit assertions**

```js
await expect(page.getByRole('button',{name:'Em dúvida de quantos docinhos pedir?'})).toHaveAttribute('aria-expanded','false');
await page.getByRole('button',{name:'Em dúvida de quantos docinhos pedir?'}).click();
await page.fill('#guests','40');
await page.getByRole('button',{name:'Calcular quantidades'}).click();
await expect(page.locator('.planner-result')).toContainText('150');
for(const label of ['Branquinho','Pistache','Chocolate']) await expect(page.getByText(label,{exact:true})).toBeVisible();
await expect(page.getByText(/12 sabores/)).toBeVisible();
```

```js
assert.throws(()=>estimateCake(0));
assert.throws(()=>estimateCake(1.5));
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/catalog-ui.test.js tests/catalog-architecture.test.js`.

Expected: FAIL because components and identifiers do not exist or Planner still offers configurator handoff.

- [ ] **Step 3: Implement calculator boundaries**

Refactor `Planner.jsx` to show only event, guests, rounded sweets range, estimate note, and a WhatsApp link. It uses local `useState` only and sends `sweets_calculator_completed` through analytics. Create `CakeCalculator.jsx` with guest input, explicit invalid-input alert, `estimateCake`, pt-BR `number`/`money`, and `cake_calculator_completed`; use `ExpandableSection` with title “Em dúvida de quanto bolo pedir?”. Place it inside the Home cake section.

- [ ] **Step 4: Inspect assets and implement static Forminhas and canonical TastingBox**

Before code, inspect `public/images/forminhas` and `public/images/products/degustacao` with the command native to the active shell, such as `find public/images/forminhas -maxdepth 1 -type f` and `find public/images/products/degustacao -maxdepth 1 -type f` on Unix-like shells, or `Get-ChildItem public/images/forminhas -File` and `Get-ChildItem public/images/products/degustacao -File` in PowerShell; compare the result with existing image references in `src/main.jsx` and `src/data/catalog.js`. If the approved files remain `branquinho.webp`, `pistache.webp`, `chocolate.webp`, and `caixa-catalogo-azul.webp`, add explicit centralized data such as `FORMINHAS = [{name:'Branquinho',image:'/images/forminhas/branquinho.webp'}, ...]` and `TASTING.image = '/images/products/degustacao/caixa-catalogo-azul.webp'` in `src/data/commerce.js`. If an inspected path differs, place the actual path in that same mapping. `ForminhasSection` maps the explicit data, never derives filenames with `toLowerCase()`, presents explanatory copy, and contains no interactive selection element. `TastingBox` consumes the inspected central image path plus `TASTING.units`, `TASTING.price`, and `TASTING.leadDays`; mount it only in `SweetsCatalog`. Change the Home presentation to a compact `/docinhos` teaser.

- [ ] **Step 5: Confirm GREEN**

Run: `node --test tests/catalog-ui.test.js tests/catalog-architecture.test.js`.

Expected: PASS; both calculators are initially closed, sweets estimates use 50 multiples, cake cases match cents derived from `CAKE.perKg`, Forminhas have no `aria-pressed`, and Tasting uses the inspected central asset with 12/R$65/7 days.

- [ ] **Step 6: Commit**

Run: `git add src tests && git commit -m "feat: add catalog estimators and informative options"`.

### Task 6: Finalize global header, Home composition, analytics, and responsive CSS

**Files:**
- Modify: `src/main.jsx`, `src/lib/analytics.js`, `src/components/WhatsApp.jsx`, `src/pages.css`, `src/style.css`, `src/refinements.css`
- Modify: `tests/catalog-ui.test.js`, `tests/analytics-ui.test.js`, `tests/hero-ui.test.js`, `tests/docinhos-banner.test.js`, `tests/performance-ui.test.js`

**Interfaces:**
- Consumes: final header destinations and `analyticsEvents` allowlist.
- Produces: navigation with five commercial links, optional mobile Início, and analytics events independent of navigation or WhatsApp navigation.

- [ ] **Step 1: Write failing navigation and analytics tests**

```js
const links=await page.locator('#navigation a:not(.nav-whatsapp)').evaluateAll(items=>items.map(a=>[a.textContent.trim(),a.getAttribute('href')]));
assert.deepEqual(links,[['Bolos','/'],['Doces Personalizados','/'],['Docinhos','/docinhos'],['Caixa Degustação','/docinhos'],['Frete','/frete']]);
await expect(page.getByRole('link',{name:'Encomenda',exact:true})).toHaveCount(0);
assert.equal(analyticsEvents.has('whatsapp_order'),false);
assert.equal(analyticsEvents.has('planner_to_configurator'),false);
await page.goto(base+'/');
const personalized=page.locator('#personalizados');
await expect(personalized).toContainText('Doces Personalizados');
await expect(personalized).toContainText('50 unidades');
await expect(personalized).toContainText('45 dias');
await expect(personalized.getByRole('link',{name:/Solicitar doces personalizados/})).toHaveAttribute('href',/^https:\/\/wa\.me\//);
await expect(personalized.getByRole('heading',{name:/Bolos e doces personalizados/i})).toHaveCount(0);
await expect(page.locator('#bolos')).not.toContainText('45 dias');
const tastingTeaser=page.locator('[data-testid="tasting-teaser"]');
await expect(tastingTeaser.getByRole('link',{name:/Ver no catálogo/})).toHaveAttribute('href','/docinhos');
await expect(tastingTeaser).not.toContainText('7 dias');
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/analytics-ui.test.js tests/docinhos-banner.test.js tests/hero-ui.test.js`.

Expected: FAIL because header still includes Encomenda and analytics includes order events.

- [ ] **Step 3: Implement final navigation and event allowlist**

Replace navigation tuples in `main.jsx`; retain sticky/mobile menu behavior and close it on link click. Remove the old order teaser and render four Home sweets plus a `data-testid="tasting-teaser"` compact teaser linking to `/docinhos`, not a second complete TastingBox. Preserve the existing `#personalizados` section as “Doces Personalizados”, its 50-unit rule, 45-day rule, and WhatsApp CTA; do not apply 45 days to `#bolos` or rename the service. Replace analytics names with `product_whatsapp_click`, `tasting_box_whatsapp_click`, `sweets_calculator_completed`, `cake_calculator_completed`, existing freight events, and Instagram events. Keep safe fields numeric/string only and omit PII fields such as CEP, address, message, name, and telephone.

- [ ] **Step 4: Make responsive behavior explicit**

At 320, 360, 390, 430, 520, and 768 px, use the existing collapsed menu rather than horizontal compression; verify menu toggle focus/keyboard. At 1024, 1050, 1280, and 1440 px verify header spacing, card grids, and calculator layout. Remove stale order CSS after `rg` finds no DOM consumer.

- [ ] **Step 5: Confirm GREEN**

Run: `node --test tests/analytics-ui.test.js tests/docinhos-banner.test.js tests/hero-ui.test.js tests/performance-ui.test.js`.

Expected: PASS; no order events/pageviews, hero preload remains valid for final routes, header has final destinations, Personalizados preserves its commercial content, and the Home only contains the compact Tasting teaser.

- [ ] **Step 6: Commit**

Run: `git add src tests && git commit -m "feat: update global catalog navigation"`.

### Task 7: Rewrite documentation, audit legacy, and perform final evidence-based verification

**Files:**
- Modify: `README.md`, `docs/pendencias.md`, `docs/ga4-e-icones.md`, `docs/consolidacao.md`, `docs/reestruturacao-2026-09-12.md`
- Remove: `docs/encomenda.md`
- Modify: test files affected by outdated documentation assumptions

**Interfaces:**
- Consumes: final running implementation, build output, tests, and current `docs/frete.md` facts.
- Produces: accurate operational documentation and an evidence report for review.

- [ ] **Step 1: Write a failing documentation consistency test**

Add to `tests/catalog-architecture.test.js`:

```js
const readme=await readFile('README.md','utf8');
for(const text of ['catálogo digital','/docinhos','/frete','301','Doces Personalizados','R$90/kg','1,5kg','45 dias','Mapbox']) assert.match(readme,new RegExp(text,'i'));
assert.doesNotMatch(readme,/configurador de encomenda|montar encomenda|continuar encomenda/i);
```

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/catalog-architecture.test.js`.

Expected: FAIL because the current README describes the configurator.

- [ ] **Step 3: Rewrite operational documentation**

Rewrite README with real stack/commands, the three pages, legacy redirect, catalog vertical behavior, calculators, Forminhas, Caixa, personalized rules, freight, analytics/PII, SEO, deployment architecture, and stable rules. Document the final header exactly: Logo, Bolos, and Doces Personalizados → `/`; Docinhos and Caixa Degustação → `/docinhos`; Frete → `/frete`. State that Bolos/Personalizados are Home sections, Caixa/categories/calculators are Docinhos sections, and none are pages. Delete `docs/encomenda.md`. Mark prior order-architecture documents in `docs/consolidacao.md` and `docs/reestruturacao-2026-09-12.md` as `STATUS: HISTÓRICO / SUPERADO`; update GA4 event names and leave `docs/frete.md` technically unchanged. Reduce `docs/pendencias.md` to unresolved facts only.

- [ ] **Step 4: Confirm GREEN and audit dead concepts**

Run: `node --test tests/catalog-architecture.test.js`.

Run: `rg -n -i "Configurator|Montar encomenda|Continuar encomenda|Adicionar à encomenda|selectedFlavor|distribution|order draft|order summary|cup selection|order-v2" src tests README.md docs`.

Expected: documentation test PASS; remaining hits are only redirect test or explicitly historical documents.

- [ ] **Step 5: Execute full verification**

Run: `npm test`, `npm run build`, `node scripts/check-ui.mjs`, `node scripts/check-performance.mjs`.

Capture temporary screenshots for Home, Docinhos, and Frete at 390 and 1440 px, then inspect all required widths: 320, 360, 390, 430, 520, 768, 1024, 1050, 1280, 1440. Check console errors, scroll width, menu opening/closing, calculator closed/open states, catalog controls retaining `/docinhos`, and asset load success.

- [ ] **Step 6: Run required review and completion skills**

Invoke `superpowers:requesting-code-review` for spec compliance and quality. Resolve findings with focused tests. Invoke `superpowers:verification-before-completion`; compare README, code, Worker response, sitemap, analytics and visual evidence against the spec before claiming completion.

- [ ] **Step 7: Commit documentation and verification work**

Run: `git add README.md docs tests && git commit -m "docs: document whatsapp catalog architecture"`.

## Plan self-review

- **Spec coverage:** Tasks 1–7 cover backup/worktree, TDD, legacy redirect, three-page navigation, simultaneous catalog, internal scroll, calculators, inspected/centralized Forminhas and Caixa assets, personalized rules and teaser regression, WhatsApp/analytics separation, SEO, docs, visual checks, dead-code audit, review, and final verification.
- **Placeholder scan:** The plan contains no deferred implementation markers; each behavior task defines its focused test, failing command, minimal implementation boundary, passing command, and commit.
- **Interface consistency:** Task 2 defines `estimateSweets`, `estimateCake`, `PHONE`, and WhatsApp helper exports used by Tasks 4–6. Task 3 migrates the final Configurator/order/session consumers before deleting their files and defines the route contract consumed by SEO/navigation tests. No later task depends on a legacy order helper.
