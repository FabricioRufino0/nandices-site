# Reestruturação da Nandices

## Entrega

- Home institucional preservada, com quatro doces de destaque e acesso ao catálogo e à encomenda.
- /docinhos: 12 sabores da fonte de dados existente, filtros por categoria real, seleção e remoção.
- /encomenda: calculadora para eventos, quantidade, sabores/distribuição, forminha única e revisão.
- /frete: componente de entrega existente, consulta por CEP independente do pedido.
- Seleção e rascunho preservados em sessionStorage. Rascunhos antigos mantêm sabores e pedem confirmação consciente da forminha.
- Quantidades de 50 a 500, em múltiplos de 50; até quantidade/50 sabores. Excedentes após redução exigem correção explícita.
- Finalização usa o número já configurado e gera a mensagem a partir da encomenda atual. Sem frete ou checkout intermediário.
- Bolo: R$ 90/kg, mínimo 1,5 kg. Planejamento: 1 kg/10 convidados, com mínimo comercial explicado separadamente.
- Descrições confirmadas aplicadas; sete dias para degustação e 45 dias apenas para doces personalizados.
- Metadata, canonical e sitemap por rota. HTML de entrada produzido para cada página; Worker/API e credenciais preservados.

## Imagens

Geradas com a ferramenta integrada de imagens, usando somente as referências fornecidas:

- public/images/products/brigadeiros/pistache-reference.png e variantes WebP: produto fiel à foto enviada, fundo azul profundo e iluminação conforme o Brigadeiro Tradicional existente.
- public/images/forminhas/branquinho.webp
- public/images/forminhas/pistache.webp
- public/images/forminhas/chocolate.webp

Prompts usados (resumo fiel): fotografar o mesmo brigadeiro de Pistache, preservando formato, textura, cobertura e forminha, em fundo azul de estúdio com iluminação e enquadramento do catálogo; para cada forminha, representar uma única unidade vazia da respectiva cor, com pregas, proporções e material da referência, isolada em fundo claro, sem texto ou setas. A interface identifica as imagens das forminhas como ilustrativas.

Maracujá: public/images/products/brigadeiros/maracuja-reference.png e variantes WebP usam o arquivo fornecido, sem recriação, retoque ou ampliação artificial. Fonte atualizada pelo adendo: 2056 × 2048 px.

Nenhuma outra fotografia do catálogo foi substituída. O hero de docinhos utiliza exclusivamente a nova composição fornecida para /docinhos.

## Validação

- npm test -- --test-concurrency=1: 78 testes aprovados.
- npm run build: aprovado; gera as quatro entradas HTML e sitemap.
- Não há script de lint no projeto.
- Cenários A–H, mensagem WhatsApp, popup interceptado sem envio, seleção/remoção, refresh e navegação direta.
- Layout em 320, 360, 390, 430, 768 e 1440 px, sem overflow horizontal detectado.
- Capturas desktop/mobile: docs/restructure-*.png.
- Frete: CEP válido/inválido, carregamento, resultado, falha de API, timeout e invalidação de resultado. Respostas externas simuladas nos testes; lógica do Worker e proxy verificada pela suíte existente.

## Limitações reais

- Consulta real de frete no ambiente local requer as configurações existentes do Worker (não há .dev.vars nem os bindings necessários no ambiente desta execução). Nenhum segredo ou parâmetro comercial foi inventado.
- A limitação anterior da imagem do Maracujá foi resolvida com a nova fotografia fornecida.
- Alterações locais, sem commit ou publicação.
