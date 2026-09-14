# Nandices: catálogo digital com conversão pelo WhatsApp

**Status:** design registrado; aguarda aprovação da spec revisada antes do plano e da implementação.

## Objetivo e princípio do produto

Converter definitivamente a Nandices de configurador de encomendas em catálogo digital com ferramentas auxiliares de estimativa e conversão pelo WhatsApp. O fluxo final é **ver → entender → estimar, se necessário → chamar no WhatsApp**.

O site não terá carrinho, checkout, seleção persistente, distribuição de sabores, escolha interativa de forminha, revisão de pedido ou finalização automática. A identidade visual aprovada, fotos, Home, frete por CEP e demais conteúdos válidos serão preservados; esta mudança simplifica o produto e não é redesign geral.

## Arquitetura final de páginas

O site possui somente três páginas reais e indexáveis:

| Página | Responsabilidade |
|---|---|
| `/` | Home: hero, instituição, bolos, calculadora de bolos, quatro destaques, teaser de Caixa, personalizados e contato |
| `/docinhos` | Catálogo completo: categorias, calculadora de docinhos, Forminhas, Caixa Degustação e CTAs de WhatsApp |
| `/frete` | Estimativa de entrega independente |

Seções não são páginas: Bolos, Tradicionais, Gourmet, Pistache, calculadoras, Forminhas, Caixa Degustação, Personalizados, Sobre e Contato permanecem dentro dessas três páginas. Não serão criadas rotas para bolos, Caixa, calculadoras, categorias ou qualquer outro conteúdo.

`/encomenda` não é uma quarta página. Não terá React route, HTML, metadata, canonical, Open Graph, sitemap, analytics nem navegação interna. Para links antigos, o Worker Cloudflare responde a `GET /encomenda` e `GET /encomenda/` com `301 Location: /docinhos`, antes de `ASSETS.fetch`. O Vite disponibilizará middleware equivalente em desenvolvimento e testes HTTP.

## Navegação global sem deep links

O header sticky é compartilhado entre as três páginas; não cria destinos públicos adicionais. No desktop, links semânticos (`a`) seguem esta navegação simples:

| Item | Destino |
|---|---|
| Logo | `/` |
| Bolos | `/` |
| Doces Personalizados | `/` |
| Docinhos | `/docinhos` |
| Caixa Degustação | `/docinhos` |
| Frete | `/frete` |

No menu mobile, `Início → /` pode ser adicionado para clareza. O item Encomenda será removido. Os mesmos cinco destinos comerciais permanecem acessíveis pelo menu responsivo, sem compressão horizontal, truncamento, sobreposição ou overflow.

Não existirão contratos públicos de navegação por fragmento. Em particular, `/#bolos`, `/docinhos#degustacao`, `/docinhos#tradicionais`, `/docinhos#gourmet` e `/docinhos#pistache` não serão links internos, URLs documentadas, páginas, canonical, sitemap, histórico nem pageviews. Bolos leva à Home, e Caixa é descoberta no catálogo de Docinhos.

## Home

A Home preserva hero, identidade, Sobre a Nanda, bolos, doces personalizados, contato e exatamente quatro docinhos de destaque. O CTA da amostra será “Ver todos os docinhos” para `/docinhos`; nenhum CTA oferecerá montagem de encomenda.

Bolos permanecem dentro da Home com os quatro produtos existentes, fotos, descrições, R$ 90/kg e mínimo de 1,5 kg. A calculadora de bolos é um expansível inicialmente fechado nessa área, nunca uma página. Para inteiro positivo de convidados: `peso = max(1.5, convidados / 10)` kg e `preço = peso × R$ 90`, sem arredondamento comercial adicional. Casos obrigatórios: 5 e 10 pessoas = 1,5 kg/R$ 135; 20 = 2 kg/R$ 180; 23 = 2,3 kg/R$ 207; 25 = 2,5 kg/R$ 225; 35 = 3,5 kg/R$ 315. O resultado fornece CTA WhatsApp contextual sem presumir data, preço final ou disponibilidade.

A Caixa Degustação completa terá apresentação canônica somente em `/docinhos`. A apresentação atual da Home será reduzida a teaser compacto, quando mantida, com link para `/docinhos`; não haverá duas apresentações completas.

Doces Personalizados permanecem na Home com mínimo de 50 unidades e antecedência de 45 dias. O CTA principal direciona ao WhatsApp; essa antecedência não se aplica automaticamente a bolos. O serviço não será renomeado para “Bolos e doces personalizados”.

## Catálogo de docinhos

`/docinhos` concentra hero, catálogo completo, calculadora de docinhos, Forminhas, Caixa Degustação e CTAs. Todos os 12 produtos ficam simultaneamente renderizados e visíveis pelo fluxo vertical normal:

- Tradicionais: 6 produtos;
- Gourmet: 5 produtos;
- Pistache: 1 produto.

As categorias são seções empilhadas; dentro de cada uma, cards podem usar grid responsivo. Não haverá filtros, tabs ou lógica que oculte produtos: `activeCategory`, `setCategory`, `filteredProducts` ou equivalentes exclusivos dessa ocultação serão removidos.

Atalhos internos para Tradicionais, Gourmet e Pistache podem usar controles `button type="button"` e `scrollIntoView` para rolar a seção que já está renderizada. Eles preservam a URL `/docinhos`, não mudam histórico nem hash, têm teclado e alvo de toque adequados, respeitam `prefers-reduced-motion` e usam `scroll-margin-top` para que o header sticky não oculte o título. IDs podem existir para acessibilidade, CSS, teste e scroll interno, mas não são contratos de URL pública.

`ProductCard` deixa de receber seleção, callback ou estado de pedido. Cada card exibe foto, nome, descrição e informação comercial existente, mais CTA explícito para WhatsApp. A mensagem identifica o produto e a origem no site, mas não presume quantidade, data, disponibilidade ou preço final.

## Estimativas, Forminhas e Caixa Degustação

A calculadora atual de evento será adaptada para calculadora de docinhos, recolhida inicialmente em `/docinhos`. Ela recebe evento e convidados, conserva as faixas comerciais atuais e arredonda a estimativa para lotes de 50. O resultado termina em CTA WhatsApp e nunca cria pedido, sessão, persistência em `sessionStorage`, navegação para configurador ou redirect. A estimativa de bolo sai desse componente para evitar duplicar a calculadora de bolos.

Forminhas continuam dentro de `/docinhos` como seção exclusivamente informativa com fotos existentes: Branquinho, Pistache e Chocolate. Não haverá radio, checkbox, select, `aria-pressed`, estado persistente, `selectedCup` ou integração com pedido.

A Caixa Degustação continua dentro de `/docinhos`: 12 unidades, uma de cada sabor, R$ 65 e antecedência de sete dias. Ela é produto próprio com CTA WhatsApp, não carrinho ou entrada para configurador.

## Responsabilidades técnicas

| Unidade atual ou nova | Responsabilidade final |
|---|---|
| `src/main.jsx` | três páginas, header global e composição da Home; sem estado de pedido ou hash público |
| `src/components/SweetsCatalog.jsx` | catálogo, categorias e atalhos de scroll interno; extrair subcomponentes somente quando melhorar coesão |
| `src/components/ProductCard.jsx` | apresentação de catálogo e CTA WhatsApp por produto |
| `src/components/Planner.jsx` ou sucessor coerente | estimativa de docinhos, recolhida e sem persistência |
| novo componente de calculadora de bolos | estimativa de peso/preço e CTA WhatsApp na Home |
| `src/components/ExpandableSection.jsx` | padrão acessível de conteúdo recolhido das calculadoras |
| `src/lib/planning.js` ou sucessor coerente | regras puras de estimativa de docinhos e bolos; preserva o ajuste comercial da estimativa de doces para múltiplos de 50; não contém estado de pedido, distribuição por sabor, estruturas de lotes do antigo configurador, revisão ou escolha de forminha |
| `src/lib/orders.js` | será renomeado para helper de WhatsApp coerente se deixar de representar pedidos; criação de link e mensagem ficam separados de analytics |
| `src/lib/analytics.js` | GA4 e eventos sem PII, independente de WhatsApp |
| `worker/index.js` | redirect HTTP legado e API de frete preservada |
| `vite.config.js` | redirect local, HTML/SEO das três rotas e preload válido do hero |
| `src/lib/session.js` | removido após confirmar que o rascunho extinto era seu único consumidor |

Não haverá componente genérico sem consumidor, nova biblioteca, roteador, estado global, backend, banco, carrinho, pagamento ou login.

## Remoção do legado

Depois de pesquisar referências, importações, testes e consumidores, serão removidos `src/components/Configurator.jsx`, estado e callbacks de pedido em `src/main.jsx`, `src/lib/session.js`, e as estruturas de lote por sabor, associação de forminha a lote, redimensionamento, distribuição, validação de composição, revisão e mensagem final do configurador em `src/lib/planning.js` e `src/lib/orders.js`, além de analytics de pedido. Será preservado o helper legítimo que converte a faixa da calculadora em estimativas comerciais de múltiplos de 50.

Também serão retirados CSS `.order-*`, `.selection-*`, `.cup-*`, filtros, imports, hashes, comentários e testes exclusivos de montagem. `docs/encomenda.md` será removido conforme auditoria. A busca final por `Configurator`, `/encomenda`, “Montar encomenda”, “Continuar encomenda”, “Adicionar à encomenda”, `selectedFlavor`, `distribution`, `order draft`, `order summary`, `cup selection` e `sessionStorage` classificará cada ocorrência como redirect/teste/histórico legítimo ou a remover.

## Auditoria do estado local aprovada

Antes da execução, o diff local será preservado em commit ou branch temporário de segurança. O backup evita perda de trabalho e não obriga a carregar código obsoleto. A worktree isolada partirá desse ponto para aproveitar somente itens válidos.

| Classificação | Itens | Tratamento |
|---|---|---|
| Manter | AVIFs do hero, `src/data/hero.js`, `scripts/optimize-hero.mjs` | preservar como melhoria de performance independente |
| Adaptar | `BrandHero.jsx`, `vite.config.js`, `tests/performance-ui.test.js` | manter preload responsivo apenas para rotas finais e retirar expectativa de `/encomenda` |
| Adaptar | `src/main.jsx`, `src/pages.css`, `src/lib/planning.js` | remover pedido e reter somente responsabilidades de catálogo/estimativa |
| Remover | `Configurator.jsx`, `docs/encomenda.md`, `tests/order-improvements.test.js`, `tests/order-session-ui.test.js` e comportamento de pedido acrescido em testes existentes | remover por serem exclusivos do fluxo extinto |
| Investigar | dependências indiretas de sessão, CSS e mensagens | pesquisar consumidores antes de apagar; manter somente se houver uso novo real |

## SEO, analytics e frete

`src/data/routes.js`, `vite.config.js` e testes SEO gerarão sitemap, canonical, OG e HTML estático exclusivamente para `/`, `/docinhos` e `/frete`. Não há HTML para seções ou `/encomenda`. Metadata de Docinhos fala de catálogo, brigadeiros, sabores, Caixa Degustação e contato via WhatsApp.

GA4 continua opcional e sem PII. Pageviews válidas são somente as três rotas reais; scroll interno não é pageview. Eventos de pedido como `whatsapp_order` e `planner_to_configurator` serão removidos. Eventos úteis podem cobrir intenção de WhatsApp para produto, Caixa e calculadoras, além de frete, sem nome, telefone, CEP, endereço, mensagem ou texto livre. Nenhum `purchase` será enviado.

`src/components/Delivery.jsx`, `src/lib/cep.js`, `worker/delivery.js`, Mapbox e ViaCEP permanecem funcionalmente inalterados. Segredos como `MAPBOX_ACCESS_TOKEN`, `DELIVERY_ORIGIN` e `.dev.vars` não vão para o frontend.

## CSS, acessibilidade e responsividade

`src/pages.css`, `src/style.css` e `src/refinements.css` receberão somente ajustes necessários ao catálogo, calculadoras e header. CSS de pedido será removido após confirmar consumidores. Links e botões manterão foco visível, teclado, alvos de toque e rótulos acessíveis; painéis fechados permanecerão inertes.

A inspeção visual cobrirá 320, 360, 390, 430, 520, 768, 1024, 1050, 1280 e 1440 px sem overflow horizontal. Serão avaliados header, Home, Bolos, calculadora de bolo, quatro doces, teaser de Caixa, catálogo completo, atalhos internos, Forminhas, Caixa e Frete. Capturas temporárias: Home, Docinhos e Frete em 390 e 1440 px.

## Estratégia de teste e verificação

A implementação seguirá Red-Green-Refactor. Testes novos ou adaptados provarão:

- `GET /encomenda` e `GET /encomenda/` retornam 301 com `Location: /docinhos`; não há rota React correspondente;
- header possui Logo → `/`, Bolos → `/`, Doces Personalizados → `/`, Docinhos → `/docinhos`, Caixa Degustação → `/docinhos` e Frete → `/frete`, nunca Encomenda; nenhum item cria rota ou hash público;
- catálogo contém ao mesmo tempo 12 cards: 6 Tradicionais, 5 Gourmet e 1 Pistache;
- atalhos internos existem, rolam/focalizam a seção certa sem alterar cards, URL, hash ou histórico;
- cards não expõem seleção, distribuição ou pedido; WhatsApp usa telefone configurado, encoding correto e mensagem sem valores indefinidos;
- ambas calculadoras começam fechadas; a de docinhos preserva evento + convidados → faixa teórica → estimativa em múltiplos comerciais de 50, sem montar pedido; a de bolos cobre todos os casos comerciais e entradas inválidas; nenhuma persiste ou cria pedido;
- Forminhas mostram as três opções sem seleção; Caixa mostra 12, uma de cada sabor, R$ 65, sete dias e CTA;
- sitemap tem exatamente três URLs, analytics não inclui rota/eventos de pedido ou PII, e frete continua independente.

Antes da entrega serão executados `npm test`, `npm run build`, `scripts/check-ui.mjs` e `scripts/check-performance.mjs` quando válidos. A verificação inclui imports e código morto, revisão de conformidade e qualidade, inspeção de segredos no build, busca de legado, screenshots e walkthroughs: todos os sabores, atalho Gourmet sem mudar URL, Bolos retornando à Home, Caixa no catálogo, ambas calculadoras, Forminhas e Frete.

## Documentação final

`README.md` será reescrito para declarar as três páginas, o redirect legado e o header: Logo, Bolos e Doces Personalizados → `/`; Docinhos e Caixa Degustação → `/docinhos`; Frete → `/frete`. Explicará que itens podem compartilhar destino sem criar rota, que Bolos e Doces Personalizados ficam na Home e que Caixa fica em Docinhos. Também cobrirá categorias simultâneas, atalhos de scroll interno sem URL, calculadoras recolhidas, Forminhas, regras de personalizados (50 unidades e 45 dias, sem aplicação automática a bolos), frete Mapbox/ViaCEP, analytics sem PII, desenvolvimento e regras estáveis. Ele não documentará hashes como rotas ou deep links oficiais.

`docs/encomenda.md` será removido. Documentos restantes em `docs/` que tratam configurador como arquitetura vigente serão atualizados ou marcados `STATUS: HISTÓRICO / SUPERADO`; `docs/pendencias.md` terá somente pendências reais. Não haverá deploy, merge em `main` ou alteração de secrets.

## Critérios de auto-revisão da especificação

Antes de liberar o plano, confirmar que existem exatamente três páginas, que nenhum hash é contrato público e que `/encomenda` é somente redirect legado. Confirmar também que o header contém explicitamente Doces Personalizados → `/`, sem rota para personalizados; que a seção continua na Home; que mínimo de 50 unidades e antecedência de 45 dias foram preservados; que 45 dias não foram aplicados automaticamente aos bolos; e que README e testes mapeiam esse item de header.

## Riscos e mitigação

- **Diff local heterogêneo:** backup temporário e classificação aprovada antes da worktree; nenhuma alteração é mantida por inércia.
- **Redirect mascarado por SPA:** teste HTTP no Worker e middleware local, além de exclusão da rota da geração estática.
- **Scroll interno sob header sticky:** teste de viewport, reduced motion e foco/visibilidade da seção sem alterar URL.
- **CSS legado compartilhado por acidente:** pesquisa de seletores, remoção incremental, build e inspeção em todos os viewports.
- **Regressão de frete ou segredo exposto:** não reescrever Worker de entrega; executar testes de frete e verificar bundle final.

## Fora de escopo

Qualquer página adicional, deep links públicos, checkout, carrinho, pagamentos, login, banco de dados, backend novo, roteador, Redux/Zustand, biblioteca de formulário/accordion, novo framework CSS, redesign geral, mudança de fotos aprovadas, deploy e merge.
