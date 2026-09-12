# Domínio de produção

Definir no ambiente de build: `SITE_URL=https://nandicesconfeitaria.com.br`.
O Vite usa esta única variável para canonical, og:url, imagem Open Graph absoluta, JSON-LD e sitemap.xml. Sem a variável, o preview local não anuncia canonical de produção.

Na Cloudflare, configurar manualmente o Custom Domain sem www, DNS/TLS e redirecionamento permanente de www para o domínio principal, preservando caminho e query. Não basta definir SITE_URL no runtime do Worker: ela deve existir durante o build.

Secrets de runtime continuam no Worker: OPENROUTESERVICE_API_KEY e DELIVERY_ORIGIN. Parâmetros comerciais existentes permanecem inalterados. Nenhuma configuração externa foi executada nesta rodada.
