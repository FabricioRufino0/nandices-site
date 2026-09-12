import React from 'react';
import {createWhatsAppLink,orderMessage,track} from '../lib/orders.js';
export default function WA({children,message=orderMessage,event='whatsapp_header',className='button',onClick,...data}){
 return <a className={className} href={createWhatsAppLink(message)} target="_blank" rel="noopener noreferrer" onClick={eventObject=>{track(event,data);onClick?.(eventObject)}}>{children} <span aria-hidden="true">↗</span></a>;
}
