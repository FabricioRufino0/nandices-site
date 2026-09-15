import React from 'react';
import {createWhatsAppLink,orderMessage,track} from '../lib/orders.js';
export default function WA({children,message=orderMessage,event='whatsapp_header',className='button',onClick,...data}){
 if(data.cta_location==='personalizados')return <a className={className} href="/docinhos">Conhecer personalizados <span aria-hidden="true">↗</span></a>;
 return <a className={className} href={createWhatsAppLink(message)} target="_blank" rel="noopener noreferrer" onClick={eventObject=>{track(event,data);onClick?.(eventObject)}}>{children} <span aria-hidden="true">↗</span></a>;
}
