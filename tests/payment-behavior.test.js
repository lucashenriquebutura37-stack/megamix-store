const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('server.js','utf8');
const context=vm.createContext({crypto,Buffer,process:{env:{MP_WEBHOOK_SECRET:'test-secret'}}});
vm.runInContext(source.slice(source.indexOf('function moneyCents('),source.indexOf('app.post("/api/criar-preferencia"')),context);
vm.runInContext(source.slice(source.indexOf('function validMercadoPagoSignature('),source.indexOf('app.post(["/api/mercadopago/webhook"')),context);
test('discount allocation preserves exact cents, quantities and input items',()=>{
  const items=[{id:'a',unit_price:19.99,quantity:3},{id:'b',unit_price:7.35,quantity:2}];
  for(const discount of [0,0.01,1.23,5,20]){
    const before=JSON.stringify(items),out=context.mercadoPagoItemsWithExactDiscount(items,discount);
    assert.equal(out.reduce((sum,x)=>sum+Math.round(x.unit_price*100)*x.quantity,0),7467-Math.round(discount*100));
    assert.equal(out.reduce((sum,x)=>sum+x.quantity,0),5);assert.ok(out.every(x=>x.unit_price>=0.01));assert.equal(JSON.stringify(items),before);
  }
  assert.throws(()=>context.mercadoPagoItemsWithExactDiscount(items,74.67));
});
test('webhook signature rejects tampered ID, malformed digest and absent secret',()=>{
  const digest=crypto.createHmac('sha256','test-secret').update('id:123;request-id:request;ts:100;').digest('hex');
  const req={query:{'data.id':'123'},headers:{'x-request-id':'request','x-signature':'ts=100,v1='+digest}};
  assert.equal(context.validMercadoPagoSignature(req,'123'),true);
  assert.equal(context.validMercadoPagoSignature({...req,query:{'data.id':'124'}},'124'),false);
  assert.equal(context.validMercadoPagoSignature({...req,headers:{'x-signature':'ts=100,v1=abc'}},'123'),false);
  delete context.process.env.MP_WEBHOOK_SECRET;assert.equal(context.validMercadoPagoSignature(req,'123'),false);
});
