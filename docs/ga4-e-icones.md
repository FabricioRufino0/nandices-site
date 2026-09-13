# GA4 e ícones

## Ativação

ID de produção informado para o build da Cloudflare: `G-TXLTKG7MEH`, na variável `VITE_GA_MEASUREMENT_ID`. O código continua lendo `import.meta.env.VITE_GA_MEASUREMENT_ID`; nenhum ID foi fixado no código da aplicação. Builds com esse ID e sem ID são verificados em navegador com gtag.js interceptado, sem enviar visitas artificiais à propriedade.

Os eventos `whatsapp_*` já distinguem os pontos de contato; não foi criado `whatsapp_click` duplicado. `whatsapp_order` registra o clique no pedido válido imediatamente antes de abrir o WhatsApp, não uma venda concluída. Frete e Instagram conservam seus nomes existentes. `initAnalytics()` concentra a ativação para uma futura camada de consentimento; nenhum banner ou texto legal foi inserido.

Criar `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` em `.env.local` (raiz do projeto) para uso local, ou nas variáveis do **ambiente de build** da hospedagem para produção. Substituir pelo Measurement ID do fluxo Web do GA4, não pelo ID numérico da propriedade. Reiniciar o Vite localmente; em produção é necessário novo build/deploy. Não colocar o ID em `.dev.vars`: ela configura apenas o Worker de frete. O Measurement ID é público; nenhuma outra variável VITE é exposta automaticamente.

Sem ID válido, nenhum script de analytics é carregado. A integração preserva os objetos atuais no dataLayer e encaminha os eventos de track() ao GA4, com lista limitada de parâmetros. Sem CEP, endereço, mensagem de WhatsApp ou query/hash em pageviews. Google Signals e personalização de anúncios estão desabilitados. Não há nova camada GTM nem interceptação de dataLayer.push.

Pageviews são manuais: carregamento inicial e mudanças de pathname via pushState, replaceState e popstate; links atuais também funcionam por recarga de documento. Âncoras e mudanças somente de query não contam como novas páginas. Rotas desconhecidas não geram pageviews. Para evitar duplicatas, no fluxo Web do GA4, em Medição otimizada → Visualizações de página → configurações avançadas, **desative visualizações baseadas em mudanças do histórico do navegador**. Não instale uma segunda tag GA4/GTM para os mesmos eventos. Revise outras medições automáticas no painel se não forem desejadas.

Eventos do site disponíveis:

- `page_view`
- `whatsapp_header`, `whatsapp_bolo`, `whatsapp_degustacao`, `whatsapp_personalizado`, `whatsapp_order`, `whatsapp_planner`, `whatsapp_delivery`
- `planner_completed`, `planner_to_configurator`
- `freight_calculated`, `freight_calculation_failed`
- `instagram_click`

Cliques WhatsApp representam intenção de contato, não venda confirmada. Nenhum evento purchase foi criado. A integração não implementa banner/CMP; verificar os requisitos de privacidade/consentimento antes de ativar a coleta. A entrega real ao GA4/DebugView depende do ID, das configurações da conta e de bloqueadores; testes locais interceptam o script para não enviar dados reais.

Referência: [pageviews manuais e prevenção de duplicatas](https://developers.google.com/analytics/devguides/collection/ga4/views).

## Ícones

Mantido o monograma n azul/creme já utilizado pela Nandices, sem logo completa. `node scripts/generate-icons.mjs` reproduz PNGs e ICO a partir de public/favicon.svg com Sharp já instalado. favicon.png tem 96×96; apple-touch-icon 180×180; ícones 192×192 e 512×512; ICO com 16/32/48. Manifest em /site.webmanifest, sem service worker ou cache offline. O manifest.json na raiz é inventário de produtos e não foi alterado.

Todos os links usam caminhos absolutos desde a raiz, válidos nas quatro rotas. O Google precisa rastrear novamente a Home e os ícones após o deploy; a exibição não é imediata nem garantida. [Regras do Google para favicon](https://developers.google.com/search/docs/appearance/favicon-in-search).
