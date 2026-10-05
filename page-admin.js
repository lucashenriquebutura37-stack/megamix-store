
const $=id=>document.getElementById(id);
let adminProducts=[];
let adminConnected=false;
let adminOrders=[];
function status(t,ok=true){$("status").textContent=t;$("status").style.color=ok?"#198754":"#c0392b"}
function setupCategories(){
 $("c").innerHTML='<option value="">Selecione</option>'+areas.map(a=>'<option>'+a.name+'</option>').join("");
 $("c").addEventListener("change",()=>{
   const a=areas.find(x=>x.name===$("c").value);
   $("sub").innerHTML='<option value="">Selecione</option>'+(a?a.subs.map(x=>'<option>'+x[0]+'</option>').join(""):"");
 });
}
async function loginAdmin(){
 const typed=$("password").value;
 if(!typed){status("Digite a senha administrativa.",false);return;}
 try{
  const r=await fetch("/api/admin/auth",{method:"POST",headers:{"x-admin-password":typed,"x-admin-otp":$("otp").value}});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"Senha administrativa inválida.");
  adminConnected=true;setTimeout(loadDashboard,0);$("password").value="";$("otp").value="";$("loginBox").style.display="none";$("adminConnected").style.display="flex";
  status("Administrador conectado.");await loadProducts();await loadOrders();
 }catch(e){$("password").value="";$("otp").value="";status(e.message,false)}
}
async function logoutAdmin(){try{await fetch("/api/admin/logout",{method:"POST"});}catch{}$("ordersList").innerHTML='<div class="panel">Entre como administrador para visualizar pedidos.</div>';adminConnected=false;$("password").value="";$("otp").value="";$("loginBox").style.display="flex";$("adminConnected").style.display="none";status("Sessão administrativa encerrada.");}
async function loadProducts(){
 try{const r=await fetch("/api/produtos");adminProducts=await r.json();renderList();status("Catálogo carregado.");}
 catch(e){status("Erro ao carregar catálogo.",false)}
}

async function testShipping(){
 if(!adminConnected){status("Entre como administrador primeiro.",false);return}
 const fs=$("freightStatus"),box=$("freightResults"),cep=$("fCep").value.replace(/\D/g,"");
 fs.textContent="Consultando Melhor Envio...";fs.style.color="#5f636b";box.innerHTML="";
 try{
  const r=await fetch("/api/admin/frete-teste",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postal_code:cep,weight_kg:$("fWeight").value,length_cm:$("fLength").value,width_cm:$("fWidth").value,height_cm:$("fHeight").value})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erro na cotação.");
  fs.textContent="Integração funcionando • ambiente: "+d.environment;fs.style.color="#198754";
  box.innerHTML=d.quotes?.length?d.quotes.map(q=>'<div class="order"><b>'+esc(q.company?q.company+" • ":"")+esc(q.name)+'</b><div class="orderItems">R$ '+Number(q.price).toFixed(2).replace(".",",")+(q.delivery_time?" • até "+Number(q.delivery_time)+" dias úteis":"")+'</div></div>').join(""):'<div class="order">A API respondeu, mas não retornou opções para esse CEP.</div>';
 }catch(e){fs.textContent=e.message;fs.style.color="#c0392b";}
}
async function testEmail(){
 if(!adminConnected){status("Entre como administrador primeiro.",false);return}
 const el=$("emailTestStatus"),email=$("emailTestTo").value.trim();
 if(!email){el.textContent="Digite o e-mail que receberá o teste.";el.style.color="#c0392b";$("emailTestTo").focus();return}
 el.textContent="Enviando e-mail de teste...";el.style.color="#5f636b";
 try{
  const r=await fetch("/api/admin/email-teste",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Falha no envio.");
  el.textContent="✓ "+d.message;el.style.color="#198754";
 }catch(e){el.textContent=e.message;el.style.color="#c0392b"}
}
async function createTestOrder(){
 if(!adminConnected){$("testOrderStatus").textContent="Entre como administrador primeiro.";$("testOrderStatus").style.color="#c0392b";return}
 const tos=$("testOrderStatus");tos.textContent="Criando pedido de teste...";tos.style.color="#5f636b";
 const cep=$("tCep").value.replace(/\D/g,"");
 const customer={name:$("tName").value,phone:$("tPhone").value,postalCode:cep,address:$("tAddress").value,number:$("tNumber").value,extra:$("tExtra").value,neighborhood:$("tNeighborhood").value,city:$("tCity").value,state:$("tState").value.toUpperCase()};
 try{
  const r=await fetch("/api/admin/pedido-teste",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao criar teste.");
  tos.textContent="Pedido de teste criado: "+d.order_id;tos.style.color="#198754";await loadOrders();
 }catch(e){tos.textContent=e.message;tos.style.color="#c0392b"}
}
(function setupTestCep(){
 const el=$("tCep");if(!el)return;let last="";
 async function lookup(){
  const cep=el.value.replace(/\D/g,"").slice(0,8);el.value=cep.length>5?cep.slice(0,5)+"-"+cep.slice(5):cep;
  if(cep.length!==8||cep===last)return;last=cep;
  try{const r=await fetch("https://viacep.com.br/ws/"+cep+"/json/");const d=await r.json();if(!r.ok||d.erro)throw 0;
   $("tAddress").value=d.logradouro||"";$("tNeighborhood").value=d.bairro||"";$("tCity").value=d.localidade||"";$("tState").value=d.uf||"";$("tNumber").focus();
  }catch{last="";status("CEP não encontrado. Você pode preencher manualmente.",false)}
 }
 el.addEventListener("input",()=>{const d=el.value.replace(/\D/g,"").slice(0,8);el.value=d.length>5?d.slice(0,5)+"-"+d.slice(5):d;if(d.length===8)lookup();else last=""});
 el.addEventListener("blur",lookup);
})();
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderOrders(){
 const q=($("orderSearch")?.value||"").toLowerCase(),filter=$("orderFilter")?.value||"";
 let data=adminOrders.filter(o=>{
   const hay=[o.public_id,o.customer_name,o.customer_phone,o.city,o.state,o.shipping_company,o.shipping_service_name].join(" ").toLowerCase();
   const matchQ=!q||hay.includes(q);
   const shippingFilters=["preparando","enviado","entregue","cancelado"]; const matchF=!filter||(filter==="test"?!!o.is_test:filter==="needs_tracking"?o.shipping_status==="enviado"&&!o.tracking_code:shippingFilters.includes(filter)?o.shipping_status===filter:o.status===filter);
   return matchQ&&matchF;
 });
 const sort=$("orderSort")?.value||"newest";data=[...data].sort((a,b)=>sort==="oldest"?new Date(a.created_at)-new Date(b.created_at):sort==="highest"?Number(b.total||0)-Number(a.total||0):sort==="lowest"?Number(a.total||0)-Number(b.total||0):new Date(b.created_at)-new Date(a.created_at));
 const paid=adminOrders.filter(o=>o.status==="paid"&&!o.is_test), revenue=paid.reduce((a,o)=>a+Number(o.total||0),0);
 const readyToShip=paid.filter(o=>o.shipping_status==="preparando").length,missingTracking=paid.filter(o=>o.shipping_status==="enviado"&&!o.tracking_code).length;
 const metrics=$("orderMetrics");if(metrics)metrics.querySelector(".orderItems").textContent=adminOrders.length+" pedidos • "+paid.length+" pagos • "+readyToShip+" para enviar • "+missingTracking+" sem rastreio • "+revenue.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" em vendas";
 const lowStock=adminProducts.filter(p=>Number(p.stock)>0&&Number(p.stock)<=5).length,outStock=adminProducts.filter(p=>Number(p.stock)===0).length;if($("stockMetrics"))$("stockMetrics").textContent=adminProducts.length+" produtos • "+lowStock+" com estoque baixo • "+outStock+" sem estoque";
 if($("orderSummary"))$("orderSummary").textContent=data.length+" exibidos de "+adminOrders.length+" pedidos";
 const box=$("ordersList");
 box.innerHTML=data.length?data.map(o=>{
   const lines=(o.items||[]).map(i=>esc(i.quantity)+"× "+esc(i.name)).join("<br>");
   const label=o.is_test?"PEDIDO DE TESTE":(o.status==="paid"?"PAGO":String(o.status).toUpperCase());
   const shipLabels={aguardando_pagamento:"Aguardando pagamento",preparando:"Preparando",enviado:"Enviado",entregue:"Entregue",cancelado:"Cancelado"};
   const address=[o.address_line,o.address_number,o.address_extra,o.neighborhood,o.city,o.state,o.postal_code].filter(Boolean).map(esc).join(" • ");
   return '<div class="order"><div class="orderHead"><div><b>'+esc(o.public_id)+'</b><br><small>'+new Date(o.created_at).toLocaleString("pt-BR")+'</small></div><div><b>R$ '+Number(o.total).toFixed(2).replace(".",",")+'</b><br><strong class="'+(o.status==="paid"?"paid":"pending")+'">'+esc(label)+'</strong></div></div><div class="orderItems">'+lines+'</div>'+(o.customer_name?'<div class="orderItems"><b>'+esc(o.customer_name)+'</b> • '+esc(o.customer_phone||"")+'<br>'+address+'</div>':'')+'<div class="orderItems"><b>Entrega:</b> '+esc(shipLabels[o.shipping_status]||o.shipping_status||"—")+(o.shipping_service_name?'<br><b>Frete:</b> '+esc(o.shipping_company?o.shipping_company+" • ":"")+esc(o.shipping_service_name)+' • R$ '+Number(o.shipping_price||0).toFixed(2).replace(".",",")+(o.shipping_delivery_time?' • até '+Number(o.shipping_delivery_time)+' dias úteis':''):'')+(o.tracking_code?'<br><b>Rastreio:</b> '+esc(o.tracking_code):'')+(o.coupon_code?'<br><b>Cupom:</b> '+esc(o.coupon_code)+' • desconto '+Number(o.discount_amount||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):'')+'</div><div class="actions"><select id="ship-'+esc(o.public_id)+'"><option value="aguardando_pagamento">Aguardando pagamento</option><option value="preparando">Preparando</option><option value="enviado">Enviado</option><option value="entregue">Entregue</option><option value="cancelado">Cancelado</option></select><input id="track-'+esc(o.public_id)+'" placeholder="Código de rastreio" value="'+esc(o.tracking_code||"")+'"><button class="primary" type="button" data-onclick="updateShipping(\''+esc(o.public_id)+'\')">Atualizar envio</button><button class="secondary" type="button" data-onclick="toggleOrderHistory(\''+esc(o.public_id)+'\')">Histórico</button></div><div id="history-'+esc(o.public_id)+'" class="orderItems" data-style="display:none"></div></div>';
 }).join(""):'<div class="panel">Nenhum pedido encontrado.</div>';
 data.forEach(o=>{const sel=$("ship-"+o.public_id);if(sel)sel.value=o.shipping_status||"aguardando_pagamento"});
}
async function toggleOrderHistory(id){
 const box=$("history-"+id);if(!box)return;
 if(box.style.display!=="none"){box.style.display="none";return}
 box.style.display="block";box.innerHTML="<small>Carregando histórico...</small>";
 try{
  const r=await fetch("/api/pedidos/"+encodeURIComponent(id)+"/eventos");
  const events=await r.json();if(!r.ok)throw new Error(events.error||"Erro ao carregar histórico.");
  box.innerHTML=events.length?'<div data-style="margin-top:10px"><b>Histórico do pedido</b>'+events.map(e=>'<div data-style="padding:9px 0;border-bottom:1px solid #eee"><small>'+esc(new Date(e.created_at).toLocaleString("pt-BR"))+'</small><br>'+esc(e.detail||e.event_type)+'</div>').join("")+'</div>':'<small>Nenhum evento registrado ainda.</small>';
 }catch(e){box.innerHTML='<small>'+esc(e.message)+'</small>'}
}
async function loadCoupons(){
 if(!adminConnected){status("Entre como administrador primeiro.",false);return}
 const box=$("couponsList");
 try{const r=await fetch("/api/admin/cupons"),allRows=await r.json();if(!r.ok)throw new Error(allRows.error||"Erro ao carregar cupons.");const f=$("couponFilter")?.value||"",now=Date.now(),rows=allRows.filter(c=>!f||(f==="active"?c.active&&(!c.expires_at||new Date(c.expires_at).getTime()>now):f==="inactive"?!c.active:f==="expired"?c.expires_at&&new Date(c.expires_at).getTime()<=now:f==="exhausted"?Number(c.max_uses)>0&&Number(c.uses)>=Number(c.max_uses):true));box.innerHTML=rows.length?rows.map(c=>'<div class="order"><b>'+esc(c.code)+'</b><div class="orderItems">'+(c.discount_type==="percent"?Number(c.discount_value)+"%":"R$ "+Number(c.discount_value).toFixed(2).replace(".",","))+' • mínimo R$ '+Number(c.min_order||0).toFixed(2).replace(".",",")+' • usos '+Number(c.uses||0)+(Number(c.max_uses)>0?"/"+Number(c.max_uses):"")+' • '+(c.expires_at&&new Date(c.expires_at).getTime()<=Date.now()?"EXPIRADO":(Number(c.max_uses)>0&&Number(c.uses)>=Number(c.max_uses)?"ESGOTADO":(c.active?"ATIVO":"INATIVO")))+(c.expires_at?' • validade '+new Date(c.expires_at).toLocaleString("pt-BR"):"")+'</div><div class="actions"><button class="secondary" type="button" data-onclick="toggleCoupon('+c.id+','+(!c.active)+')">'+(c.active?"Desativar":"Ativar")+'</button></div></div>').join(""):'<div class="panel">Nenhum cupom cadastrado.</div>';$("couponsSection").scrollIntoView({behavior:"smooth"});}catch(e){box.innerHTML='<div class="panel">'+esc(e.message)+'</div>'}
}
async function createCoupon(){
 try{const body={code:$("couponAdminCode").value,discount_type:$("couponAdminType").value,discount_value:$("couponAdminValue").value,min_order:$("couponAdminMin").value,max_uses:$("couponAdminMax").value,expires_at:$("couponAdminExpires").value||null};const r=await fetch("/api/admin/cupons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao criar cupom.");status("Cupom criado.");await loadCoupons();}catch(e){status(e.message,false)}
}
async function toggleCoupon(id,active){
 try{const r=await fetch("/api/admin/cupons/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao atualizar cupom.");await loadCoupons();}catch(e){status(e.message,false)}
}
async function loadReviews(){
 if(!adminConnected){status("Entre como administrador primeiro.",false);return}
 const box=$("reviewsList");box.innerHTML='<div class="panel">Carregando avaliações...</div>';
 try{const r=await fetch("/api/admin/avaliacoes"),allRows=await r.json();if(!r.ok)throw new Error(allRows.error||"Erro ao carregar avaliações.");const f=$("reviewFilter")?.value||"",rows=allRows.filter(x=>!f||(f==="pending"?!x.approved:!!x.approved));box.innerHTML=rows.length?rows.map(x=>'<div class="order"><b>'+esc(x.product_name)+'</b><div class="orderItems"><strong>'+esc(x.customer_name||"Cliente")+'</strong> • '+esc(x.public_id)+'<br>'+"★".repeat(Number(x.rating))+"☆".repeat(5-Number(x.rating))+' • Compra verificada<br>'+esc(x.comment||"Sem comentário")+'</div><div class="actions"><label><input id="review-'+x.id+'" type="checkbox" '+(x.approved?"checked":"")+'> Publicar avaliação</label><button class="primary" type="button" data-onclick="saveReview('+x.id+')">Salvar</button></div></div>').join(""):'<div class="panel">Nenhuma avaliação recebida.</div>';$("reviewsSection").scrollIntoView({behavior:"smooth"});}catch(e){box.innerHTML='<div class="panel">'+esc(e.message)+'</div>'}
}
async function saveReview(id){
 try{const r=await fetch("/api/admin/avaliacoes/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({approved:$("review-"+id).checked})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao salvar.");status("Avaliação atualizada.");await loadReviews();await loadProducts();}catch(e){status(e.message,false)}
}
async function loadQuestions(){
 if(!adminConnected){status("Entre como administrador primeiro.",false);return}
 const box=$("questionsList");box.innerHTML='<div class="panel">Carregando perguntas...</div>';
 try{
  const r=await fetch("/api/admin/perguntas"),allRows=await r.json();if(!r.ok)throw new Error(allRows.error||"Erro ao carregar perguntas.");const f=$("questionFilter")?.value||"",rows=allRows.filter(q=>!f||(f==="unanswered"?!q.answer:f==="pending"?!q.approved:!!q.approved));
  box.innerHTML=rows.length?rows.map(q=>'<div class="order"><b>'+esc(q.product_name)+'</b><div class="orderItems"><strong>'+(q.customer_name?esc(q.customer_name):"Cliente")+'</strong>: '+esc(q.question)+'</div><div class="grid" data-style="margin-top:10px"><div class="full"><label>Resposta da VORZELI</label><textarea id="qa-'+q.id+'" rows="3" maxlength="1200">'+esc(q.answer||"")+'</textarea></div></div><div class="actions"><label><input id="approve-'+q.id+'" type="checkbox" '+(q.approved?"checked":"")+'> Publicar pergunta</label><button class="primary" type="button" data-onclick="saveQuestion('+q.id+')">Salvar resposta</button></div></div>').join(""):'<div class="panel">Nenhuma pergunta recebida.</div>';
  $("questionsSection").scrollIntoView({behavior:"smooth"});
 }catch(e){box.innerHTML='<div class="panel">'+esc(e.message)+'</div>'}
}
async function saveQuestion(id){
 try{
  const r=await fetch("/api/admin/perguntas/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:$("qa-"+id).value,approved:$("approve-"+id).checked})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao salvar.");
  status("Pergunta atualizada.");await loadQuestions();
 }catch(e){status(e.message,false)}
}
async function loadDashboard(){
 if(!adminConnected)return;
 try{const r=await fetch("/api/admin/dashboard"),d=await r.json();if(!r.ok)throw new Error(d.error||"Erro");
  $("mRevenue").textContent=Number(d.revenue||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});$("mAverageTicket").textContent=Number(d.average_ticket||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});$("mDiscounts").textContent=Number(d.discounts_total||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});$("mRevenue30").textContent=Number(d.revenue_30d||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});$("mPaid30").textContent=Number(d.paid_orders_30d||0)+" pedido(s) pago(s)";
  $("mPaid").textContent=d.paid_orders??0;$("mOrders").textContent=d.total_orders??0;$("mProducts").textContent=d.total_products??0;
  $("catalogQualityMetrics").textContent=Number(d.missing_image||0)+" sem imagem • "+Number(d.missing_sku||0)+" sem SKU • "+Number(d.missing_shipping_dimensions||0)+" sem dimensões completas";$("mCancelled").textContent=d.cancelled_orders??0;$("fulfillmentMetrics").textContent=Number(d.preparing_orders||0)+" preparando • "+Number(d.shipped_orders||0)+" enviados • "+Number(d.delivered_orders||0)+" entregues";$("mLowStock").textContent=d.low_stock??0;$("mOutStock").textContent=d.out_of_stock??0;$("mPendingOrders").textContent=d.pending_orders??0;$("mPending").textContent=Number(d.pending_questions||0)+Number(d.pending_reviews||0);
  $("dashboardUpdated").textContent="Atualizado às "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});$("topProducts").innerHTML=(d.top_products||[]).length?(d.top_products||[]).map(x=>'<div class="orderItems"><strong>'+esc(x.product_name)+'</strong><br>'+x.units_sold+' unidade(s) • '+Number(x.paid_orders||0)+' pedido(s) • '+Number(x.gross_sales||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+'</div>').join(""):'<small>Nenhuma venda paga ainda.</small>';
  $("topCoupons").innerHTML=(d.top_coupons||[]).length?(d.top_coupons||[]).map(x=>'<div class="orderItems"><strong>'+esc(x.code)+'</strong><br>'+x.uses+' uso(s) • '+(x.active?'Ativo':'Inativo')+'</div>').join(""):'<small>Nenhum cupom cadastrado.</small>';
  $("lowStockItems").innerHTML=(d.low_stock_items||[]).length?(d.low_stock_items||[]).map(x=>'<div class="orderItems"><strong>'+esc(x.n)+'</strong><br>Estoque: '+Number(x.stock||0)+(x.sku?' • SKU '+esc(x.sku):'')+'</div>').join(""):'<small>Nenhum produto com estoque baixo.</small>';
 }catch(e){console.warn("Dashboard:",e.message)}
}
async function loadOrders(){
 if(!adminConnected)return;
 try{
  const r=await fetch("/api/pedidos",{headers:{}});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"Erro ao carregar pedidos.");
  adminOrders=data;$("orderTools").style.display="block";renderOrders();
  $("ordersSection").scrollIntoView({behavior:"smooth"});
 }catch(e){status(e.message,false)}
}
async function updateShipping(id){
 try{
  const sel=$("ship-"+id), track=$("track-"+id);
  const r=await fetch("/api/pedidos/"+encodeURIComponent(id)+"/envio",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({shipping_status:sel.value,tracking_code:track.value})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao atualizar envio.");
  status("Envio atualizado.");await loadOrders();
 }catch(e){status(e.message,false)}
}
function safeAdminImage(v){try{const u=new URL(String(v||""));return (u.protocol==="https:"||u.protocol==="http:")?u.href:""}catch{return ""}}
function renderList(){
 const q=($("productSearch")?.value||"").toLowerCase(),stockFilter=$("stockFilter")?.value||"";
 let products=adminProducts.filter(p=>{const hay=[p.n,p.c,p.sub,p.detail,p.sku,p.brand,...(p.tags||[])].join(" ").toLowerCase(),stock=Number(p.stock)||0;return (!q||hay.includes(q))&&(!stockFilter||(stockFilter==="out"?stock===0:stock<=5));}); const productSort=$("productSort")?.value||"name";products=[...products].sort((a,b)=>productSort==="stockAsc"?Number(a.stock)-Number(b.stock):productSort==="stockDesc"?Number(b.stock)-Number(a.stock):productSort==="priceDesc"?Number(b.p)-Number(a.p):String(a.n).localeCompare(String(b.n),"pt-BR"));
 if($("productSummary"))$("productSummary").textContent=products.length+" exibidos de "+adminProducts.length+" produtos";
 $("list").innerHTML=products.length?products.map(p=>{
  const img=safeAdminImage(p.i);
  return `
 <div class="item">
  ${img?'<img class="thumb" src="'+esc(img)+'" alt="">':'<div class="thumb"></div>'}
  <div class="meta"><b>${esc(p.n)}</b><small>${esc(p.c)} › ${esc(p.sub)} • R$ ${Number(p.p).toFixed(2).replace(".",",")} • estoque: ${Number(p.stock)||0}</small>${Number(p.stock)===0?'<small data-style="display:block;color:#c0392b;font-weight:800">SEM ESTOQUE</small>':Number(p.stock)<=5?'<small data-style="display:block;color:#b26a00;font-weight:800">ESTOQUE BAIXO</small>':''}</div>
  <div class="itemActions"><button class="secondary" data-edit="${Number(p.id)}">Editar</button><button class="danger" data-remove="${Number(p.id)}">Excluir</button></div>
 </div>`}).join(""):'<div class="panel">Nenhum produto cadastrado ainda.</div>';
 $("list").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editProduct(b.dataset.edit)));
 $("list").querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>removeProduct(b.dataset.remove)));
}
function editProduct(id){
 const p=adminProducts.find(x=>String(x.id)===String(id));if(!p)return;
 ["id","n","i","c","detail","stock","p","oldPrice","installments","shipping","weightKg","lengthCm","widthCm","heightCm","sku","brand","description"].forEach(k=>{if($(k))$(k).value=p[k]??""});if($("images"))$("images").value=(p.images||[]).join("\n");if($("featured"))$("featured").value=p.featured?"true":"false";$("variants").value=(p.variants||[]).map(v=>v.name+": "+v.value).join("\n");$("tags").value=(p.tags||[]).join(", ");
 $("c").dispatchEvent(new Event("change"));$("sub").value=p.sub||"";scrollTo({top:0,behavior:"smooth"});
}
function clearForm(){$("form").reset();$("id").value="";$("installments").value=10;$("stock").value=0;$("sub").innerHTML='<option value="">Selecione</option>'}
$("form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!adminConnected){status("Entre como administrador primeiro.",false);return;}
 const variantLines=$("variants").value.split(/\n/).map(x=>x.trim()).filter(Boolean);
 if(variantLines.length>30||variantLines.some(x=>x.indexOf(":")<1||!x.slice(x.indexOf(":")+1).trim())){status("Use até 30 linhas no formato Nome: Valor para as características.",false);return;}
 const variants=variantLines.map(x=>({name:x.slice(0,x.indexOf(":")).trim(),value:x.slice(x.indexOf(":")+1).trim()}));
 const tags=[...new Set($("tags").value.split(",").map(x=>x.trim()).filter(Boolean))];
 if(tags.length>10){status("Use até 10 etiquetas.",false);return;}
 const id=$("id").value;
 const body={n:$("n").value,i:$("i").value,c:$("c").value,sub:$("sub").value,detail:$("detail").value,stock:$("stock").value,p:$("p").value,oldPrice:$("oldPrice").value,installments:$("installments").value,shipping:$("shipping").value,weightKg:$("weightKg").value,lengthCm:$("lengthCm").value,widthCm:$("widthCm").value,heightCm:$("heightCm").value,sku:$("sku").value,brand:$("brand").value,description:$("description").value,images:$("images").value.split(/\n/).map(x=>x.trim()).filter(Boolean).slice(0,8),featured:$("featured").value==="true",variants,tags};
 try{
  const r=await fetch(id?"/api/produtos/"+id:"/api/produtos",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"Erro");
  status(id?"Produto atualizado.":"Produto cadastrado.");clearForm();await loadProducts();
 }catch(e){status(e.message,false)}
});
async function removeProduct(id){
 if(!confirm("Excluir este produto?"))return;
 try{const r=await fetch("/api/produtos/"+id,{method:"DELETE",headers:{}});const data=await r.json();if(!r.ok)throw new Error(data.error||"Erro");await loadProducts();status("Produto excluído.");}catch(e){status(e.message,false)}
}
async function restoreSession(){try{const r=await fetch('/api/admin/session');if(r.ok){adminConnected=true;document.getElementById('loginBox').style.display='none';document.getElementById('adminConnected').style.display='flex';await loadDashboard();await loadOrders();}}catch(e){}}
setupCategories();loadProducts();restoreSession();

