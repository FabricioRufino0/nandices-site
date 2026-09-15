# Nandices Confeitaria

Catálogo digital da Nandices Confeitaria, com foco em descoberta visual dos produtos e conversão direta pelo WhatsApp.

## Páginas públicas

O site possui três páginas reais e indexáveis:

- `/` — Home com hero, bolos artesanais, calculadora de bolo, destaques de docinhos, guia de encomenda, Caixa Degustação, Doces Personalizados, história da Nandices e contato.
- `/docinhos` — Catálogo completo com 12 sabores renderizados simultaneamente: 6 Tradicionais, 5 Gourmet e 1 Pistache. Também inclui calculadora de docinhos, Forminhas, Personalizados e Caixa Degustação.
- `/frete` — Consulta de estimativa de entrega pelo CEP, com opções de entrega ou retirada no Distrito Federal.

`/encomenda` e `/encomenda/` são apenas redirecionamentos permanentes para `/docinhos`, preservados para links antigos. Eles não são uma quarta página nem um fluxo de pedido.

## Experiência e navegação

- O header sticky oferece Bolos, Docinhos, Personalizados, Entrega e frete e WhatsApp.
- Na Home, Bolos e Docinhos aparecem antes da história da marca para acelerar a descoberta dos produtos.
- A seção “Como encomendar” explica o caminho em três passos: escolher, contar sobre a ocasião e combinar com a Nanda.
- No catálogo, as categorias permanecem visíveis e são acessadas por uma barra horizontal que preserva a largura dos cards no mobile.
- Fotos aprovadas são usadas como elemento principal dos cards, da Caixa Degustação e de Personalizados.
- Foco de teclado, contraste, áreas de toque e `prefers-reduced-motion` fazem parte da camada visual responsiva.

## Conversão e regras comerciais

Todos os contatos comerciais são encaminhados ao WhatsApp. Não há carrinho, checkout, login, pagamento, pedido persistido ou montagem automática de encomenda.

- Bolos: R$ 90,00/kg, pedido mínimo de 1,5 kg e calculadora de peso/preço na Home.
- Docinhos: 12 sabores com CTA contextual para consultar cada produto.
- Caixa Degustação: 12 unidades, R$ 65,00 e antecedência mínima de 7 dias.
- Doces Personalizados: pedido mínimo de 50 unidades e antecedência mínima de 45 dias, com CTA direto para o WhatsApp.
- Frete: estimativa separada, sempre sujeita à confirmação pela Nandices.

## Estrutura principal

- `src/main.jsx` — composição das páginas, header global e Home.
- `src/components/BrandHero.jsx` — hero da Home e do catálogo de docinhos.
- `src/components/OrderGuide.jsx` — orientação visual de encomenda em três etapas.
- `src/components/SweetsCatalog.jsx` — categorias, cards, Forminhas, Personalizados e Caixa Degustação.
- `src/components/ProductCard.jsx` — fotografia, descrição e CTA de WhatsApp por produto.
- `src/components/Planner.jsx` — calculadoras recolhidas de bolo e docinhos.
- `src/components/Delivery.jsx` — consulta de frete e retirada.
- `src/lib/orders.js` — geração do link e rastreamento de intenções de WhatsApp.
- `src/experience.css` — camada visual responsiva de navegação, cards, hero e hierarquia editorial.
- `src/style.css`, `src/refinements.css`, `src/pages.css` — tokens, estilos compartilhados e composição de páginas.

## Desenvolvimento

```sh
npm install
npm run dev
npm test
npm run build
```

O servidor local fica disponível em `http://127.0.0.1:5173/`.

Para validação visual e responsiva, a suíte usa Playwright com Edge headless e cobre 390, 768, 1280 e 1440 px. O teste de experiência também verifica ausência de overflow mobile, navegação por categoria, CTAs contextuais e imagens carregadas.

## Configuração

O telefone usado pelo helper de WhatsApp fica em `src/lib/orders.js`. Analytics é opcional via `VITE_GA_MEASUREMENT_ID`; os eventos não enviam CEP, mensagens, endereços ou outros dados pessoais.

O frete usa a API local `/api/delivery`, com o Worker em `worker/` e as variáveis sensíveis configuradas fora do bundle. Segredos de Mapbox, origem de entrega e arquivos `.dev.vars` nunca devem ser commitados.
