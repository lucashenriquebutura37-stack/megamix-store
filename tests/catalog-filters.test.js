const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('script.js','utf8');
const fn=source.slice(source.indexOf('function matchesCatalogFilters('),source.indexOf('function render()'));
const context=vm.createContext({});vm.runInContext(fn,context);
const product={p:10,oldPrice:15,brand:'Acme',stock:2};
const filters={min:'',max:'',brand:'',stock:false,offers:false};
test('catalog filters combine price, case-insensitive brand, stock and offer',()=>{
  assert.equal(context.matchesCatalogFilters(product,{...filters,min:'10',max:'10',brand:'AC',stock:true,offers:true}),true);
  for(const change of [{min:'11'},{max:'9'},{brand:'other'}])assert.equal(context.matchesCatalogFilters(product,{...filters,...change}),false);
  assert.equal(context.matchesCatalogFilters({...product,stock:0},{...filters,stock:true}),false);
  assert.equal(context.matchesCatalogFilters({...product,oldPrice:10},{...filters,offers:true}),false);
  assert.equal(context.matchesCatalogFilters(product,filters),true);
});
