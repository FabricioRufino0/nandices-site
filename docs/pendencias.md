# Pendências após o briefing de ajustes

## Frete real

- Fornecer GOOGLE_MAPS_API_KEY como secret do Worker; habilitar Geocoding API e Routes API no projeto Google com faturamento.
- Fornecer DELIVERY_ORIGIN como secret, preservando o endereço residencial fora do frontend.
- Definir VEHICLE_KM_PER_LITER e FUEL_PRICE.
- Definir DELIVERY_TRIP_MODE: one-way (ida) ou round-trip (ida + volta). Não há padrão presumido.
- Publicar o build junto ao Worker na Cloudflare e validar uma rota real após configuração. Nenhum serviço foi publicado nesta atualização.

## Identidade e publicação

- Receber o logo oficial separado. A abertura usa a assinatura tipográfica existente, sem produtos. As fotos do pacote v4 já foram integradas; o bolo de doce de leite com amendoim está fora do catálogo por enquanto.
- Definir o domínio final em SITE_URL. Localmente permanece opcional.
- Conectar um destino de analytics caso se deseje coletar os eventos preparados no dataLayer.

## Comercial

- Antecedência de encomendas comuns e de bolos personalizados confirmada pelo WhatsApp; nenhum mínimo de 24h foi presumido.

As pendências anteriores de frutas vermelhas, Cajuzinho, preço/peso mínimo dos bolos, composição dos brigadeiros, meio cento e antecedência da Caixa Degustação foram resolvidas pelo novo briefing. Doces personalizados: 50 unidades e 45 dias. Caixa Degustação: 7 dias. Bolos personalizados não herdam os 45 dias.
