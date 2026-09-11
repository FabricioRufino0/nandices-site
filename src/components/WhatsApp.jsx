import React from 'react';
import {createWhatsAppLink,orderMessage,track} from '../lib/orders.js';
export default function WA({children,message=orderMessage,event='whatsapp_header',className='button',onClick,...data}){
 return <a className={className} href={createWhatsAppLink(message)} target="_blank" rel="noopener noreferrer" onClick={eventObject=>{track(event,data);if(data.cta_location==='bolos'||data.cta_location==='catalogo'){eventObject.preventDefault();document.getElementById('entrega')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}onClick?.(eventObject)}}>{children} <span aria-hidden="true">↗</span></a>;
}
