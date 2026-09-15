export const routeMetadata={
 '/':{title:'Nandices Confeitaria | Bolos e doces artesanais no DF',description:'Bolos, brigadeiros e Caixa Degustação feitos com ingredientes selecionados. Conheça a Nandices, em Sobradinho, com entregas em todo o DF. Encomendas pelo WhatsApp.'},
 '/docinhos':{title:'Docinhos e Brigadeiros | Nandices Confeitaria',description:'Conheça os 12 sabores de brigadeiros da Nandices, as forminhas e a Caixa Degustação. Consulte pelo WhatsApp.'},
 '/frete':{title:'Consulta de frete no DF | Nandices Confeitaria',description:'Consulte a estimativa de entrega da Nandices pelo CEP. Frete e retirada combinados diretamente com a Nanda.'},
};

export function pageMetadataHtml(html,path,origin){
 path=Object.hasOwn(routeMetadata,path)?path:'/';
 const meta=routeMetadata[path]||routeMetadata['/'];
 return html.replace(/<title>[^<]*<\/title>/,`<title>${meta.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/,`$1${meta.title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/,`$1${meta.description}`)
  .replace(/(<link rel="canonical" href=")[^"]*/,`$1${origin}${path}`)
  .replace(/(<meta property="og:url" content=")[^"]*/,`$1${origin}${path}`);
}
