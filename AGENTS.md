# Nandices Confeitaria — Instruções para agentes

Este repositório contém o código do site da Nandices. O código e os testes locais são a fonte de verdade para o comportamento implementado. O Segundo Cérebro contém contexto de produto, regras comerciais, decisões e aprendizados.

## Contexto obrigatório

Antes de alterar comportamento, conteúdo, interface, arquitetura ou infraestrutura, comece por:

`C:\Users\fabri\OneDrive\Documentos\OBSIDIAN-ARQUIVOS\Segundo cerebro\01 - Projetos\Nandices\Nandices - MOC.md`

Depois abra somente as notas relacionadas à tarefa:

- briefing e objetivo → `Briefing Mestre.md`;
- regras comerciais → `Regras Comerciais.md`;
- produtos, sabores e conteúdo → `Produtos e Catálogo.md`;
- interface e identidade → `UI UX e Identidade.md`;
- arquitetura e arquivos críticos → `Arquitetura Técnica.md`;
- frete e Cloudflare → `Frete e Cloudflare.md`;
- verificação → `Testes e Qualidade.md`;
- decisões já tomadas → `Decisões.md`;
- tarefas futuras → `Backlog.md`.

Não carregue o vault inteiro. Para práticas gerais, consulte apenas quando necessário:

`C:\Users\fabri\OneDrive\Documentos\OBSIDIAN-ARQUIVOS\Segundo cerebro\02 - VibeCoding\VibeCoding - MOC.md`

A Nandices é um projeto específico e um estudo de caso. Não transforme suas regras, stack ou identidade em padrão universal para outros projetos.

## Quando houver conflito

- o repositório define o que está implementado atualmente;
- o MOC e suas notas definem contexto, requisitos e decisões do produto;
- se código, README e vault divergirem de forma relevante, apresente a divergência antes de escolher um lado;
- não invente produtos, preços, textos comerciais, prazos ou regras para preencher lacunas.

## Stack e comandos

- React 19, JavaScript/JSX e Vite 7;
- CSS próprio da Nandices;
- Cloudflare Worker para frete;
- testes Node e Playwright.

```sh
npm run dev
npm test
npm run build
```

O servidor local usa `http://127.0.0.1:5173/`.

## Invariantes do produto

- o fluxo principal é descoberta → planejamento → contato pelo WhatsApp;
- não existe carrinho, login, pagamento, pedido persistido ou checkout completo;
- `/encomenda` redireciona para `/docinhos`;
- disponibilidade, valor final e condições são confirmados pela Nanda;
- bibliotecas podem fornecer comportamento, mas a identidade visual pertence à Nandices;
- mudanças visuais não devem remover acessibilidade, responsividade ou comportamento existente.

## Forma de trabalho

1. Leia o arquivo que será alterado, os testes relacionados e uma implementação semelhante.
2. Preserve comportamentos fora do escopo.
3. Prefira mudanças pequenas, simples e reversíveis.
4. Execute o teste específico, a suíte relevante e o build.
5. Para interface, valide mobile e desktop e confira ausência de overflow.
6. Revise o diff e informe arquivos alterados e verificações executadas.

## Limites

- não exponha ou versione `.env`, `.dev.vars`, tokens, chaves ou credenciais;
- não adicione dependências sem necessidade concreta;
- não faça deploy, push ou alterações de infraestrutura sem autorização explícita;
- não remova testes para fazer uma alteração passar;
- não sobrescreva trabalho local não relacionado.
