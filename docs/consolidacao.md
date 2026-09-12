# Consolidação Nandices

Implementado na branch main, sem commit, push, merge, reset ou rebase.

## Resultado

Removidos os blocos de etapas, ajuda do catálogo, FAQ extensa, divulgação redundante de personalizados, Instagram isolado e slogan do rodapé. Removida na fonte a restrição textual de Ninho/Bicho de Pé, preservando os sabores. Conteúdo Sobre atualizado em três parágrafos exatos; duas descrições de bolos atualizadas; preço centralizado em R$ 90/kg e mínimo 1,5 kg preservado.

Filtros agora Tradicionais, Gourmet e Pistache, com 6/5/1 produtos. Badges de destaque removidos dos doces; bolos conservam seu destaque. WhatsApp dos bolos abre diretamente com nome do produto. Instagram compacto no header e contato final com dúvidas, WhatsApp e Instagram. Títulos de seção promovidos a h2; frases complementares menores. Animações discretas, hover dos cards/degustação, filtros e resultados; reduced-motion elimina movimento. Um IntersectionObserver é desconectado no cleanup e deixa de observar cada seção após revelar.

Configurador mantém 50–500 em lotes de 50 e comunica alternativa acima de 500. SessionStorage guarda lotes e entradas do planejador, validando categorias/IDs/quantidades; CEP, telefone e endereço não são gravados. Resultado do planejador é recalculado pelo usuário após recarga. track() já estava protegido sem window e foi preservado.

## Frete

A implementação anterior recebia CEP mas rejeitava postalcode/centroid: corrigido. Busca text no Pelias existente, com Brasil e validação DF; CEP retornado deve corresponder. Destino aceita localização representativa; origem conserva precisão de imóvel. Nenhum housenumber exigido. Fórmula e 3/4 chamadas em one-way/round-trip preservadas. Logs internos contêm somente categorias fixas. O frontend recebe CEP/DF construído pelo Worker, nunca rótulo bruto nem coordenadas. Cancelamento, duplicatas, timeout, resposta inválida e fallback são testados. Ver [frete.md](frete.md).

Documentação do provedor consultada: https://github.com/pelias/documentation/blob/master/search.md e https://github.com/pelias/documentation/blob/master/structured-geocoding.md. Mantida a busca text já usada, sem depender de endpoint novo.

## Imagens

As cinco imagens corrigidas do ZIP já estavam aplicadas no início desta rodada: Ferrero Rocher, Maracujá, Crème Brûlée, Cajuzinho e Pistache. Preservadas, sem reprocessamento desnecessário. Conferidas versões WebP, carregamento real, proporção quadrada e object-fit:contain em 390/768/1280/1600. Pipeline e metadados existentes preservados. Não se inferiram ingredientes pela imagem.

## Performance e validação

Baseline desta rodada: JS 258,62 kB (80,47 gzip), CSS 35,88 kB (7,56 gzip). Após consolidação e remoção de CSS dos blocos eliminados: JS ~256,59 kB (80,29 gzip), CSS 35,08 kB (7,50 gzip). Nenhuma dependência ou fonte nova. Fotos abaixo da dobra continuam lazy; hero é marca textual/SVG. Medição local do build em Edge, sem limitação de rede/CPU: 390px LCP 276ms/CLS 0,000005; 1280px LCP 192ms/CLS 0,000196. São observações locais, não métricas de usuários reais nem comparação controlada antes/depois. Assets PNG de origem permanecem no repositório/pasta pública como no pipeline existente, mas os cards carregam WebP.

Build com SITE_URL oficial passa e gera canonical, og:url, OG image absoluta, JSON-LD e sitemap. Testes: 79 passaram, zero falhas. Incluem navegador mobile/desktop, CEP, privacidade, cancelamento, timeout, configurações, persistência e SEO no domínio oficial. EACCES não ocorreu nesta rodada. Inspeção visual adicional: 390, 768, 1280 e 1600px; sem overflow após fontes carregarem. Capturas anexas em docs/consolidated-* e docs/products-*.

## Publicação e limites

SITE_URL é única fonte da URL, agora exemplificada com domínio oficial em .env.example. Deve ser definida no ambiente de build. Ver [dominio.md](dominio.md) para DNS, Custom Domain/TLS e redirecionamento permanente www preservando caminho/query. Configurações externas e secrets não foram alterados; gitignore confirmado para .env/.dev.vars e variantes.

A cobertura real de CEPs no HeiGIT e o cálculo com credenciais/origem reais ainda precisam de validação de staging. Testes usam respostas simuladas; não comprovam disponibilidade/cobertura externa. Não reduzi timeout nem adicionei cache sem medições reais. Não fiz refatoração ampla de main.jsx nem migração CSS; foram removidas apenas regras de blocos eliminados e adicionada uma folha pequena de refinamentos.

Risco de regressão: médio pelo conjunto de mudanças de conteúdo/interface e destino do frete. Seguro para revisão e commit após aprovação visual; publicação deve aguardar validação real de CEPs e configuração externa.

## Inventário do working tree

Inclui mudanças anteriores preservadas (imagens, orders.js, capturas antigas). src/data/imageMetadata.json pode aparecer por finais de linha, sem mudança semântica. Nenhum arquivo foi staged.

```text
M .env.example
 M docs/ajustes.md
 M docs/frete.md
 M docs/order-flow-1440.png
 M docs/order-flow-390.png
 M docs/revisao-frete.md
 M docs/staging-frete.md
 M public/images/products/brigadeiros/cajuzinho-studio-320.webp
 M public/images/products/brigadeiros/cajuzinho-studio-480.webp
 M public/images/products/brigadeiros/cajuzinho-studio-960.webp
 M public/images/products/brigadeiros/cajuzinho-studio.png
 M public/images/products/brigadeiros/creme-brulee-studio-320.webp
 M public/images/products/brigadeiros/creme-brulee-studio-480.webp
 M public/images/products/brigadeiros/creme-brulee-studio-960.webp
 M public/images/products/brigadeiros/creme-brulee-studio.png
 M public/images/products/brigadeiros/ferrero-rocher-studio-320.webp
 M public/images/products/brigadeiros/ferrero-rocher-studio-480.webp
 M public/images/products/brigadeiros/ferrero-rocher-studio-960.webp
 M public/images/products/brigadeiros/ferrero-rocher-studio.png
 M public/images/products/brigadeiros/maracuja-studio-320.webp
 M public/images/products/brigadeiros/maracuja-studio-480.webp
 M public/images/products/brigadeiros/maracuja-studio-960.webp
 M public/images/products/brigadeiros/maracuja-studio.png
 M public/images/products/brigadeiros/pistache-studio-320.webp
 M public/images/products/brigadeiros/pistache-studio-480.webp
 M public/images/products/brigadeiros/pistache-studio-960.webp
 M public/images/products/brigadeiros/pistache-studio.png
 M src/components/Configurator.jsx
 M src/components/Delivery.jsx
 M src/components/Planner.jsx
 M src/components/WhatsApp.jsx
 M src/data/catalog.js
 M src/data/commerce.js
 M src/data/imageMetadata.json
 M src/lib/orders.js
 M src/main.jsx
 M src/style.css
 M tests/delivery-ui.test.js
 M tests/delivery.test.js
 M tests/order-flow-ui.test.js
 M tests/orders.test.js
 M tests/seo.test.js
 M vite.config.js
 M worker/delivery.js
?? docs/consolidated-1280.png
?? docs/consolidated-1600.png
?? docs/consolidated-390.png
?? docs/consolidated-768.png
?? docs/dominio.md
?? docs/products-1280-Gourmet.png
?? docs/products-1280-Pistache.png
?? docs/products-1280-Tradicionais.png
?? docs/products-1600-Gourmet.png
?? docs/products-1600-Pistache.png
?? docs/products-1600-Tradicionais.png
?? docs/products-390-Gourmet.png
?? docs/products-390-Pistache.png
?? docs/products-390-Tradicionais.png
?? docs/products-768-Gourmet.png
?? docs/products-768-Pistache.png
?? docs/products-768-Tradicionais.png
?? scripts/check-performance.mjs
?? scripts/review-consolidation.mjs
?? src/lib/cep.js
?? src/lib/session.js
?? src/refinements.css
?? tests/session.test.js
?? docs/consolidacao.md
```
