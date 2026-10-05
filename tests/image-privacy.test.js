const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {imagePrivacyAttributes}=require('../lib/image-privacy');
const source=fs.readFileSync('script.js','utf8');
const start=source.indexOf('function imagePrivacyAttributes('),end=source.indexOf('\nconst money',start);
const context={URL};vm.runInNewContext(source.slice(start,end),context);
test('verified image CDN loads anonymously in server and client',()=>{
  const value='https://acdn-us.mitiendanube.com/image.webp';
  assert.equal(imagePrivacyAttributes(value),' crossorigin="anonymous"');
  assert.equal(context.imagePrivacyAttributes(value),imagePrivacyAttributes(value));
});
test('other image providers retain their existing loading behavior',()=>{
  for(const value of ['/logo-vorzeli.png','https://example.com/image.webp','https://acdn-us.mitiendanube.com.evil.test/x','http://acdn-us.mitiendanube.com/x','invalid']){
    assert.equal(imagePrivacyAttributes(value),'');assert.equal(context.imagePrivacyAttributes(value),'');
  }
});
