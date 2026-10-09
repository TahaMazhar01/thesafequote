import assert from 'node:assert/strict';
const base=new URL(process.argv[2]||'');
assert.equal(base.protocol,'https:','Supply the deployed HTTPS origin.');
for(const path of ['/','/contact','/blog','/api/health','/robots.txt','/sitemap.xml']){
 const response=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200,`${path} must return 200`);
 assert.ok(response.headers.get('strict-transport-security'),`${path}: HSTS missing`);
 assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 const text=await response.text();
 if(path==='/robots.txt'){assert.ok(text.includes('Disallow: /admin'));assert.ok(text.includes(base.origin+'/sitemap.xml'));assert.ok(!/^Disallow: \/\s*$/m.test(text),'Production is still blocked from indexing');}
 if(path==='/sitemap.xml'){assert.ok(!text.includes('/admin'));assert.ok(!text.includes('localhost')&&!text.includes('127.0.0.1'));assert.ok(text.includes(base.origin+'/contact'));}
 console.log(`PASS ${path}`);
}
const denied=await fetch(new URL('/api/admin/leads',base),{signal:AbortSignal.timeout(15000)});assert.equal(denied.status,401);console.log('PASS anonymous admin access denied');
