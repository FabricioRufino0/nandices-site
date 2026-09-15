# Nandices: redesign de navegação e experiência visual

## Objetivo

Tornar o catálogo mais intuitivo, desejável e fácil de percorrer, preservando as três páginas atuais, o pedido pelo WhatsApp, as fotos aprovadas e a seção completa de Doces Personalizados.

## Evidências usadas

- Baymard recomenda expor categorias no nível principal da navegação e separar visualmente a camada de navegação da grade de produtos.
- A pesquisa de e-commerce alimentar prioriza fotografia grande, informação comercial clara e caminho de compra visível.
- WCAG 2.2 recomenda alvos de toque de pelo menos 24 × 24 CSS px, com áreas maiores para ações importantes, contraste textual mínimo e foco perceptível.
- Referências de confeitarias convergem em fotografia apetitosa, identidade própria e pedido evidente acima da dobra.

Fontes: https://baymard.com/blog/main-navigation-product-categories, https://baymard.com/learn/ecommerce-category-page, https://baymard.com/audits/online-grocery, https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html, https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum, https://webflow.com/blog/bakery-websites.

## Decisões

- Manter `/`, `/docinhos` e `/frete`; não criar carrinho, checkout, login, nova dependência ou rota.
- Transformar a navegação de categorias de Docinhos em uma barra horizontal legível e sticky, especialmente no mobile.
- Reordenar a Home para mostrar produtos antes da história da marca.
- Acrescentar orientação não interativa no hero e uma seção curta “Como encomendar”.
- Usar um sistema visual editorial: azul profundo, papel quente, acento caramelo, bordas suaves, imagens grandes e numeração discreta.
- Exibir preço e antecedência da Caixa Degustação no catálogo e usar a foto aprovada em Personalizados.
- Preservar os textos comerciais, regras de 50 unidades/45 dias e todos os CTAs de WhatsApp.

## Critérios de aceitação

- A pessoa identifica em poucos segundos o que a Nandices vende, onde ver bolos/docinhos e como pedir.
- O catálogo não perde largura para uma barra lateral em nenhuma viewport.
- Header, filtros de categoria e CTAs têm estados ativos/foco claros e alvos confortáveis.
- Home e Docinhos não têm overflow entre 320 e 1440 px.
- Todos os testes, o build e a inspeção visual passam sem erros de console ou imagens quebradas.

