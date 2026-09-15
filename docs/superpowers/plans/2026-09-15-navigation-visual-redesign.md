# Navigation and Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a experiência da Nandices mais intuitiva e visualmente marcante, com descoberta rápida de produtos e pedido claro pelo WhatsApp.

**Architecture:** A composição React existente continuará responsável pelas três páginas. Um componente pequeno de orientação de pedido e uma folha visual final consolidarão a nova experiência sem alterar regras comerciais ou criar fluxo de checkout.

**Tech Stack:** React 19, CSS responsivo, Vite, Node Test Runner e Playwright existente.

**Spec:** `docs/superpowers/specs/2026-09-15-navigation-visual-redesign.md`

## Global Constraints

- Preservar `/`, `/docinhos` e `/frete` como únicas páginas reais.
- Preservar WhatsApp como único fluxo de conversão.
- Não adicionar dependências, carrinho, checkout, login, backend ou novas imagens.
- Preservar a caixa completa de Doces Personalizados na Home.

---

### Task 1: Clareza da jornada e composição da Home

**Files:**
- Create: `src/components/OrderGuide.jsx`
- Modify: `src/main.jsx`
- Modify: `src/components/BrandHero.jsx`
- Test: `tests/hero-ui.test.js`

**Interfaces:**
- Produces: `<OrderGuide />`, seção estática com três passos e nenhum estado.
- Consumes: `BrandHero({docinhos})` e as seções existentes da Home.

- [ ] Escrever testes estáticos para a promessa artesanal, os três passos e a ordem catálogo → história.
- [ ] Executar `node --test tests/hero-ui.test.js` e confirmar falha.
- [ ] Adicionar contexto de localização/produção ao hero, criar `OrderGuide` e mover Sobre para depois da oferta.
- [ ] Executar o teste focado e confirmar aprovação.

### Task 2: Catálogo navegável e informação comercial

**Files:**
- Modify: `src/components/SweetsCatalog.jsx`
- Modify: `tests/catalog.test.js`

**Interfaces:**
- Consumes: `sweets`, `personalizedExample`, `Photo`, `money(TASTING.price)`.
- Produces: botões de categoria com contagem, Caixa com preço/antecedência e Personalizados com foto.

- [ ] Escrever testes para contagens, preço/antecedência e foto de Personalizados.
- [ ] Executar `node --test tests/catalog.test.js` e confirmar falha.
- [ ] Implementar as informações no catálogo sem ocultar nenhum dos 12 produtos.
- [ ] Executar o teste focado e confirmar aprovação.

### Task 3: Sistema visual editorial e responsividade

**Files:**
- Create: `src/experience.css`
- Modify: `src/main.jsx`
- Test: `tests/hero-ui.test.js`

**Interfaces:**
- Consumes: classes existentes de hero, cards, catálogo, Personalizados, Caixa, contato e header.
- Produces: tokens visuais, barra horizontal de categorias, cards editoriais e layouts mobile/desktop.

- [ ] Criar expectativa de importação final de `experience.css` e executar o teste focado em vermelho.
- [ ] Implementar estilos com foco visível, alvos mínimos de 44 px e breakpoints de 760/1100 px.
- [ ] Executar testes focados e `npm test`.
- [ ] Executar `npm run build`, inspeção visual em 390/768/1440 px e `git diff --check`.

### Task 4: Encerramento verificável

**Files:**
- Modify: somente arquivos que falharem na verificação.

**Interfaces:**
- Consumes: site completo e suíte existente.
- Produces: build reproduzível sem regressões.

- [ ] Confirmar ausência de overflow, imagens quebradas e erros de console.
- [ ] Confirmar navegação Home, Docinhos, Personalizados, Frete e WhatsApp.
- [ ] Executar novamente `npm test` e `npm run build` antes da conclusão.
- [ ] Registrar um commit local único e manter `.worktrees/` intocado.

