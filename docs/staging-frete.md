# Checklist de staging — frete

Status: preparado, não executado. Sem publicação autorizada, chave real, origem completa e aprovação comercial, não iniciar testes externos. Nenhum endereço fictício deve ser registrado como teste real aprovado.

## Preparação

- [ ] Aprovação de Maria Fernanda para consumo e preço da gasolina, com data.
- [ ] Origem completa confirmada cadastrada somente como secret; conferir privadamente o ponto de saída. Nunca incluir origem/coordenadas em prints, respostas ou relatórios públicos.
- [ ] Chave real exclusiva do Worker; conferir acesso a Pelias e Directions em api.heigit.org.
- [ ] Registrar quotas e uso atual no painel autenticado do provedor; planejar até 2 geocodificações + 2 rotas por tentativa completa.
- [ ] Autorização específica para ativar staging, isolado da produção. Aplicar bindings nesse Worker; frontend e /api/delivery sob o mesmo domínio HTTPS.
- [ ] Executar npm test e npm run build antes da ativação autorizada.

## Matriz de endereços reais

Escolher endereços completos de entregas reais conhecidas pela Nandices, com autorização para teste, ou estabelecimentos públicos com endereço confirmado. Guardar os valores em registro privado, não neste repositório. Preencher rua/quadra, lote/número e CEP antes de testar; bairros abaixo não são endereços suficientes.

| Caso | Entrada a preparar e conferir | Resultado esperado |
|---|---|---|
| Sobradinho | Endereço completo real, próximo à origem | Estimativa apenas se ponto e número forem confirmados |
| Asa Norte | Quadra, bloco e número de endereço real | Mesmo critério, conferir entrada correta do bloco |
| Águas Claras | Rua, número e condomínio real | Mesmo critério, conferir acesso rodoviário |
| Gama | Quadra, conjunto e lote real | Mesmo critério, comparar rota conhecida |
| Ceilândia | Quadra, conjunto e lote real | Mesmo critério, verificar setor correto |
| Condomínio no DF | Endereço completo real com lote e portaria | Não aceitar centroide do condomínio como destino preciso |
| Condomínio incompleto | Mesmo local, omitindo lote ou quadra | Revisar endereço/WhatsApp, sem valor quando incerto |
| CEP genérico | CEP real que abrange região ampla | Não calcular a partir do centroide do CEP |
| Sem número | Local real informado como s/n | Aceitar somente se os metadados confirmarem; caso contrário WhatsApp |
| Ambiguidade | Endereço real incompleto com nomes repetidos | Sem estimativa quando houver concorrentes próximos |
| Inválido | Alterar deliberadamente dados do endereço conhecido | Sem estimativa se não confirmado |
| Fora do DF | Endereço real de município de Goiás | Revisar endereço/WhatsApp, sem cálculo |

Para cada caso registrar privadamente: identificador do teste, data, entrada, destino reconhecido, resultado/HTTP, distância de ida, distância total, valor e validação manual pela Nandices. Um endereço real rejeitado por falta de dados deve ser marcado como fallback, não como cálculo aprovado. Não afrouxar confiança para fazer o teste passar.

## Contrato e transporte

- [ ] DevTools/Network mostra somente POST HTTPS para /api/delivery na mesma origem; nenhuma chamada do navegador ao provider e nenhuma chave no request.
- [ ] Sucesso contém apenas status estimated, destino, distâncias, valor, modo e aviso. Conferir rota real de ida e volta separadamente: total / consumo aprovado × combustível aprovado, convertido em centavos.
- [ ] Confirmar ausência de origem, coordenadas de origem, chave e corpo completo do provider nas respostas, bundles e analytics.
- [ ] Origin externo recebe 403 e não recebe permissão CORS. Não habilitar wildcard CORS; site e Worker devem compartilhar origem HTTPS.
- [ ] Alterar endereço limpa o valor anterior. Fallback mantém CTA WhatsApp sem valor parcial.
- [ ] Testar indisponibilidade/quota em simulação controlada, nunca disparando volume para esgotar a conta. 429/5xx resultam em 502 unavailable e WhatsApp sem retries. Em falha real durante staging, registrar apenas status e momento, sem credenciais.
- [ ] Conferir contadores de uso do provedor antes/depois. A quota real não pode ser confirmada por mocks.
- [ ] Revisão final de Maria Fernanda antes de qualquer autorização de produção.
