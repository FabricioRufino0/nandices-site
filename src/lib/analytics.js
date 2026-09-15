import {routeMetadata} from '../data/routes.js';

let activeId='';
const fields=['cta_location','product_name','product_category','quantity','event_type','guests','cake_kg','quantity_min','quantity_max','estimated_value','distance_km','trip_mode','failure_kind'];
export const analyticsEvents=new Set(['whatsapp_header','whatsapp_bolo','whatsapp_degustacao','whatsapp_personalizado','whatsapp_product','whatsapp_sweets_estimate','whatsapp_cake_estimate','sweets_estimate_completed','cake_estimate_completed','freight_calculated','freight_calculation_failed','whatsapp_delivery','instagram_click']);
function command(){window.dataLayer.push(arguments)}
export function forwardAnalytics(event,data={}){
 if(!activeId||!analyticsEvents.has(event))return;
 const safe={};
 for(const key of fields)if(typeof data[key]==='string'||(typeof data[key]==='number'&&Number.isFinite(data[key])))safe[key]=data[key];
 command('event',event,safe);
}
export function initAnalytics(id){
 if(typeof window==='undefined'||activeId||!/^G-[A-Z0-9]+$/.test(id||''))return;
 activeId=id;
 window.dataLayer=window.dataLayer||[];
 command('js',new Date());
 const initialPath=location.pathname.replace(/\/$/,'')||'/';
 command('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+(Object.hasOwn(routeMetadata,initialPath)?initialPath:'/'),page_referrer:''});
 let previous='';
 const pageview=()=>{
  const path=location.pathname.replace(/\/$/,'')||'/';
  if(!Object.hasOwn(routeMetadata,path)||path===previous)return;
  const page={page_title:routeMetadata[path].title,page_location:location.origin+path,page_referrer:previous?location.origin+previous:''};
  command('set',page);
  command('event','page_view',page);
  previous=path;
 };
 // Current links load documents; also cover future History API navigation.
 for(const method of ['pushState','replaceState']){
  const original=history[method];
  history[method]=function(...args){const result=original.apply(this,args);pageview();return result};
 }
 window.addEventListener('popstate',pageview);
 pageview();
 const script=document.createElement('script');script.async=true;
 script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
 document.head.appendChild(script);
}
