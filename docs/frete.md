# Frete por CEP

O frontend envia somente `{cep: "70000000"}` a /api/delivery. Frontend e Worker validam oito dígitos, aceitando máscara e recusando sequências repetidas, letras e comprimento incorreto.

O Worker valida o CEP no ViaCEP, geocodifica o endereço e a origem privada no Mapbox e consulta as rotas de carro no Mapbox Directions.

O destino precisa ter endereço do DF retornado pelo ViaCEP e coordenadas válidas no Mapbox associadas ao mesmo CEP. Se nenhum resultado do Mapbox trouxer o CEP solicitado, o Worker não informa um valor automático e encaminha para confirmação pelo WhatsApp. A origem geocodificada só é usada quando fica até 5 km do ponto público de referência do Condomínio RK. Fora desse raio, o cálculo usa esse ponto de referência para evitar uma rota curta a partir de uma localização incorreta. Como o CEP representa uma área e o ponto do RK não é a casa exata, o frete continua aproximado.

A origem textual vem de DELIVERY_ORIGIN; a chave é MAPBOX_ACCESS_TOKEN. VEHICLE_KM_PER_LITER, FUEL_PRICE e DELIVERY_TRIP_MODE continuam privados/configurados no Worker. Fórmula: distância faturável / consumo * preço do combustível, arredondada em centavos; round-trip consulta ida e volta independentemente. A fórmula cobre apenas combustível.

Resposta pública contém somente CEP/DF, distâncias, centavos, modo e aviso de estimativa. Nunca retorna rótulo bruto, origem ou coordenadas. Falhas preservam {status,error}; logs internos registram apenas categoria fixa, nunca CEP, endereço, chave ou stack.

Timeout do Worker: 18 segundos compartilhados; cliente: 22 segundos. Alterar CEP cancela a consulta, limpa estimativa e ignora resposta antiga. Botão desabilitado e guarda de requisição pendente impedem duplicatas. Não há cache persistente nem persistência de CEP.

São 5 chamadas externas no modo ida/volta: ViaCEP, destino, origem, ida, volta (4 em one-way). Sem evidência real de latência não reduzimos os timeouts.

Antes de produção: validar credenciais e cobertura com CEPs públicos conhecidos do DF e comparar distância representativa. Testes simulados não comprovam cobertura real do provedor. CEP identifica uma região; valor final depende da confirmação da Nanda no WhatsApp.

Configuração do domínio: [dominio.md](dominio.md). .dev.vars e .env permanecem ignorados; exemplos não contêm valores privados.
