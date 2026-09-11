# Frete: configuração e limites da validação

## Caminho implementado

React → POST /api/delivery → Cloudflare Worker → Google Geocoding → Google Routes → distância rodoviária → custo de combustível.

Chave e origem são lidas somente pelo servidor. O cliente não informa preço, consumo, origem ou chave. A resposta contém o endereço de destino reconhecido, distância de ida, distância usada no cálculo, modo e valor em centavos. Não retorna origem, chave, coordenadas da origem ou respostas completas do Google. Não registra endereços no analytics.

Um CEP é resolvido em logradouro antes de geocodificar logradouro + número. Se o CEP for genérico, o endereço for ambíguo ou o destino não estiver no DF, o cliente recebe orientação para corrigir ou consultar pelo WhatsApp. Complemento acompanha a consulta no WhatsApp; não altera a rota geográfica.

Fórmula: (quilômetros da rota / km por litro) × preço por litro. Em round-trip, são consultadas separadamente as rotas de ida e volta, sem presumir distâncias iguais. Não há taxa mínima, margem, pedágio ou combustível presumidos.

## Configuração local

Copie `.env.example` para `.env` e preencha somente valores confirmados. `npm run dev` oferece o endpoint local por middleware do Vite com a mesma função do Worker. Reinicie o servidor após mudar o arquivo. `npm run preview` serve somente os assets; para ensaio integral do Worker, use Wrangler conforme abaixo.

## Cloudflare

O arquivo `wrangler.jsonc` prepara Worker + assets de `dist/` na mesma origem. A publicação ainda não foi executada.

1. Habilite Geocoding API e Routes API no projeto Google; configure faturamento e restrições da chave para essas APIs.
2. Faça `npm run build` e configure a conta Cloudflare no Wrangler.
3. Cadastre `GOOGLE_MAPS_API_KEY` e `DELIVERY_ORIGIN` por `npx wrangler secret put NOME_DA_VARIAVEL` ou pelo painel de secrets do Worker. Não use prefixo VITE_.
4. Cadastre `VEHICLE_KM_PER_LITER`, `FUEL_PRICE` e `DELIVERY_TRIP_MODE` nas variáveis do Worker. Números usam ponto decimal; modo deve ser `one-way` ou `round-trip`.
5. Para testar localmente com Wrangler, use `.dev.vars` (ignorado no Git) e `npx wrangler dev`. Para publicação autorizada, `npx wrangler deploy`.
6. Verifique uma rota real conhecida e o orçamento; configure limites de uso adequados no provedor antes de disponibilizar o cálculo ao público.

`SITE_URL` é usado no build do frontend, não basta configurá-lo apenas em runtime no Worker. Pode ser omitido durante desenvolvimento.

## Falhas e validação

Sem qualquer parâmetro obrigatório, retorna 503 com consulta pelo WhatsApp; não tenta chamar Google. Falhas de rede, quota, rota inexistente ou timeout têm fallback, sem impedir encomendas. Alterar o endereço ou escolher retirada cancela a requisição em andamento e remove o valor anterior.

Testes executados com respostas simuladas, endereços e números exclusivamente de teste. A integração real depende das credenciais, parâmetros e publicação. Nenhum preço mostrado em teste é usado como valor padrão de produção.

Referências técnicas verificadas: [Google Geocoding](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding), [Google Routes](https://developers.google.com/maps/documentation/routes/compute_route_directions), [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) e [Worker com assets](https://developers.cloudflare.com/workers/static-assets/binding/).
