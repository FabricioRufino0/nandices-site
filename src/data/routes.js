export const routeMetadata={
 '/':{title:'Nandices Confeitaria | Bolos e doces artesanais no DF',description:'Bolos e brigadeiros artesanais em Sobradinho, com entrega no DF. Conheça a Nandices e consulte encomendas pelo WhatsApp.',image:'/images/brand/hero-nandices-1280.webp'},
 '/docinhos':{title:'Docinhos e Brigadeiros | Nandices Confeitaria',description:'Conheça os 12 sabores de brigadeiros da Nandices e as opções de forminhas para sua festa. Consulte disponibilidade pelo WhatsApp.',image:'/images/docinhos/docinhos-hero.webp'},
 '/estimativa':{title:'Quanto pedir de bolo e docinhos? | Nandices Confeitaria',description:'Veja uma estimativa de bolo e docinhos para sua comemoração. Quantidades e valores finais são confirmados pela Nandices.'},
 '/caixa-degustacao':{title:'Caixa Degustação | Nandices Confeitaria',description:'Prove os 12 sabores da Nandices em uma Caixa Degustação com 12 unidades. Valor de R$ 65,00 e antecedência mínima de 7 dias.',image:'/images/products/degustacao/caixa-catalogo-azul.webp'},
 '/personalizados':{title:'Docinhos personalizados | Nandices Confeitaria',description:'Brigadeiros e outros doces personalizados para sua comemoração. Pedido mínimo de 50 unidades e antecedência mínima de 45 dias.',image:'/images/products/personalizados/docinhos-personalizados-futebol-960.webp'},
 '/frete':{title:'Consulta de frete no DF | Nandices Confeitaria',description:'Consulte pelo CEP a estimativa de entrega da Nandices no Distrito Federal. A Nanda confirma frete, retirada e detalhes pelo WhatsApp.'},
};

// Update only when route content or metadata receives a significant change.
export const sitemapLastmod='2026-10-09';

export function sitemapXml(origin){
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(routeMetadata).map(path=>`  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${sitemapLastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
}

function setNamedMeta(html,name,content){
 const pattern=new RegExp(`(<meta name="${name}" content=")[^"]*`);
 return pattern.test(html)?html.replace(pattern,(_match,prefix)=>`${prefix}${content}`):html.replace('</head>',`<meta name="${name}" content="${content}"/></head>`);
}

export function pageMetadataHtml(html,path,origin){
 path=Object.hasOwn(routeMetadata,path)?path:'/';
 const meta=routeMetadata[path]||routeMetadata['/'];
 html=setNamedMeta(html,'twitter:card','summary_large_image');
 html=setNamedMeta(html,'twitter:title',meta.title);
 html=setNamedMeta(html,'twitter:description',meta.description);
 html=setNamedMeta(html,'twitter:image',`${origin}${meta.image||routeMetadata['/'].image}`);
 return html.replace(/<title>[^<]*<\/title>/,`<title>${meta.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/,`$1${meta.title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<meta property="og:image" content=")[^"]*/,(_,prefix)=>`${prefix}${origin}${meta.image||routeMetadata['/'].image}`)
  .replace(/(<link rel="canonical" href=")[^"]*/,`$1${origin}${path}`)
  .replace(/(<meta property="og:url" content=")[^"]*/,`$1${origin}${path}`);
}
