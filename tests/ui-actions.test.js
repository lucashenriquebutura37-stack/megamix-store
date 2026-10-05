const test=require('node:test'),assert=require('node:assert/strict');
const {parseAction}=require('../ui-actions');
test('delegated actions preserve typed arguments and selected element',()=>{
  const el={id:'button'};assert.deepEqual(parseAction('selectSub("Cabos, USB",this)',el),{name:'selectSub',args:['Cabos, USB',el]});
  assert.deepEqual(parseAction('change(123,-1)'),{name:'change',args:[123,-1]});
  assert.deepEqual(parseAction("toggleCoupon(1,false)"),{name:'toggleCoupon',args:[1,false]});
  assert.deepEqual(parseAction("openArea('Audiologia — Acessórios e Componentes')"),{name:'openArea',args:['Audiologia — Acessórios e Componentes']});
  assert.deepEqual(parseAction('toggleCart()'),{name:'toggleCart',args:[]});
});
test('delegated actions reject executable expressions and unlisted functions',()=>{
  for(const source of ['alert(1)','fetch("/api")','add(1);checkout()','add(window.x)','add(1,)','add({x:1})','toggleCart.constructor("alert(1)")()'])assert.throws(()=>parseAction(source),source);
});
