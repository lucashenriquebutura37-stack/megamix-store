(function(root){
  'use strict';
  const allowed=new Set(['applyCoupon','calculateShipping','checkout','clearCatalogFilters','closeArea','openArea','render','renderMenu','showAll','toggleCart','toggleMenu','clearForm','createCoupon','createTestOrder','loadCoupons','loadDashboard','loadOrders','loadQuestions','loadReviews','loginAdmin','logoutAdmin','renderList','renderOrders','saveQuestion','saveReview','testEmail','testShipping','toggleCoupon','toggleOrderHistory','updateShipping','go','add','buyNow','change','chooseShipping','openProductDetails','openRelatedProduct','sendProductQuestion','sendProductReview','shareProduct','toggleFavorite','selectDetail','selectSub','scrollToSection','closeProductDialog']);
  function parseAction(source,element){
    const match=String(source).match(/^([A-Za-z][A-Za-z0-9]*)\(([\s\S]*)\)$/);
    if(!match||!allowed.has(match[1]))throw new Error('Unsupported action');
    const values=[];let current='',quote='',escaped=false;
    for(const char of match[2]){
      if(escaped){current+=char;escaped=false;continue;}
      if(quote&&char==='\\'){current+=char;escaped=true;continue;}
      if(quote){current+=char;if(char===quote)quote='';continue;}
      if(char==='"'||char==="'"){quote=char;current+=char;continue;}
      if(char===','){values.push(current.trim());current='';continue;}
      current+=char;
    }
    if(quote||escaped)throw new Error('Invalid arguments');
    if(current.trim())values.push(current.trim());else if(values.length)throw new Error('Invalid arguments');
    const args=values.map(value=>{
      if(value==='this')return element;
      if(value==='true'||value==='false')return value==='true';
      if(/^-?\d+(?:\.\d+)?$/.test(value)){const n=Number(value);if(Number.isFinite(n))return n;}
      if(/^"(?:[^"\\]|\\.)*"$/.test(value))return JSON.parse(value);
      if(/^'(?:[^'\\]|\\['\\])*'$/.test(value))return value.slice(1,-1).replace(/\\(['\\])/g,'$1');
      throw new Error('Invalid argument');
    });
    return {name:match[1],args};
  }
  function applyStyles(node){
    if(node.nodeType!==1)return;
    const elements=node.hasAttribute('data-style')?[node,...node.querySelectorAll('[data-style]')]:[...node.querySelectorAll('[data-style]')];
    for(const element of elements){element.style.cssText=element.getAttribute('data-style');element.removeAttribute('data-style');}
  }
  if(typeof module!=='undefined')module.exports={parseAction};
  if(!root.document)return;
  root.scrollToSection=id=>{if(['areas','productSection','testSection'].includes(id))root.document.getElementById(id)?.scrollIntoView({behavior:'smooth'});};
  root.closeProductDialog=()=>root.document.getElementById('productDetailsDialog')?.close();
  applyStyles(root.document.documentElement);
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)applyStyles(node);}).observe(root.document.documentElement,{childList:true,subtree:true});
  for(const type of ['click','input','change'])root.document.addEventListener(type,event=>{
    const element=event.target.closest?.('[data-on'+type+']');
    if(!element||element.disabled)return;
    try{const action=parseAction(element.getAttribute('data-on'+type),element);const fn=root[action.name];if(typeof fn!=='function')throw new Error('Unavailable action');Promise.resolve(fn.apply(element,action.args)).catch(()=>console.error('Não foi possível concluir a ação.'));}
    catch{console.error('Não foi possível executar a ação.');}
  });
})(typeof window==='undefined'?{}:window);
