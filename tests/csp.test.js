const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('HTML uses external executable scripts and inert event metadata',()=>{
  for(const name of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){
    const html=fs.readFileSync(name,'utf8');
    assert.doesNotMatch(html,/<script\s*>/i,name);
    assert.doesNotMatch(html,/<style\b/i,name);
    assert.doesNotMatch(html,/(?<![\w-])on(?:click|change|input)\s*=/i,name);
    assert.doesNotMatch(html,/(?<![\w-])style\s*=/i,name);
    for(const match of html.matchAll(/<script\b[^>]*src="([^"]+)"/g))assert.ok(fs.existsSync(match[1].split('?')[0]),name+' missing '+match[1]);
  }
});
test('enforced CSP has no inline or eval escape hatches',()=>{
  const server=fs.readFileSync('server.js','utf8');const policy=server.match(/setHeader\("Content-Security-Policy","([^"]+)"\)/)[1];
  assert.doesNotMatch(policy,/unsafe-inline|unsafe-eval|\*/);assert.match(policy,/script-src 'self'; style-src 'self';/);
});
