import React from 'react';

export default function ExpandableSection({id,titleId,title,label,className,open,onToggle,children}){
 return <section id={id} className={`section ${className} expandable`} aria-labelledby={titleId}>
  <p className="eyebrow">{label}</p>
  <h2 id={titleId} tabIndex="-1"><button type="button" className="expandable-toggle" aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}><span>{title}</span><span className="expandable-action" aria-hidden="true">{open?'Fechar':'Abrir'} <span className="expandable-icon">{open?'−':'+'}</span></span></button></h2>
  <div id={`${id}-panel`} className={`expandable-panel${open?' is-open':''}`} inert={!open} aria-hidden={!open}>
   <div className="expandable-clip"><div className="expandable-content">{children}</div></div>
  </div>
 </section>;
}
