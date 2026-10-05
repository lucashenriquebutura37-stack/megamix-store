const base='https://vorzeli.com.br';
async function check(path,{fetchImpl=fetch,now=Date.now,retryDelayMs=5000}={}){
  const url=base+path;let last;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetchImpl(url,{signal:AbortSignal.timeout(20000),redirect:'error',cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      if(path==='/'){
        if(!(await response.text()).includes('VORZELI'))throw new Error('Storefront content missing');
        console.log(path+': OK');return;
      }
      const body=await response.json();
      const timestamp=Date.parse(body.timestamp);
      if(!Number.isFinite(timestamp)||Math.abs(now()-timestamp)>120000)throw new Error('Missing or stale endpoint timestamp');
      if(path==='/healthz'&&body.status!=='ok')throw new Error('Unexpected health status');
      if(path==='/api/status'&&!['ok','warning'].includes(body.status))throw new Error('Readiness degraded');
      console.log(path+': OK');return;
    }catch(error){last=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,retryDelayMs));}
  }
  throw new Error(path+': '+last.message);
}
if(require.main===module)Promise.allSettled(['/','/healthz','/api/status'].map(path=>check(path))).then(results=>{
  for(const result of results)if(result.status==='rejected'){console.error(new Date().toISOString()+' '+base+result.reason.message);process.exitCode=1;}
});
module.exports={check};
