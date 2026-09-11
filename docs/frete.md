# Frete: configuração e limites da validação

## Caminho implementado

React → POST /api/delivery → Cloudflare Worker → openrouteservice Pelias → openrouteservice Directions → distância rodoviária → custo de combustível.

`OPENROUTESERVICE_API_KEY` e `DELIVERY_ORIGIN` são lidas somente pelo Worker. O cliente não informa preço, consumo, origem ou chave. A resposta contém o endereço de destino reconhecido, distância de ida, distância total usada e valor em centavos. Não retorna origem, chave, coordenadas da origem ou respostas completas do provedor. Não registra endereços no analytics.

O endereço ou CEP é consultado com o número. Um CEP genérico não basta: origem e destino exigem confiança >= 0,90, camada address ou venue, accuracy=point, match_type=exact, coordenadas válidas e identificação administrativa do DF/Brasil. O número retornado para o destino deve coincidir com o informado. Resultados sem esses metadados são recusados. Complemento acompanha o WhatsApp; não altera a rota.

Preservamos a ordem do provedor: não promovemos outro resultado para contornar incerteza. Se qualquer concorrente tiver confiança ausente ou diferença menor que 0,10 em relação ao primeiro (inclusive empate ou pontuação superior), não calculamos. A mesma regra vale para a origem. Esses limites são uma política conservadora, não uma garantia estatística. Em dúvida, não calcular.

Fórmula: (quilômetros da rota / km por litro) × preço por litro. Em round-trip, são consultadas separadamente as rotas de ida e volta, sem presumir distâncias iguais. Não há taxa mínima, margem, pedágio ou combustível presumidos.

## Configuração local

Copie `.env.example` para `.env` somente para SITE_URL. Copie `.dev.vars.example` para `.dev.vars` e preencha os secrets do Worker. Execute `npm run build`, depois `npx wrangler dev --local --ip 127.0.0.1 --port 8787`. Em outro terminal execute `npm run dev`. O Vite apenas faz proxy de /api para o Worker, nunca importa o handler nem consulta o provedor. A exposição automática de variáveis ao cliente está desabilitada, inclusive VITE_. Sem Worker local, a resposta é unavailable com orientação ao WhatsApp. `npm run preview` serve somente assets.

## Cloudflare

O arquivo `wrangler.jsonc` prepara Worker + assets de `dist/` na mesma origem. A publicação ainda não foi executada.

1. Crie uma chave do openrouteservice/HeiGIT para Pelias e Directions.
2. Faça `npm run build` e configure a conta Cloudflare no Wrangler.
3. Prepare os secrets `OPENROUTESERVICE_API_KEY` (chave real) e `DELIVERY_ORIGIN` (endereço completo confirmado pela Nandices, incluindo rua/quadra, número/lote, condomínio, Sobradinho/DF e CEP). Não use a origem genérica nem prefixo VITE_. Não envie esses valores por chat nem os grave no repositório.
4. Prepare `VEHICLE_KM_PER_LITER` e `FUEL_PRICE` após aprovação da Maria Fernanda: 14.4 e 6.20 são propostas, não valores automaticamente aprovados. Use ponto decimal, sem unidades ou R$. `DELIVERY_TRIP_MODE=round-trip` mantém ida + volta. Os dois parâmetros comerciais foram retirados dos defaults do Wrangler; sem preenchimento o frete fica indisponível com WhatsApp. `keep_vars: true` preserva variáveis do painel em futuras publicações via Wrangler. O cálculo continua sem margem, taxa mínima ou arredondamento comercial.
5. Para testar localmente com Wrangler, use `.dev.vars` (ignorado no Git) e `npx wrangler dev`. Para publicação autorizada, `npx wrangler deploy`.
6. Verifique uma rota real conhecida e o orçamento; configure limites de uso adequados no provedor antes de disponibilizar o cálculo ao público.

`SITE_URL` é usado no build do frontend, não basta configurá-lo apenas em runtime no Worker. Pode ser omitido durante desenvolvimento.

### Passo a passo no painel (para executar quando a atualização do ambiente for autorizada)

1. Workers & Pages → selecionar o Worker correto → Settings → Variables and Secrets → Add.
2. Adicionar os dois primeiros nomes como tipo Secret, com seus valores reais; consumo e gasolina como Text, após aprovação; modo como Text = round-trip. São bindings de runtime do Worker, não variáveis de build do Vite.
3. Conferir o Worker/ambiente selecionado. Staging deve ser isolado da produção e ter seus próprios bindings. Não foi criado ou publicado um ambiente de staging nesta etapa.
4. A ação de salvar/aplicar pode exigir Deploy. Como a publicação ainda não está autorizada, parar antes de qualquer Save and deploy/Deploy. `wrangler secret put` também cria e publica uma versão: não executar agora. Preparar os valores em armazenamento privado até a autorização.
5. Quando autorizado a ativar staging, aplicar a configuração e seguir [o checklist](staging-frete.md). Não promover para produção nesta etapa.

### Quota e rate limit

O Worker já trata qualquer resposta não-2xx, inclusive 429, como HTTP 502 com `{status: "unavailable", error: "Não conseguimos calcular o frete automaticamente. Consulte a entrega pelo WhatsApp."}`. Não devolve corpo/headers privados do provedor, não apresenta estimativa parcial e não faz retries automáticos. Localização incerta continua em address_review_required, com WhatsApp.

No painel da conta HeiGIT/openrouteservice, conferir a chave e os limites efetivos de Pelias e Directions (por minuto, por dia e saldo de uso), registrando data da conferência. Não inferir a quota da conta a partir de um plano público. Uma estimativa completa usa duas geocodificações e duas rotas. Não esgotar a quota deliberadamente para testar; 429 é coberto com simulação. A quota real desta conta ainda não foi verificada por falta de acesso/chave. Referências: [quota do openrouteservice](https://openrouteservice.org/faq/) e [secrets do Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/).

## Falhas e validação

Sem qualquer parâmetro obrigatório, retorna 503 com consulta pelo WhatsApp; não tenta chamar o provedor. Falhas de rede, quota, rota inexistente ou timeout têm fallback, sem impedir encomendas. Alterar o endereço ou escolher retirada cancela a requisição em andamento e remove o valor anterior.

Todas as falhas de /api/delivery retornam somente `{status, error}`, sem dados parciais. Endereço inválido, impreciso, ambíguo ou fora do DF: status `address_review_required` (HTTP 400/422) com “Não conseguimos confirmar esse endereço com segurança. Revise os dados informados ou consulte a entrega pelo WhatsApp.” Falhas do provedor: `unavailable` (502); configuração ausente: 503. Sucesso inclui status `estimated`, destino, distâncias, centavos, modo e aviso de confirmação. O frontend recusa respostas sem estado de sucesso, mesmo com preço parcial.

A origem inicial pode ser recusada por ser ampla. Nesse caso, atualizar somente o secret com o endereço completo e validar uma rota conhecida antes da publicação. Testes simulados não comprovam a cobertura real do provedor. Critérios baseados na [documentação de qualidade do Pelias](https://github.com/pelias/documentation/blob/master/result_quality.md).

Testes executados com respostas simuladas, endereços e números exclusivamente de teste. A integração real depende das credenciais, parâmetros e publicação. Nenhum preço mostrado em teste é usado como valor padrão de produção.

Referências técnicas verificadas: [HeiGIT API](https://api.heigit.org/), [openrouteservice Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/), [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) e [Worker com assets](https://developers.cloudflare.com/workers/static-assets/binding/).
