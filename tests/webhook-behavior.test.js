const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('server.js','utf8');
const route=source.slice(source.indexOf('app.post(["/api/mercadopago/webhook"'),source.indexOf('app.get("/api/admin/dashboard"'));
function harness(initial={}){
  let handler,snapshot;const state={order:{id:1,status:'pending',stock_reserved:true,stock_reduced:false,coupon_code:'SAVE',coupon_released:false,total:20,...initial},stock:6,couponUses:1,emails:0,events:0,released:0};
  const client={release:()=>state.released++,query:async(sql,args=[])=>{
    if(sql==='BEGIN'){snapshot=structuredClone(state);return {rows:[]};}
    if(sql==='ROLLBACK'){Object.assign(state,snapshot);return {rows:[]};}
    if(sql.startsWith('SELECT * FROM orders'))return {rows:[{...state.order}]};
    if(sql.startsWith('SELECT * FROM order_items'))return {rows:[{product_id:1,quantity:2}]};
    if(sql.startsWith('UPDATE products SET stock=stock+'))state.stock+=args[0];
    if(sql.startsWith('UPDATE products SET stock=stock-')){if(state.stock<args[0])return {rows:[]};state.stock-=args[0];return {rows:[{id:1}]};}
    if(sql.startsWith("UPDATE orders SET status='paid'"))Object.assign(state.order,{status:'paid',stock_reserved:false,stock_reduced:true});
    if(sql.startsWith('UPDATE orders SET stock_reduced=FALSE'))Object.assign(state.order,{stock_reserved:false,stock_reduced:false});
    if(sql.startsWith('UPDATE coupons SET uses='))state.couponUses=Math.max(0,state.couponUses-1);
    if(sql.startsWith('UPDATE orders SET coupon_released=TRUE'))state.order.coupon_released=true;
    if(sql.startsWith('UPDATE orders SET status=$1'))state.order.status=args[0];
    if(sql.startsWith('INSERT INTO order_events'))state.events++;
    return {rows:[]};
  }};
  let payment;
  vm.runInNewContext(route,{app:{post:(path,fn)=>handler=fn},process:{env:{MP_ACCESS_TOKEN:'fixture'}},pool:{connect:async()=>client},fetch:async()=>({ok:true,json:async()=>payment}),externalSignal:()=>undefined,validMercadoPagoSignature:()=>true,clean:(v)=>String(v||''),moneyCents:v=>Math.round(Number(v)*100),safeError:()=> 'error',console:{log:()=>{},error:()=>{},warn:()=>{}},sendPaymentConfirmationEmail:async()=>state.emails++});
  return {state,call:async(status,extra={})=>{payment={id:123,status,external_reference:'VZ-fixture',transaction_amount:20,currency_id:'BRL',payer:{email:'fixture@example.com'},...extra};const res={headersSent:false,sendStatus(code){this.code=code;this.headersSent=true;return this;}};await handler({query:{'data.id':'123'},body:{},headers:{}},res);return res.code;}};
}
test('approved webhook consumes reserved stock once and sends one email',async()=>{
  const h=harness();assert.equal(await h.call('approved'),200);assert.equal(await h.call('approved'),200);assert.equal(h.state.stock,6);assert.equal(h.state.order.status,'paid');assert.equal(h.state.emails,1);assert.equal(h.state.events,1);assert.equal(h.state.released,2);
});
test('unpaid cancellation restores stock and coupon only once',async()=>{
  const h=harness();assert.equal(await h.call('cancelled'),200);assert.equal(await h.call('cancelled'),200);assert.equal(h.state.stock,8);assert.equal(h.state.couponUses,0);assert.equal(h.state.order.coupon_released,true);
});
test('delayed rejection or pending notification cannot downgrade a paid order',async()=>{
  const h=harness({status:'paid',stock_reserved:false,stock_reduced:true});assert.equal(await h.call('rejected'),200);assert.equal(await h.call('pending'),200);assert.equal(h.state.order.status,'paid');assert.equal(h.state.stock,6);assert.equal(h.state.couponUses,1);
});
test('wrong amount or currency cannot approve a payment',async()=>{
  for(const extra of [{transaction_amount:1},{currency_id:'USD'},{transaction_amount:undefined}]){const h=harness();assert.equal(await h.call('approved',extra),409);assert.equal(h.state.order.status,'pending');assert.equal(h.state.emails,0);assert.equal(h.state.stock,6);}
});
