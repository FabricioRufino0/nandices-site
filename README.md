# Nandices Confeitaria

Catálogo digital da Nandices Confeitaria. O site tem três páginas públicas: `/`, `/docinhos` e `/frete`.

## Conversão

Todos os contatos comerciais são encaminhados ao WhatsApp. Não há carrinho, checkout, pedido persistido, seleção de sabores ou montagem automática de encomenda.

- A Home apresenta bolos, calculadora de bolo, quatro docinhos em destaque, Caixa Degustação e Doces Personalizados.
- `/docinhos` exibe os 12 sabores em categorias verticais, calculadora de docinhos, forminhas e Caixa Degustação.
- `/frete` preserva a consulta de entrega pelo CEP.
- `/encomenda` e `/encomenda/` retornam redirecionamento permanente para `/docinhos` no Worker e na prévia local.

## Desenvolvimento

```sh
npm run dev
npm test
npm run build
```

O telefone usado no helper de WhatsApp fica em `src/lib/orders.js`. Analytics é opcional via `VITE_GA_MEASUREMENT_ID`; os eventos só enviam parâmetros permitidos e não incluem CEP, mensagens ou outros dados pessoais.
