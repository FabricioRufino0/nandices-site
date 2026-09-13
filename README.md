# Nandices Confeitaria

Site existente em React + Vite + JavaScript. A atualização aplica o briefing de ajustes, preservando a stack, a base de CSS, as fotos, filtros, WhatsApp, SEO e analytics existentes. Sem carrinho, checkout ou confirmação automática de pedido.

## Execução e verificação

- `npm install`
- `npm run dev` — http://localhost:5173; encaminha `/api` ao Worker local, sem consultar provedores.
- Em outro terminal: `npx wrangler dev --local --ip 127.0.0.1 --port 8787` após o build; secrets locais apenas em `.dev.vars`.
- `npm run build` — gera `dist/`; funciona sem `SITE_URL` e sem parâmetros de frete.
- `npm test` — catálogo, lotes de 50–500, valores mistos, mensagens, oito eventos e Worker com openrouteservice simulado.
- `node scripts/check-ui.mjs` — requer servidor ativo e Edge instalado; valida interface, mobile, header, âncoras, frete e analytics. Não envia mensagens de WhatsApp.
- `node scripts/optimize-images.mjs` — gera WebP dos PNGs originais (incluindo os bolos e as fotos do pacote v4).

## Dados e regras

`src/data/catalog.js` contém quatro bolos atualmente disponíveis, incluindo Doce de Leite com Amendoim Crocante, e doze brigadeiros confirmados. `src/data/commerce.js` centraliza preços em centavos, mínimo dos bolos, tamanhos de lote, forminhas e referências dos oito eventos. Personalização é oferecida somente para docinhos, nos sabores Ninho e Bicho de Pé, com mínimo de 50 unidades e 45 dias de antecedência.

O configurador trabalha com lotes de 50 entre 50 e 500 unidades. Cada lote tem sabor e forminha independentes; categoria e preço vêm do catálogo/configuração. Repetições são permitidas. A redução preserva os primeiros lotes e remove os excedentes; aumentar cria lotes sem sabor. O resumo agrupa sabores e forminhas e o envio só é liberado quando todos os lotes estão preenchidos. Total dos doces sem frete; confirmação no WhatsApp.

O planejador calcula 1 kg de bolo por 10 pessoas, com mínimo de 1,5 kg. Arredonda ambos os extremos da faixa de doces para cima em múltiplos de 50. Quantidades até 500 podem ser transferidas ao configurador; acima disso, a estimativa é mantida e há consulta por WhatsApp.

## SEO e analytics

`SITE_URL` é opcional localmente. Quando definido com domínio HTTPS confirmado, gera canonical, og:url, imagem social absoluta e sitemap.xml. Metadados e favicon existentes preservados. JSON-LD Organization contém somente nome, telefone, Instagram e URL quando configurada; sem endereço residencial, avaliações ou horários inventados.

GA4 opcional via `VITE_GA_MEASUREMENT_ID`, preservando os eventos de `window.dataLayer`. Sem ID válido, nenhum script do Google é carregado. Pageviews de carregamento e History API, cliques WhatsApp/Instagram, planejador e frete; sem CEP, endereço ou mensagem enviados pela integração. Veja [configuração, eventos e prevenção de duplicatas](docs/ga4-e-icones.md). Ícones ICO, PNG, Apple e manifest ficam em `public/`; regeneração com `node scripts/generate-icons.mjs`.

## Frete

Frontend chama apenas `/api/delivery`. O Worker consulta openrouteservice em `api.heigit.org` no servidor. Sem os parâmetros externos, responde com fallback para WhatsApp. Veja `docs/frete.md` para configurar; não há credenciais ou endereço de origem no repositório.

Arquivos alterados e validação estão em `docs/ajustes.md`; pendências atuais em `docs/pendencias.md`.

## Refinamento visual v4

Fotos do pacote v4 complementadas com as referências enviadas em 11/09/2026: bolo de doce de leite com amendoim reincluído e exemplo de docinhos personalizados tratados no padrão azul de estúdio. A assinatura tem o fouet no lugar do i, reproduzido em SVG no componente BrandName a partir da referência oficial. Títulos em Cormorant Garamond e textos em Manrope, com fontes locais via Fontsource. `docs/ajustes-visuais-v4.md` registra a etapa anterior.
