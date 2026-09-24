export const routeMetadata={
 '/':{title:'Nandices Confeitaria | Bolos e doces artesanais no DF',description:'Bolos, brigadeiros e Caixa Degustação feitos com ingredientes selecionados. Conheça a Nandices, em Sobradinho, com entregas em todo o DF. Encomendas pelo WhatsApp.',image:'/images/brand/hero-nandices-1280.webp'},
 '/docinhos':{title:'Docinhos e Brigadeiros | Nandices Confeitaria',description:'Conheça os 12 sabores de brigadeiros da Nandices e as opções de forminhas. Consulte pelo WhatsApp.',image:'/images/docinhos/docinhos-hero.webp'},
 '/estimativa':{title:'Quanto pedir de bolo e docinhos? | Nandices Confeitaria',description:'Veja uma estimativa de bolo e docinhos para sua comemoração. Quantidades e valores finais são confirmados pela Nandices.'},
 '/caixa-degustacao':{title:'Caixa Degustação | Nandices Confeitaria',description:'Prove os 12 sabores da Nandices em uma Caixa Degustação com 12 unidades. Valor de R$ 65,00 e antecedência mínima de 7 dias.',image:'/images/products/degustacao/caixa-catalogo-azul.webp'},
 '/personalizados':{title:'Docinhos personalizados | Nandices Confeitaria',description:'Brigadeiros e outros doces personalizados para sua comemoração. Pedido mínimo de 50 unidades e antecedência mínima de 45 dias.',image:'/images/products/personalizados/docinhos-personalizados-futebol-960.webp'},
 '/frete':{title:'Consulta de frete no DF | Nandices Confeitaria',description:'Consulte a estimativa de entrega da Nandices pelo CEP. Frete e retirada combinados diretamente com a Nanda.'},
};

export function pageMetadataHtml(html,path,origin){
 path=Object.hasOwn(routeMetadata,path)?path:'/';
 const meta=routeMetadata[path]||routeMetadata['/'];
 return html.replace(/<title>[^<]*<\/title>/,`<title>${meta.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/,`$1${meta.title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<meta property="og:image" content=")[^"]*/,(_,prefix)=>`${prefix}${origin}${meta.image||routeMetadata['/'].image}`)
  .replace(/(<link rel="canonical" href=")[^"]*/,`$1${origin}${path}`)
  .replace(/(<meta property="og:url" content=")[^"]*/,`$1${origin}${path}`);
}
