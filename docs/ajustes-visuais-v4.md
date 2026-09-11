# Fotos e refinamento visual v4

## Alterações

- Integradas as 16 fotos do pacote v4: três bolos, doze brigadeiros e Caixa Degustação. PNGs e WebPs fornecidos preservados; variantes responsivas de 320/480/960 px regeneradas.
- Bolo de doce de leite com amendoim removido temporariamente do catálogo e de seus CTAs. Os três bolos restantes usam as fotos correspondentes.
- Manifesto do ZIP utilizado somente para identificar imagens. A indicação antiga de Cajuzinho pendente não substituiu a categoria tradicional já confirmada pelo usuário.
- Tipografia: Cormorant Garamond variável em títulos e nomes; Manrope variável nas descrições e controles. Apenas três arquivos WOFF2 latinos, servidos localmente, com font-display swap. Assinatura da marca mantida.
- Nomes maiores, descrições mais legíveis e destaque pontual aos ingredientes já informados, sem mudar composição ou preços.
- Catálogo com três colunas no desktop e cards amplos no celular; espaçamentos, alinhamentos, bordas, selos e CTAs refinados.
- Removido o zoom antigo das fotos. Dimensões reais registradas para preservar o espaço durante carregamento. Galeria atualizada com bolo e brigadeiros.
- Abertura continua somente com a marca e Sobre a Nanda antes dos produtos. Funcionalidades de pedido, planejador e frete preservadas.

## Arquivos

- `src/main.jsx`: fotos de bolos, descrições com destaques, dimensões e galeria.
- `src/data/catalog.js`: três bolos com fotos e retirada do bolo indisponível.
- `src/data/imageMetadata.json`: dimensões dos 16 assets.
- `src/style.css`: refinamentos e fontes locais.
- `package.json` e `package-lock.json`: dois pacotes Fontsource; auditoria da instalação sem vulnerabilidades.
- `scripts/optimize-images.mjs`: inclui bolos e gera metadados.
- `scripts/check-ui.mjs` e `tests/orders.test.js`: expectativa atualizada para três bolos fotografados.
- `scripts/preview-v4.mjs`: capturas específicas do catálogo.
- `public/images/products/{bolos,brigadeiros,degustacao}/`: fotos fornecidas e WebPs responsivos.
- `README.md`, `docs/pendencias.md`, este registro e capturas em `docs/` atualizados.

## Verificação

Build aprovado; 44 testes aprovados. Teste de interface em cinco larguras aprovado, com menus, sticky, âncoras, fotos, formulários, mensagens e cálculos preservados. Fontes carregadas confirmadas no navegador. Revisão visual desktop e mobile realizada.

Continuam pendentes apenas o logo oficial e as configurações externas de domínio/frete/analytics já documentadas. Nenhuma publicação foi realizada.
