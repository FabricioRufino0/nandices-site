# Ajustes aplicados — Nandices Confeitaria

## Resultado

Atualização incremental do projeto React/Vite existente. Mantidos stack, dependências, base de CSS, fotos, filtros, links centralizados de WhatsApp, header sticky, responsividade e estrutura de analytics. Nenhuma publicação externa foi executada.

A abertura contém somente a assinatura tipográfica existente da Nandices em azul e creme, sem foto de produto ou slogan. Logo depois vem Sobre a Nanda; em seguida, bolos, doces, planejador, configurador, degustação, qualidade, personalizados, encomenda, entrega, galeria, FAQ e contato.

Catálogo confirmado: quatro bolos, preço R$ 90/kg e mínimo 1,5 kg; doze brigadeiros com descrições reais; Cajuzinho tradicional; preços de cento e meio cento. Caixa Degustação com 7 dias de antecedência. Doces personalizados com 45 dias; bolos personalizados com prazo sob consulta.

Configurador por lotes de 50 até 500, com repetição de sabores, forminha independente por lote, categoria/preço derivados de dados centrais, resumo agrupado e mensagem contextualizada. Planejador para os oito eventos, mínimo comercial de bolo, arredondamento de doces para cima e transferência de quantidade ao configurador.

Frete preparado em Worker privado com Geocoding/Routes e fallback. Mantém funcionamento do site sem credenciais e sem SITE_URL. SEO existente preservado; acrescentado Organization apenas com dados conhecidos.

## Arquivos existentes alterados

| Arquivo | Alteração |
|---|---|
| `src/main.jsx` | Abertura e ordem das seções, catálogo renderizado, integração das novas funcionalidades, personalizados/FAQ/degustação, item de navegação Quanto pedir. |
| `src/style.css` | Regras pontuais acrescentadas para abertura, quatro bolos, formulários, lotes, resumo e header compacto até 1100 px; CSS anterior preservado. |
| `src/data/catalog.js` | Quatro bolos, doze descrições e categoria confirmada de Cajuzinho; preços derivados da configuração central. |
| `src/lib/orders.js` | Mensagens por lotes, planejador e entrega; helper e dataLayer preservados. |
| `index.html` | Remoção de frase antiga do Open Graph. |
| `vite.config.js` | Endpoint local de frete e JSON-LD Organization; canonical, OG e sitemap condicionais preservados. |
| `.env.example` | Parâmetros do frete vazios e explicação do modo ida/ida + volta. |
| `.gitignore` | Exclusão de arquivos privados do Wrangler. |
| `tests/orders.test.js` | Regressões do novo catálogo, lotes, preços, forminhas, mensagens e planejador. |
| `scripts/check-ui.mjs` | Verificações reais no navegador para o briefing atualizado. |
| `README.md` | Execução, dados, regras, SEO, analytics e referência para frete. |
| `docs/pendencias.md` | Remoção das pendências resolvidas pelo briefing; lista atualizada. |
| `docs/desktop.png`, `docs/mobile.png`, `docs/hero.png` | Capturas atualizadas da interface. |

## Arquivos adicionados

| Arquivo | Função |
|---|---|
| `src/data/commerce.js` | Preços em centavos, lote, quantidades, forminhas, bolo, degustação e oito eventos. |
| `src/lib/planning.js` | Redimensionamento de lotes, resumo e cálculo das estimativas. |
| `src/components/WhatsApp.jsx` | Componente existente movido para reutilização nas novas seções, preservando comportamento. |
| `src/components/Configurator.jsx` | Configuração por lote e resumo com preço. |
| `src/components/Planner.jsx` | Evento, convidados, estimativa e transferência. |
| `src/components/Delivery.jsx` | Retirada/entrega, formulário, estimativa e fallback. |
| `worker/delivery.js` | Validação, parâmetros privados, Geocoding, Routes e cálculo. |
| `worker/index.js` | Roteamento do endpoint e dos assets. |
| `wrangler.jsonc` | Configuração para Worker e site na mesma origem. |
| `tests/delivery.test.js` | Regras e falhas do serviço com Google simulado. |
| `tests/seo.test.js` | Builds em memória com e sem domínio; comprovação de ausência de secrets no frontend. |
| `docs/frete.md` | Configuração local/Cloudflare, fórmula, referências e limites da validação. |
| `docs/configurator-mobile.png` | Captura do resumo mobile de 150 doces por R$ 315. |
| `docs/ajustes.md` | Este registro. |

`dist/` foi regenerado pelo build: HTML, CSS e JavaScript de produção. `package.json`, `package-lock.json`, assets dos produtos, `manifest.json`, `src/data/productImages.js`, favicon e robots.txt não foram alterados nesta atualização.

## Validação executada

- `npm run build`: aprovado sem SITE_URL e sem credenciais de frete.
- `npm test`: 44 testes aprovados, incluindo todas as quantidades de 50 a 500, misturas, repetições, agrupamento por forminha, lotes incompletos e os oito eventos.
- Exemplos verificados: 50 tradicional + 50 gourmet = R$ 205; 100 tradicional + 50 gourmet = R$ 300; 100 Ninho com Nutella + 50 tradicional = R$ 315.
- `node scripts/check-ui.mjs`: aprovado no Edge em 360, 390, 768, 1024 e 1440 px, sem rolagem horizontal. Verifica header sticky, âncoras visíveis, menu mobile, transferência de todos os eventos, mensagens, filtros e imagens.
- Console sem erros inesperados; a indisponibilidade esperada do frete local gera HTTP 503 e exibe o fallback.
- Frete: cenários simulados de sucesso, rotas distintas ida/volta, parâmetros ausentes, endereço impreciso, fora do DF, falha de rede/quota/rota, seleção de retirada e invalidação de estimativa após edição.
- SEO: canonical/sitemap/OG com domínio de teste apenas em memória; local sem domínio; JSON-LD e inexistência de chave/origem no bundle.

## Configuração externa ainda necessária

Google Maps: chave com Geocoding e Routes habilitados e faturamento. Cloudflare: secrets GOOGLE_MAPS_API_KEY e DELIVERY_ORIGIN, consumo do veículo, preço do combustível, modo de percurso e publicação. A chamada real não foi validada sem esses dados.

Domínio final, logo oficial separado e novas fotos permanecem pendentes. A coleta real de analytics depende do destino a ser conectado. Encomendas comuns e bolos personalizados continuam com antecedência consultada pelo WhatsApp.
