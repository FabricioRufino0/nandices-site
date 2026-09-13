import React from 'react';
import imageMetadata from '../data/imageMetadata.json';

export function Photo({product,className='',hero=false}) {
 const dimensions=imageMetadata[product.image]||{width:960,height:960};
 return <img className={className} src={`${product.image}-480.webp`} srcSet={dimensions.width<320?undefined:`${product.image}-320.webp 320w, ${product.image}-480.webp 480w, ${product.image}-960.webp 960w`} sizes={hero||!product.image.includes('/brigadeiros/')?'(max-width:760px) 90vw, 45vw':'(max-width:520px) calc(100vw - 44px), (max-width:900px) 45vw, 380px'} width={dimensions.width} height={dimensions.height} alt={`${product.name} da Nandices Confeitaria`} loading={hero?'eager':'lazy'} fetchPriority={hero?'high':'auto'}/>;
}
export function ProductDescription({text}) {
 const highlights=/(Leite Ninho|Nutella|geleia caseira de (?:frutas vermelhas|morango|maracujá)|doce de leite Itambé|cacau 50%|pistache em grãos|açúcar cristal maçaricado|redução caseira de maracujá)/gi;
 return <p className="product-description">{text.split(highlights).map((part,i)=>i%2?<strong key={i}>{part}</strong>:part)}</p>;
}
export default function ProductCard({product,selected,onToggle}) {
 return <article className={selected?'is-selected':''}>
  <div className="product-image"><Photo product={product}/></div>
  <div className="product-meta"><span>{product.category}</span><span>≈ 16 g</span></div>
  <h3>{product.name}</h3><ProductDescription text={product.description}/>
  {onToggle?<button className="select-sweet" type="button" aria-pressed={selected} aria-label={`${selected?'Remover':'Adicionar'} ${product.name} ${selected?'da':'à'} encomenda`} onClick={()=>onToggle(product.id)}><span aria-hidden="true">{selected?'✓':'+'}</span>{selected?'Na sua encomenda · remover':'Adicionar à encomenda'}</button>:<a className="text-link" href="/docinhos">Conhecer os sabores <span aria-hidden="true">↗</span></a>}
 </article>;
}
