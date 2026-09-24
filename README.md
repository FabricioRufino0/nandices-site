# Nandices Confeitaria

Site da Nandices Confeitaria para conhecer bolos e docinhos, estimar quantidades e consultar entrega no Distrito Federal. A escolha e os detalhes da encomenda são combinados diretamente com a Nanda pelo WhatsApp.

## Páginas públicas

O site possui seis páginas reais e indexáveis:

- `/` — Home com apresentação da marca, quatro bolos artesanais, quatro docinhos em destaque, guia de encomenda, história da Nandices e contato.
- `/docinhos` — Catálogo completo com 12 sabores renderizados simultaneamente: 6 Tradicionais, 5 Gourmet e 1 Pistache. Também inclui opções de forminhas.
- `/estimativa` — “Quanto pedir?” usa uma calculadora para estimar docinhos e bolo com o mesmo número de convidados.
- `/caixa-degustacao` — Apresentação da Caixa Degustação, com fotografia, composição, valor, prazo e contato direto.
- `/personalizados` — Apresentação dos docinhos personalizados, com exemplo fotográfico, condições e contato direto.
- `/frete` — Consulta de estimativa de entrega pelo CEP e informações sobre retirada no Distrito Federal. O cálculo automático depende do Worker e da configuração privada de entrega.

`/encomenda` e `/encomenda/` continuam como redirecionamentos permanentes para `/docinhos`. Links antigos da Home com `?section=degustacao` ou `?section=personalizados` levam às páginas correspondentes.

## Experiência e navegação

- O menu fixo apresenta Bolos, Docinhos, Caixa Degustação e Docinhos personalizados antes das ferramentas “Quanto pedir?” e “Entrega e frete”. No celular, os destinos ficam no botão Menu.
- Na Home, Bolos e Docinhos aparecem antes da história da marca para acelerar a descoberta dos produtos.
- Caixa Degustação e Docinhos personalizados têm páginas próprias, acessíveis diretamente pelo menu.
- A seção “Como encomendar” explica o caminho em três passos: escolher, contar sobre a ocasião e combinar com a Nanda.
- No catálogo, as três categorias permanecem renderizadas e são acessadas por uma barra horizontal no celular.
- Fotografias dos produtos são o elemento principal dos cards, da Caixa Degustação e dos doces personalizados.
- Foco de teclado, contraste, áreas de toque e `prefers-reduced-motion` fazem parte da camada visual responsiva.

## Conversão e regras comerciais

Todos os contatos comerciais são encaminhados ao WhatsApp. Não há carrinho, checkout, login, pagamento, pedido persistido ou montagem automática de encomenda.

- Bolos: R$ 90,00/kg, pedido mínimo de 1,5 kg e calculadora de peso/preço em `/estimativa`.
- Docinhos: 12 sabores com CTA contextual para consultar cada produto.
- Caixa Degustação: 12 unidades, R$ 65,00 e antecedência mínima de 7 dias.
- Docinhos personalizados: pedido mínimo de 50 unidades e antecedência mínima de 45 dias, com CTA direto para o WhatsApp.
- Frete: estimativa separada, sempre sujeita à confirmação pela Nandices.

## Estrutura principal

- `src/main.jsx` — composição das páginas, header global e Home.
- `src/components/BrandHero.jsx` — hero da Home e do catálogo de docinhos.
- `src/components/OrderGuide.jsx` — orientação visual de encomenda em três etapas.
- `src/components/SweetsCatalog.jsx` — categorias, cards, Forminhas e acesso à calculadora.
- `src/components/SpecialPages.jsx` — páginas de Caixa Degustação e Docinhos personalizados.
- `src/components/ProductCard.jsx` — fotografia, descrição e CTA de WhatsApp por produto.
- `src/components/Planner.jsx` — calculadora única de bolo e docinhos, aberta ao acessar `/estimativa`.
- `src/components/Delivery.jsx` — consulta de frete e retirada.
- `src/lib/orders.js` — geração do link e rastreamento de intenções de WhatsApp.
- `src/experience.css` — camada visual responsiva de navegação, cards, hero e hierarquia editorial.
- `src/style.css`, `src/refinements.css`, `src/pages.css` — tokens, estilos compartilhados e composição de páginas.

## Desenvolvimento

O frontend usa React 19, JavaScript/JSX, Vite 7 e CSS próprio. O cálculo de frete usa um Cloudflare Worker em `worker/`.

```sh
npm install
npm run dev
npm test
npm run build
```

O servidor local fica disponível em `http://127.0.0.1:5173/`.

Para testar o cálculo automático de frete localmente, configure `.dev.vars` a partir de `.dev.vars.example` com os valores privados necessários e inicie o Worker com `npx wrangler dev --port 8787` em outro terminal. O Vite encaminha `/api` para essa porta. Sem o Worker, as páginas e o restante do site continuam disponíveis, mas a consulta automática de frete retorna indisponibilidade.

Os testes usam Node e Playwright com Edge headless. A suíte verifica cálculos, rotas, catálogo e experiência responsiva; execute `npm test` e `npm run build` antes de publicar.

## Configuração

O telefone usado pelo helper de WhatsApp fica em `src/lib/orders.js`. Analytics é opcional via `VITE_GA_MEASUREMENT_ID`; os eventos não enviam CEP, mensagens, endereços ou outros dados pessoais.

O frete usa a API local `/api/delivery`, com o Worker em `worker/` e as variáveis sensíveis configuradas fora do bundle. Segredos de Mapbox, origem de entrega e arquivos `.dev.vars` nunca devem ser commitados.
