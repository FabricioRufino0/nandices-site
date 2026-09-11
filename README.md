# Nandices Confeitaria

Site existente em React + Vite + JavaScript. A atualização aplica o briefing de ajustes, preservando a stack, a base de CSS, as fotos, filtros, WhatsApp, SEO e analytics existentes. Sem carrinho, checkout ou confirmação automática de pedido.

## Execução e verificação

- `npm install`
- `npm run dev` — http://localhost:5173; inclui a rota privada local `/api/delivery`.
- `npm run build` — gera `dist/`; funciona sem `SITE_URL` e sem parâmetros de frete.
- `npm test` — catálogo, lotes de 50–500, valores mistos, mensagens, oito eventos e Worker com Google simulado.
- `node scripts/check-ui.mjs` — requer servidor ativo e Edge instalado; valida interface, mobile, header, âncoras, frete e analytics. Não envia mensagens de WhatsApp.
- `node scripts/optimize-images.mjs` — gera WebP dos PNGs originais (incluindo os bolos e as fotos do pacote v4).

## Dados e regras

`src/data/catalog.js` contém os três bolos atualmente disponíveis e doze brigadeiros confirmados. `src/data/commerce.js` centraliza preços em centavos, mínimo dos bolos, tamanhos de lote, forminhas e referências dos oito eventos.

O configurador trabalha com lotes de 50 entre 50 e 500 unidades. Cada lote tem sabor e forminha independentes; categoria e preço vêm do catálogo/configuração. Repetições são permitidas. A redução preserva os primeiros lotes e remove os excedentes; aumentar cria lotes sem sabor. O resumo agrupa sabores e forminhas e o envio só é liberado quando todos os lotes estão preenchidos. Total dos doces sem frete; confirmação no WhatsApp.

O planejador calcula 1 kg de bolo por 10 pessoas, com mínimo de 1,5 kg. Arredonda ambos os extremos da faixa de doces para cima em múltiplos de 50. Quantidades até 500 podem ser transferidas ao configurador; acima disso, a estimativa é mantida e há consulta por WhatsApp.

## SEO e analytics

`SITE_URL` é opcional localmente. Quando definido com domínio HTTPS confirmado, gera canonical, og:url, imagem social absoluta e sitemap.xml. Metadados e favicon existentes preservados. JSON-LD Organization contém somente nome, telefone, Instagram e URL quando configurada; sem endereço residencial, avaliações ou horários inventados.

Reutilizado `window.dataLayer`, sem novo fornecedor: `whatsapp_header`, `whatsapp_bolo`, `whatsapp_brigadeiro`, `whatsapp_degustacao`, `whatsapp_personalizado`, `whatsapp_configurador`, `whatsapp_planner`, `planner_completed`, `planner_to_configurator`, `freight_calculated`, `whatsapp_delivery`, `instagram_click`. Nenhum endereço é enviado ao analytics. A coleta real depende do fornecedor que vier a ser conectado.

## Frete

Frontend chama apenas `/api/delivery`. O Worker consulta Google Geocoding e Routes no servidor. Sem os parâmetros externos, responde com fallback para WhatsApp. Veja `docs/frete.md` para configurar; não há credenciais ou valores comerciais de frete no repositório.

Arquivos alterados e validação estão em `docs/ajustes.md`; pendências atuais em `docs/pendencias.md`.

## Refinamento visual v4

Fotos atualizadas a partir de nandices_codex_assets_v4.zip, incluindo os três bolos. Bolo de doce de leite com amendoim retirado por enquanto a pedido do usuário. Títulos em Cormorant Garamond e textos em Manrope, com fontes locais via Fontsource. Detalhes em `docs/ajustes-visuais-v4.md`.
