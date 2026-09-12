> Registro histórico anterior à migração para CEP. Para o contrato e validação atuais, consulte [frete.md](frete.md). As exigências antigas de rua/número do destino não se aplicam.

# Correções da revisão de frete

## Arquivos

- worker/delivery.js: validação conservadora de origem/destino, envelope uniforme, aviso no sucesso e respostas sem dados privados.
- vite.config.js: somente proxy para Worker local; sem importação do handler, sem credenciais, sem exposição automática de env.
- src/components/Delivery.jsx: exige estado estimated e rejeita preço parcial; mensagens públicas controladas.
- .env.example, .dev.vars.example e .gitignore: separação de configuração do build e secrets exclusivos do Wrangler.
- package.json e package-lock.json: Wrangler instalado para execução local reproduzível.
- README.md e docs/frete.md: arquitetura, execução e critérios de confiança atualizados.
- tests/delivery.test.js: 29 testes adicionais de localização, ambiguidade, número, privacidade, falhas parciais e contrato.
- tests/delivery-proxy.test.js: 2 testes novos de encaminhamento, origem HTTP, fallback e ausência de integração direta no frontend/Vite.
- tests/delivery-ui.test.js: teste novo em navegador cobrindo sucesso, erros e resposta parcial inclusive com HTTP 200.
- tests/seo.test.js: privacidade baseada nos bindings privados atuais e marcadores arbitrários VITE_; verifica env de desenvolvimento, módulo transformado e bundles com/sem domínio.
- scripts/check-ui.mjs: fixture atualizada para o novo estado de sucesso.
- docs/revisao-frete.md: este registro.

## Resultado

`npm test`: 73 testes, 73 aprovados, 0 falhas, 0 cancelados, 0 ignorados, 0 pendentes. Inclui 32 testes novos em relação aos 41 anteriores. Navegador utilizado: Edge headless. Os testes de geocodificação e rotas usam respostas simuladas.

`npm run build`: aprovado (Vite 7.3.6, 32 módulos). Não há acesso ao provider no bundle. Marcadores de secrets não aparecem nos bundles, nem nas variáveis/módulos expostos pelo Vite, nem nas respostas públicas testadas.

Teste adicional com Wrangler 4.131.0 / Worker local real e proxy Vite: requisição válida sem secrets retorna 503/unavailable; entrada inválida retorna 400/address_review_required; origem HTTP externa retorna 403/unavailable. Nenhuma publicação executada.

Fórmula preservada: (ida real + volta real) / 14,4 × 6,20. Caso de regressão: 12,5 km + 15 km = 27,5 km; 1.184 centavos após conversão monetária para centavos. Sem margem, mínimo ou arredondamento comercial.

## Limites antes da publicação

Secrets e rota real conhecida ainda precisam ser validados no ambiente de destino. A origem genérica pode não atender à precisão exigida: atualizar somente o secret com endereço completo. A política conservadora pode rejeitar endereços reais sem metadados suficientes, inclusive s/n sem correspondência no provedor; nesse caso o WhatsApp continua disponível. Confiança numérica não comprova sozinha a localização física. Cobertura e quota do provedor continuam sendo dependências externas.
