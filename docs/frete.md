# Frete por CEP

O frontend envia somente `{cep: "70000000"}` a /api/delivery. Frontend e Worker validam oito dígitos, aceitando máscara e recusando sequências repetidas, letras e comprimento incorreto.

O Worker consulta /pelias/v1/search em api.heigit.org com text contendo CEP formatado e Brasil, boundary.country=BR, size=5 e lang=pt-BR. Parâmetros documentados em https://github.com/pelias/documentation/blob/master/search.md. Nenhum serviço foi trocado.

Destino exige CEP retornado correspondente, Brasil/DF, coordenadas válidas, confiança >=0,90 e ausência de concorrente próximo em confiança. Aceita camada postalcode (inclusive centroide), street, address ou venue com CEP correspondente. Não exige número nem precisão de imóvel. A origem privada continua exigindo address/venue, point e exact.

A origem vem somente de DELIVERY_ORIGIN; a chave de OPENROUTESERVICE_API_KEY. VEHICLE_KM_PER_LITER, FUEL_PRICE e DELIVERY_TRIP_MODE continuam privados/configurados no Worker. Fórmula: distância faturável / consumo * preço do combustível, arredondada em centavos; round-trip consulta ida e volta independentemente.

Resposta pública contém somente CEP/DF, distâncias, centavos, modo e aviso de estimativa. Nunca retorna rótulo bruto, origem ou coordenadas. Falhas preservam {status,error}; logs internos registram apenas categoria fixa, nunca CEP, endereço, chave ou stack.

Timeout do Worker: 18 segundos compartilhados; cliente: 22 segundos. Alterar CEP cancela a consulta, limpa estimativa e ignora resposta antiga. Botão desabilitado e guarda de requisição pendente impedem duplicatas. Não há cache persistente nem persistência de CEP.

São 4 chamadas externas no modo ida/volta: destino, origem, ida, volta (3 em one-way). Sem evidência real de latência não reduzimos os timeouts.

Antes de produção: validar credenciais e cobertura com CEPs públicos conhecidos do DF e comparar distância representativa. Testes simulados não comprovam cobertura real do provedor. CEP identifica uma região; valor final depende da confirmação da Nanda no WhatsApp.

Configuração do domínio: [dominio.md](dominio.md). .dev.vars e .env permanecem ignorados; exemplos não contêm valores privados.
